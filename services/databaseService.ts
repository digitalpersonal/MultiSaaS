
import { supabase, isCloudEnabled } from './supabase';
import { User } from '../types';

/**
 * Obtém o companyId do usuário logado (do localStorage).
 * Retorna 'undefined' para SUPER_ADMIN, permitindo que as políticas de RLS no Supabase
 * concedam acesso total a este perfil.
 */
const getCurrentCompanyId = (): string | undefined => {
  const userString = localStorage.getItem('multiplus_user');
  if (userString) {
    try {
      const user: User = JSON.parse(userString);
      if (user.role !== 'SUPER_ADMIN') {
        return user.companyId;
      }
    } catch (e) {
      console.error("Erro ao processar dados do usuário:", e);
    }
  }
  return undefined;
};

/**
 * Serviço genérico de persistência que suporta fallback.
 * ESTA VERSÃO É COMPATÍVEL COM RLS (Row Level Security) no Supabase.
 */
export const databaseService = {
  /**
   * Busca dados, confiando no Supabase RLS para a segurança.
   */
  async fetch<T extends { id: string, companyId?: string }>(table: string, storageKey: string): Promise<T[]> {
    const companyId = getCurrentCompanyId();

    if (isCloudEnabled() && supabase) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) return data as T[];
        console.error(`Erro ao buscar dados do Supabase na tabela ${table}:`, error);
      } catch (e) {
        console.error("Exceção na conexão Cloud:", e);
      }
    }
    
    // Fallback para LocalStorage (mantém a filtragem do lado do cliente)
    const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (companyId) {
      if (table === 'tenants') {
         return localData.filter((item: T) => item.id === companyId);
      }
      return localData.filter((item: T) => item.companyId === companyId);
    }
    
    return localData;
  },

  /**
   * Salva um conjunto de dados. A política de INSERT/UPDATE no RLS validará a operação.
   */
  async save<T extends { id: string, companyId?: string }>(table: string, storageKey: string, data: T[]): Promise<void> {
    const companyId = getCurrentCompanyId();
    let dataToSave = data;

    if (companyId && table !== 'tenants' && table !== 'accounts') {
      dataToSave = data.map(item => ({ ...item, companyId: companyId }));
    }

    if (isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase.from(table).upsert(dataToSave, { onConflict: 'id' });
        if (error) {
          console.error(`Erro ao sincronizar ${table} no Supabase:`, error);
        }
      } catch (e) {
        console.error("Exceção ao salvar na Cloud:", e);
      }
    }
    
    let currentGlobalLocalData: T[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      currentGlobalLocalData = currentGlobalLocalData.filter(item => item.companyId !== companyId);
      localStorage.setItem(storageKey, JSON.stringify([...currentGlobalLocalData, ...dataToSave]));
    } else {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  },

  /**
   * Insere um item. A política de INSERT (RLS) validará a permissão.
   */
  async insertOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, item: T): Promise<void> {
    const companyId = getCurrentCompanyId();
    
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      item.companyId = companyId;
    }

    if (isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase.from(table).insert(item);
        if (error) {
          console.error(`Erro ao inserir item no Supabase na tabela ${table}:`, error);
        } else {
          const current = await databaseService.fetch<T>(table, storageKey);
          const updated = [item, ...current.filter(existingItem => existingItem.id !== item.id)];
          await databaseService.save<T>(table, storageKey, updated);
          return;
        }
      } catch (e) {
        console.error("Exceção ao inserir na Cloud:", e);
      }
    }
    
    const current = await databaseService.fetch<T>(table, storageKey);
    const updated = [item, ...current.filter((existingItem: T) => existingItem.id !== item.id)];
    await databaseService.save<T>(table, storageKey, updated);
  },

  /**
   * Atualiza um item. A política de UPDATE (RLS) validará a permissão.
   */
  async updateOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string, updates: Partial<T>): Promise<void> {
    if (isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase.from(table).update(updates).eq('id', itemId);
        if (error) {
          console.error(`Erro ao atualizar item no Supabase na tabela ${table}:`, error);
        } else {
          const current = await databaseService.fetch<T>(table, storageKey);
          const updated = current.map(item => item.id === itemId ? { ...item, ...updates } : item);
          await databaseService.save<T>(table, storageKey, updated);
          return;
        }
      } catch (e) {
        console.error("Exceção ao atualizar na Cloud:", e);
      }
    }

    const current = await databaseService.fetch<T>(table, storageKey);
    const updated = current.map((item: T) => item.id === itemId ? { ...item, ...updates } : item);
    await databaseService.save<T>(table, storageKey, updated);
  },

  /**
   * Deleta um item. A política de DELETE (RLS) validará a permissão.
   */
  async deleteOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string): Promise<void> {
    if (isCloudEnabled() && supabase) {
      try {
        const { error } = await supabase.from(table).delete().eq('id', itemId);
        if (error) {
          console.error(`Erro ao deletar item no Supabase na tabela ${table}:`, error);
        } else {
          const current = await databaseService.fetch<T>(table, storageKey);
          const updated = current.filter(item => item.id !== itemId);
          await databaseService.save<T>(table, storageKey, updated);
          return;
        }
      } catch (e) {
        console.error("Exceção ao deletar na Cloud:", e);
      }
    }

    const current = await databaseService.fetch<T>(table, storageKey);
    const updated = current.filter((item: T) => item.id !== itemId);
    await databaseService.save<T>(table, storageKey, updated);
  },

  async clearAll(tables: string[], storageKeys: string[]): Promise<void> {
    storageKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('multiplus_user');

    if (isCloudEnabled() && supabase) {
      for (const table of tables) {
        try {
          await supabase.from(table).delete().neq('id', 'NULL');
        } catch (e) {
          console.error(`Erro ao limpar a tabela Supabase ${table}:`, e);
        }
      }
    }
  }
};
