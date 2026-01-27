
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
    const user: User = JSON.parse(userString);
    if (user.role !== 'SUPER_ADMIN') {
      return user.companyId;
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
      // RLS-COMPLIANT: A query foi simplificada. O Supabase agora é responsável por filtrar
      // os dados com base no usuário autenticado. O filtro de companyId foi removido do cliente.
      const { data, error } = await supabase.from(table).select('*');
      
      if (!error && data) return data as T[];
      console.error(`Erro ao buscar dados do Supabase na tabela ${table}:`, error);
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
      const { error } = await supabase.from(table).upsert(dataToSave, { onConflict: 'id' });
      if (error) {
        console.error(`Erro ao sincronizar ${table} no Supabase:`, error);
        return; 
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
      const { error } = await supabase.from(table).insert(item);
      if (error) {
        console.error(`Erro ao inserir item no Supabase na tabela ${table}:`, error);
      } else {
        const current = await databaseService.fetch<T>(table, storageKey);
        const updated = [item, ...current.filter(existingItem => existingItem.id !== item.id)];
        await databaseService.save<T>(table, storageKey, updated);
        return;
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
      // RLS-COMPLIANT: O filtro de segurança de companyId foi removido.
      // A política de UPDATE (RLS) no Supabase irá garantir que o usuário só pode
      // atualizar os itens que lhe pertencem.
      const { error } = await supabase.from(table).update(updates).eq('id', itemId);

      if (error) {
        console.error(`Erro ao atualizar item no Supabase na tabela ${table}:`, error);
      } else {
        const current = await databaseService.fetch<T>(table, storageKey);
        const updated = current.map(item => item.id === itemId ? { ...item, ...updates } : item);
        await databaseService.save<T>(table, storageKey, updated);
        return;
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
      // RLS-COMPLIANT: Filtro de companyId removido. A política de DELETE (RLS)
      // no Supabase cuidará da segurança.
      const { error } = await supabase.from(table).delete().eq('id', itemId);

      if (error) {
        console.error(`Erro ao deletar item no Supabase na tabela ${table}:`, error);
      } else {
        const current = await databaseService.fetch<T>(table, storageKey);
        const updated = current.filter(item => item.id !== itemId);
        await databaseService.save<T>(table, storageKey, updated);
        return;
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
        const { error } = await supabase.from(table).delete().neq('id', 'NULL');
        if (error) console.error(`Erro ao limpar a tabela Supabase ${table}:`, error);
      }
    }
  }
};
