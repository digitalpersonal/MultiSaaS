
import { supabase, isCloudEnabled } from './supabase';
import { User, Company, UserRole, CompanyStatus, Customer, ServiceOrder, OSStatus } from '../types';

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
        if (table === 'tenants') {
          // Para a tabela de tenants, o ID da linha é o próprio companyId
          query = query.eq('id', companyId);
        } else {
          // Para outras tabelas (produtos, os, clientes, usuarios), filtra pela coluna companyId
          query = query.eq('companyId', companyId);
        }
      }
      
      const { data, error } = await query;
      if (!error && data) return data as T[];
      console.error(`Erro ao buscar dados do Supabase na tabela ${table}:`, error);
    }
    
    // Fallback para LocalStorage
    const localData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (companyId) {
      if (table === 'tenants') {
         return localData.filter((item: T) => item.id === companyId);
      }
      return localData.filter((item: T) => item.companyId === companyId);
    }
    
    return localData;
  },

  async save<T extends { id: string, companyId?: string }>(table: string, storageKey: string, data: T[]): Promise<void> {
    const companyId = getCurrentCompanyId();
    let dataToSave = data;

    // Se é um usuário de empresa, garante que todos os itens tenham o companyId correto
    // Exceto para tabelas globais (tenants e accounts) gerenciadas pelo SuperAdmin ou no cadastro
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
    
    // Atualiza o localStorage APÓS tentar o Supabase (ou se o Supabase não estiver habilitado).
    // O localStorage passa a ser um cache direto do que foi salvo.
    let currentGlobalLocalData: T[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      // Remove os itens antigos desta empresa antes de adicionar os novos dadosToSave
      currentGlobalLocalData = currentGlobalLocalData.filter(item => item.companyId !== companyId);
      localStorage.setItem(storageKey, JSON.stringify([...currentGlobalLocalData, ...dataToSave]));
    } else {
      // Para SuperAdmin ou tabelas globais, substitui ou atualiza de forma mais ampla.
      // No caso de tenants/accounts sendo salvos pelo SuperAdmin, dataToSave é a lista completa ou o item novo.
      // Se save() recebe a lista completa (comum neste app), apenas salvamos.
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  },

  async insertOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, item: T): Promise<void> {
    const companyId = getCurrentCompanyId();
    
    if (companyId && table !== 'tenants' && table !== 'accounts') {
      item.companyId = companyId;
    }

    // 1. Tenta persistir na nuvem
    if (isCloudEnabled() && supabase) {
      const { error } = await supabase.from(table).insert(item);
      if (error) {
        console.error(`Erro ao inserir item no Supabase na tabela ${table}:`, error);
        // Lança o erro para que a função chamadora (componente) possa tratá-lo
        throw new Error(`Falha no Supabase: ${error.message}`);
      }
    }

    // 2. Persiste/atualiza o cache local (LocalStorage)
    // Esta operação agora é mais simples e direta.
    const currentLocalData = JSON.parse(localStorage.getItem(storageKey) || '[]') as T[];
    const updatedLocalData = [item, ...currentLocalData.filter(existingItem => existingItem.id !== item.id)];
    localStorage.setItem(storageKey, JSON.stringify(updatedLocalData));
  },

  async updateOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string, updates: Partial<T>): Promise<void> {
    const companyId = getCurrentCompanyId();
    
    // Primeiro tenta atualizar no Supabase
    if (isCloudEnabled() && supabase) {
      let query = supabase.from(table).update(updates).eq('id', itemId);
      
      // Filtros de segurança para update
      if (companyId) {
        if (table === 'tenants') {
           query = query.eq('id', companyId); // Só pode atualizar a própria empresa
        } else if (table !== 'accounts') {
           query = query.eq('companyId', companyId); // Só pode atualizar seus itens
        }
      }

      const { error } = await query;
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

  async deleteOne<T extends { id: string, companyId?: string }>(table: string, storageKey: string, itemId: string): Promise<void> {
    const companyId = getCurrentCompanyId();

    if (isCloudEnabled() && supabase) {
      let query = supabase.from(table).delete().eq('id', itemId);
      
      if (companyId) {
         if (table === 'tenants') {
            query = query.eq('id', companyId); 
         } else if (table !== 'accounts') {
            query = query.eq('companyId', companyId);
         }
      }

      const { error } = await query;
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
    // Clear LocalStorage
    storageKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('multiplus_user');

    // Clear Supabase
    if (isCloudEnabled() && supabase) {
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().neq('id', 'NULL');
        if (error) console.error(`Erro ao limpar a tabela Supabase ${table}:`, error);
      }
    }
  },

  async seedInitialData(): Promise<void> {
    if (!isCloudEnabled() || !supabase) {
      return;
    }

    const { data: tenants, error: tenantsError } = await supabase.from('tenants').select('id').limit(1);

    if (tenantsError) {
      console.error("Erro ao verificar tenants:", tenantsError);
      return;
    }

    // Se já existem tenants, não faz nada.
    if (tenants && tenants.length > 0) {
      console.log("Banco de dados já populado. Nenhuma ação de semeadura necessária.");
      return;
    }

    console.log("Banco de dados vazio. Semeando dados iniciais da UP Color...");

    const uocolorCompany: Company = {
      id: 'comp_uocolor_demo',
      name: 'UP Color',
      plan: 'PRO',
      status: CompanyStatus.ACTIVE,
      profileCompleted: false,
      currency: 'BRL',
      taxRate: 0,
      serviceFeeRate: 0,
      creditCardFee: 4.99,
      debitCardFee: 1.99,
      adminEmail: 'juliodaavid@hotmail.com'
    };
    
    const uocolorAdmin: User = {
      id: 'user_uocolor_admin',
      companyId: 'comp_uocolor_demo',
      name: 'Júlio David',
      email: 'juliodaavid@hotmail.com',
      password: 'annaejulio2026',
      role: UserRole.COMPANY_ADMIN
    };
    
    const sampleCustomer: Customer = {
        id: 'cust_ana_silva',
        companyId: 'comp_uocolor_demo',
        name: 'Ana Silva',
        email: 'ana.silva@email.com',
        phone: '35991234567',
        taxId: '123.456.789-00',
        type: 'INDIVIDUAL'
    };

    const sampleOS: ServiceOrder = {
        id: 'OS-DEMO-001',
        companyId: 'comp_uocolor_demo',
        customerId: 'cust_ana_silva',
        customerName: 'Ana Silva',
        device: 'iPhone 12',
        defect: 'Tela não liga após queda.',
        status: OSStatus.IN_ANALYSIS,
        price: 0,
        date: new Date().toISOString(),
        deviceCondition: 'Tela trincada no canto superior direito.'
    };

    // Insere os dados em sequência
    await supabase.from('tenants').insert(uocolorCompany);
    console.log("Empresa 'UP Color' semeada.");
    
    await supabase.from('accounts').insert(uocolorAdmin);
    console.log("Usuário admin 'juliodaavid@hotmail.com' semeado.");
    
    await supabase.from('customers').insert(sampleCustomer);
    console.log("Cliente 'Ana Silva' semeado.");

    await supabase.from('os').insert(sampleOS);
    console.log("Ordem de Serviço de demonstração semeada.");
  }
};