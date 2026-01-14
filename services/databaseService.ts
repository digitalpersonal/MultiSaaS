
import { supabase, isCloudEnabled } from './supabase';
import { User } from '../types';

/**
 * Obtém o companyId do usuário logado (do localStorage) para filtrar dados.
 * Em uma aplicação real, isso viria do contexto de autenticação do Supabase.
 */
const getCurrentCompanyId = (): string | undefined => {
  const userString = localStorage.getItem('multiplus_user');
  if (userString) {
    const user: User = JSON.parse(userString);
    if (user.role !== 'SUPER_ADMIN') { // SuperAdmin vê tudo, outros filtram por companyId
      return user.companyId;
    }
  }
  return undefined;
};

/**
 * Serviço genérico de persistência que suporta fallback
 */
export const databaseService = {
  async fetch<T extends { id: string, companyId?: string }>(table: string, storageKey: string): Promise<T[]> {
    const companyId = getCurrentCompanyId();

    if (isCloudEnabled() && supabase) {
      let query = supabase.from(table).select('*');

      if (companyId) {
        query = query.eq('companyId', companyId);
      }
      
      const { data, error } = await query;
      if (!error && data) return data as T[];
      console.error(`Erro ao buscar dados do Supabase na tabela ${table}:`, error);
    }
    
    // Fallback para LocalStorage
    const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    // Se há companyId, filtra localmente também para consistência
    return companyId ? localData.filter((item: T) => item.companyId === companyId) : localData;
  },

  async save<T extends { id: string, companyId?: string }>(table: string, storageKey: string, data: T[]): Promise<void> {
    const companyId = getCurrentCompanyId();
    let dataToSave = data;

    // Se é um usuário de empresa, garante que todos os itens tenham o companyId correto
    // Exceto para tabelas globais (tenants e accounts) gerenciadas pelo SuperAdmin
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      dataToSave = data.map(item => ({ ...item, companyId: companyId }));
    }

    if (isCloudEnabled() && supabase) {
      const { error } = await supabase.from(table).upsert(dataToSave, { onConflict: 'id' });
      if (error) {
        console.error(`Erro ao sincronizar ${table} no Supabase:`, error);
        // Se Supabase falhar, não atualiza localStorage para evitar dados inconsistentes
        // e permite que o fetch continue usando dados possivelmente antigos do localStorage.
        // Ou, em um cenário mais robusto, o erro seria propagado ou tratato com um alerta ao usuário.
        return; 
      }
    }
    
    // Atualiza o localStorage APÓS tentar o Supabase (ou se o Supabase não estiver habilitado).
    // O localStorage passa a ser um cache direto do que foi salvo (ou do que seria salvo).
    let currentGlobalLocalData: T[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      // Remove os itens antigos desta empresa antes de adicionar os novos dadosToSave
      currentGlobalLocalData = currentGlobalLocalData.filter(item => item.companyId !== companyId);
      localStorage.setItem(storageKey, JSON.stringify([...currentGlobalLocalData, ...dataToSave]));
    } else {
      // Para SuperAdmin ou tabelas globais (tenants, accounts), o localStorage é substituído pelos novos dados
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  },

  async insertOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, item: T): Promise<void> {
    const companyId = getCurrentCompanyId();
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      item.companyId = companyId;
    }

    // Primeiro tenta inserir no Supabase
    if (isCloudEnabled() && supabase) {
      const { error } = await supabase.from(table).insert(item);
      if (error) {
        console.error(`Erro ao inserir item no Supabase na tabela ${table}:`, error);
        // Fallback para localStorage se Supabase falhar
      } else {
        // Se Supabase teve sucesso, atualiza o localStorage para refletir o novo estado
        const current = await databaseService.fetch<T>(table, storageKey); // Obtém o estado atual (agora incluindo o Supabase)
        const updated = [item, ...current.filter(existingItem => existingItem.id !== item.id)]; // Adiciona o novo item, garantindo unicidade
        await databaseService.save<T>(table, storageKey, updated); // Salva a lista atualizada no localStorage (e tentará Supabase novamente, mas upsert tratará)
        return;
      }
    }
    
    // Fallback para localStorage (ou se Supabase falhou)
    const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = [item, ...current.filter((existingItem: T) => existingItem.id !== item.id)]; // Garante que não duplica no localStorage se já existia
    // A lógica de filtragem por companyId para localStorage já está no save() abaixo
    await databaseService.save<T>(table, storageKey, updated);
  },

  async updateOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string, updates: Partial<T>): Promise<void> {
    const companyId = getCurrentCompanyId();
    
    // Primeiro tenta atualizar no Supabase
    if (isCloudEnabled() && supabase) {
      let query = supabase.from(table).update(updates).eq('id', itemId);
      if (companyId && table !== 'tenants' && table !== 'accounts') {
        query = query.eq('companyId', companyId); // Garante que só atualiza itens da própria empresa
      }
      const { error } = await query;
      if (error) {
        console.error(`Erro ao atualizar item no Supabase na tabela ${table}:`, error);
        // Fallback para localStorage se Supabase falhar
      } else {
        // Se Supabase teve sucesso, atualiza o localStorage para refletir o novo estado
        const current = await databaseService.fetch<T>(table, storageKey); // Obtém o estado atual (agora incluindo o Supabase)
        const updated = current.map(item => item.id === itemId ? { ...item, ...updates } : item);
        await databaseService.save<T>(table, storageKey, updated); // Salva a lista atualizada no localStorage
        return;
      }
    }

    // Fallback para localStorage (ou se Supabase falhou)
    const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = current.map((item: T) => item.id === itemId ? { ...item, ...updates } : item);
    // A lógica de filtragem por companyId para localStorage já está no save() abaixo
    await databaseService.save<T>(table, storageKey, updated);
  },

  async deleteOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string): Promise<void> {
    const companyId = getCurrentCompanyId();

    // Primeiro tenta deletar no Supabase
    if (isCloudEnabled() && supabase) {
      let query = supabase.from(table).delete().eq('id', itemId);
      if (companyId && table !== 'tenants' && table !== 'accounts') {
        query = query.eq('companyId', companyId); // Garante que só deleta itens da própria empresa
      }
      const { error } = await query;
      if (error) {
        console.error(`Erro ao deletar item no Supabase na tabela ${table}:`, error);
        // Fallback para localStorage se Supabase falhar
      } else {
        // Se Supabase teve sucesso, atualiza o localStorage para refletir o novo estado
        const current = await databaseService.fetch<T>(table, storageKey); // Obtém o estado atual (agora incluindo o Supabase)
        const updated = current.filter(item => item.id !== itemId);
        await databaseService.save<T>(table, storageKey, updated); // Salva a lista atualizada no localStorage
        return;
      }
    }

    // Fallback para localStorage (ou se Supabase falhou)
    const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = current.filter((item: T) => item.id !== itemId);
    // A lógica de filtragem por companyId para localStorage já está no save() abaixo
    await databaseService.save<T>(table, storageKey, updated);
  },

  async clearAll(tables: string[], storageKeys: string[]): Promise<void> {
    // Clear LocalStorage
    storageKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('multiplus_user'); // Limpar usuário logado também

    // Clear Supabase
    if (isCloudEnabled() && supabase) {
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', 'NULL'); // Delete all records where id is not NULL (i.e., all records)
        if (error) console.error(`Erro ao limpar a tabela Supabase ${table}:`, error);
      }
    }
  }
};
