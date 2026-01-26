
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Mail, 
  Lock, 
  Zap,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  MessageCircle,
  Ban,
  RefreshCcw,
  Trash2,
  Key,
  DollarSign
} from 'lucide-react';
import { formatToBRL } from './Finance';
import { UserRole, CompanyStatus, Company as CompanyType, User as UserType } from '../types';
import { databaseService } from '../services/databaseService';

const FIXED_PLAN_PRICE = 149.90;
const SYSTEM_URL = 'https://multiplus-saas.vercel.app'; 

export const SuperAdmin: React.FC = () => {
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';
  const ACCOUNTS_STORAGE_KEY = 'multiplus_accounts';
  const ACCOUNTS_TABLE_NAME = 'accounts';

  const [companies, setCompanies] = useState<CompanyType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false); // Novo estado de carregamento

  // Form States para Nova Empresa
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // States para Alteração de Senha
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedCompanyForPassword, setSelectedCompanyForPassword] = useState<CompanyType | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [confirmResetPassword, setConfirmResetPassword] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const loadedCompanies = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
      setCompanies(loadedCompanies);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const tenantId = `comp_${Math.random().toString(36).substr(2, 9)}`;
      const safeEmail = adminEmail.trim().toLowerCase();

      // Verificação de e-mail duplicado
      const allUsers = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
      if (allUsers.some(user => user.email === safeEmail)) {
        alert('ERRO: Este e-mail de administrador já está em uso.');
        setIsRegistering(false);
        return;
      }

      const newCompany: CompanyType = {
        id: tenantId,
        name: companyName,
        plan: 'PRO',
        status: CompanyStatus.ACTIVE,
        profileCompleted: false,
        currency: 'BRL',
        taxRate: 0,
        serviceFeeRate: 0,
        adminEmail: safeEmail
      };

      const newUser: UserType = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        companyId: tenantId,
        name: `Empresário ${companyName}`,
        email: safeEmail,
        password: adminPassword,
        role: UserRole.COMPANY_ADMIN
      };

      await databaseService.insertOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, newCompany);
      await databaseService.insertOne<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, newUser);

      const updatedCompanies = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
      setCompanies(updatedCompanies);

      setIsModalOpen(false);
      setCompanyName('');
      setAdminEmail('');
      setAdminPassword('');

      alert(`AMBIENTE PROVISIONADO COM SUCESSO!\n\nUnidade: ${companyName}\nLogin: ${safeEmail}\n\nEnvie estes dados para o cliente.`);
    } catch (error: any) {
      console.error("Falha ao provisionar unidade:", error);
      alert(`ERRO CRÍTICO: Não foi possível provisionar a nova unidade.\n\nDetalhes: ${error.message}\n\nVerifique se o e-mail já existe ou contate o suporte.`);
    } finally {
      setIsRegistering(false);
    }
  };

  const toggleCompanyStatus = async (id: string) => {
    const companyToUpdate = companies.find(c => c.id === id);
    if (!companyToUpdate) return;

    const isBlocking = companyToUpdate.status === CompanyStatus.ACTIVE;

    const confirmMessage = isBlocking 
      ? `ATENÇÃO: SUSPENDER ACESSO\n\nMotivo: Inadimplência ou Bloqueio Administrativo.\n\nDeseja realmente BLOQUEAR o acesso da empresa "${companyToUpdate.name}"? Ninguém desta unidade conseguirá fazer login.`
      : `LIBERAR ACESSO\n\nDeseja reativar o acesso da empresa "${companyToUpdate.name}"?`;

    if (!confirm(confirmMessage)) return;

    const newStatus = isBlocking ? CompanyStatus.SUSPENDED : CompanyStatus.ACTIVE;
    await databaseService.updateOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, id, { status: newStatus });
    
    const updatedCompanies = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
    setCompanies(updatedCompanies);
    setActiveMenu(null);
  };

  const handleDeleteCompany = async (company: CompanyType) => {
    const confirmMessage = `ATENÇÃO: EXCLUSÃO PERMANENTE\n\nTem certeza que deseja EXCLUIR a empresa "${company.name}" e todo o acesso do administrador?\n\nEsta ação não pode ser desfeita e os dados da empresa ficarão inacessíveis.`;
    
    if (!confirm(confirmMessage)) return;

    // 1. Excluir a empresa (Tenant)
    await databaseService.deleteOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, company.id);

    // 2. Excluir o usuário Admin vinculado (Account)
    const allUsers = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
    const adminUser = allUsers.find(u => u.companyId === company.id && u.role === UserRole.COMPANY_ADMIN);
    
    if (adminUser) {
        await databaseService.deleteOne<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, adminUser.id);
    }

    // Atualizar lista
    const updatedCompanies = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
    setCompanies(updatedCompanies);
    setActiveMenu(null);
    alert('Empresa e acesso administrativo excluídos com sucesso.');
  };

  const handleLoginAs = async (company: CompanyType) => {
    const savedAccounts = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
    const adminUser = savedAccounts.find(u => u.companyId === company.id && u.role === UserRole.COMPANY_ADMIN);
    
    if (adminUser) {
      localStorage.setItem('multiplus_user', JSON.stringify(adminUser));
      window.location.href = '/'; 
    } else {
      alert("Erro ao localizar usuário administrador desta unidade.");
    }
  };

  const handleSendCredentials = async (company: CompanyType) => {
    const savedAccounts = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
    const user = savedAccounts.find(u => u.companyId === company.id && u.role === UserRole.COMPANY_ADMIN);
    
    if (user) {
      const message = `Olá! Seu ambiente Multiplus SaaS está pronto.\n\nEmpresa: ${company.name}\nEmail: ${user.email}\nSenha: ${user.password}\n\nAcesse o sistema em: ${SYSTEM_URL}`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    setActiveMenu(null);
  };

  const openPasswordModal = (company: CompanyType) => {
    setSelectedCompanyForPassword(company);
    setNewResetPassword('');
    setConfirmResetPassword('');
    setIsPasswordModalOpen(true);
    setActiveMenu(null);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyForPassword) return;

    if (newResetPassword.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newResetPassword !== confirmResetPassword) {
      alert('As senhas não conferem.');
      return;
    }

    const allUsers = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
    const adminUser = allUsers.find(u => u.companyId === selectedCompanyForPassword.id && u.role === UserRole.COMPANY_ADMIN);

    if (adminUser) {
      await databaseService.updateOne<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, adminUser.id, {
        password: newResetPassword
      });
      alert(`SENHA ATUALIZADA!\nA nova senha para ${selectedCompanyForPassword.name} é: ${newResetPassword}`);
      setIsPasswordModalOpen(false);
    } else {
      alert('Usuário administrador não encontrado para esta empresa.');
    }
  };

  const filteredCompanies = companies.filter((c: CompanyType) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando Unidades SaaS...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-indigo-400 rounded-2xl shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Console Multiplus</h1>
            <p className="text-slate-500 font-medium">Controle de Mensalidades e Acessos.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} className="mr-2" /> Nova Unidade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Ativas</p>
           <p className="text-4xl font-black text-slate-900">{companies.filter(c => c.status === CompanyStatus.ACTIVE).length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Mensal Recorrente</p>
           <p className="text-4xl font-black text-emerald-600">{formatToBRL(companies.length * FIXED_PLAN_PRICE)}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
           <ShieldCheck className="absolute -bottom-4 -right-4 opacity-10 text-white" size={100} />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão Master</p>
           <p className="text-2xl font-black">Controle Total</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
           <h3 className="text-xl font-black text-slate-900">Carteira de Clientes</h3>
           <div className="relative max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar empresa..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa / Contato</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Pagamento</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em]">Nenhuma empresa cadastrada</td></tr>
              ) : filteredCompanies.map((c: CompanyType) => (
                <tr key={c.id} className="hover:bg-slate-50 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${c.status === CompanyStatus.SUSPENDED ? 'bg-slate-200 grayscale' : 'bg-indigo-50 text-indigo-600'} rounded-2xl flex items-center justify-center mr-4 font-black`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${c.status === CompanyStatus.SUSPENDED ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{c.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{c.adminEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      c.status === CompanyStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status === CompanyStatus.ACTIVE ? 'Em Dia' : 'Bloqueado'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-[10px] font-bold text-slate-400">
                      {c.status === CompanyStatus.ACTIVE ? 'Acesso Liberado' : 'Acesso Suspenso'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><MoreVertical size={20} /></button>
                    {activeMenu === c.id && (
                      <div className="absolute right-12 top-14 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 py-4 animate-in fade-in zoom-in duration-200">
                        <button onClick={() => handleLoginAs(c)} className="w-full flex items-center px-6 py-3 text-xs text-indigo-600 font-black hover:bg-indigo-50 transition-all uppercase tracking-widest"><ArrowUpRight size={14} className="mr-3" /> Dashboard</button>
                        <button onClick={() => handleSendCredentials(c)} className="w-full flex items-center px-6 py-3 text-xs text-emerald-600 font-black hover:bg-emerald-50 transition-all uppercase tracking-widest"><MessageCircle size={14} className="mr-3" /> Enviar Acesso</button>
                        <button onClick={() => openPasswordModal(c)} className="w-full flex items-center px-6 py-3 text-xs text-amber-600 font-black hover:bg-amber-50 transition-all uppercase tracking-widest"><Key size={14} className="mr-3" /> Alterar Senha</button>
                        <div className="h-px bg-slate-50 my-2 mx-4"></div>
                        <button onClick={() => toggleCompanyStatus(c.id)} className={`w-full flex items-center px-6 py-3 text-xs font-black hover:bg-slate-50 transition-all uppercase tracking-widest ${c.status === CompanyStatus.ACTIVE ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {c.status === CompanyStatus.ACTIVE ? <><Ban size={14} className="mr-3" /> Bloquear</> : <><UserCheck size={14} className="mr-3" /> Reativar</>}
                        </button>
                        <button onClick={() => handleDeleteCompany(c)} className="w-full flex items-center px-6 py-3 text-xs text-rose-600 font-black hover:bg-rose-50 transition-all uppercase tracking-widest">
                           <Trash2 size={14} className="mr-3" /> Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-8">
               <h2 className="text-2xl font-black text-slate-900 uppercase">Provisionar Unidade</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24} /></button>
            </div>
            <form className="space-y-6" onSubmit={handleRegisterCompany}>
               <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome Fantasia..." required />
               <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Email do Empresário..." required />
               <input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Senha Provisória..." required />
               <button 
                 type="submit" 
                 disabled={isRegistering}
                 className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
               >
                 {isRegistering ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     Provisionando...
                   </>
                 ) : (
                   'Criar Ambiente e Acesso'
                 )}
               </button>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && selectedCompanyForPassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPasswordModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-slate-900 uppercase">Alterar Senha do Admin</h2>
               <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24} /></button>
            </div>
            
            <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Empresa Alvo</p>
              <p className="text-sm font-bold text-slate-900">{selectedCompanyForPassword.name}</p>
              <p className="text-xs text-slate-500">{selectedCompanyForPassword.adminEmail}</p>
            </div>

            <form className="space-y-6" onSubmit={handleUpdatePassword}>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nova Senha</label>
                 <input type="text" value={newResetPassword} onChange={e => setNewResetPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-amber-100 transition-all" placeholder="Nova senha..." required />
               </div>
               <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirmar Senha</label>
                 <input type="text" value={confirmResetPassword} onChange={e => setConfirmResetPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-amber-100 transition-all" placeholder="Confirme a senha..." required />
               </div>
               <button type="submit" className="w-full py-5 bg-amber-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-amber-600 transition-all">Definir Nova Senha</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};