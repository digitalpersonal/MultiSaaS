
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
  Trash2
} from 'lucide-react';
import { formatToBRL } from './Finance';
import { UserRole, CompanyStatus } from '../types';

const FIXED_PLAN_PRICE = 149.90;
const SYSTEM_URL = 'https://multiplus-saas.vercel.app';

export const SuperAdmin: React.FC = () => {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('multiplus_tenants');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Form States
  const [companyName, setCompanyName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('multiplus_tenants', JSON.stringify(companies));
  }, [companies]);

  const handleRegisterCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const tenantId = `comp_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCompany = {
      id: tenantId,
      name: companyName,
      plan: 'PRO',
      status: CompanyStatus.ACTIVE,
      revenue: 0,
      profileCompleted: false,
      adminEmail: adminEmail 
    };

    const newUser = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      companyId: tenantId,
      name: `Empresário ${companyName}`,
      email: adminEmail,
      password: adminPassword,
      role: UserRole.COMPANY_ADMIN
    };

    const savedAccounts = JSON.parse(localStorage.getItem('multiplus_accounts') || '[]');
    localStorage.setItem('multiplus_accounts', JSON.stringify([...savedAccounts, newUser]));

    setCompanies([newCompany, ...companies]);
    setIsModalOpen(false);
    
    setCompanyName('');
    setAdminEmail('');
    setAdminPassword('');

    alert(`AMBIENTE PROVISIONADO!\nUnidade: ${companyName}\nAcesso: ${adminEmail}`);
  };

  const toggleCompanyStatus = (id: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === CompanyStatus.SUSPENDED ? CompanyStatus.ACTIVE : CompanyStatus.SUSPENDED;
        return { ...c, status: newStatus };
      }
      return c;
    }));
    setActiveMenu(null);
  };

  const handleLoginAs = (company: any) => {
    const savedAccounts = JSON.parse(localStorage.getItem('multiplus_accounts') || '[]');
    const adminUser = savedAccounts.find(u => u.companyId === company.id && u.role === UserRole.COMPANY_ADMIN);
    
    if (adminUser) {
      localStorage.setItem('multiplus_user', JSON.stringify(adminUser));
      window.location.href = '/'; 
    } else {
      alert("Erro ao localizar usuário administrador desta unidade.");
    }
  };

  const handleSendCredentials = (company: any) => {
    const savedAccounts = JSON.parse(localStorage.getItem('multiplus_accounts') || '[]');
    const user = savedAccounts.find(u => u.companyId === company.id && u.role === UserRole.COMPANY_ADMIN);
    
    if (user) {
      const message = `Olá! Seu ambiente Multiplus SaaS está pronto.\n\nEmpresa: ${company.name}\nEmail: ${user.email}\nSenha: ${user.password}\n\nAcesse o sistema em: ${SYSTEM_URL}`;
      const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
    setActiveMenu(null);
  };

  const handleResetSystem = () => {
    if (confirm('ATENÇÃO: Isso apagará TODAS as empresas, usuários, estoque e financeiro permanentemente. Deseja continuar?')) {
      const keysToRemove = [
        'multiplus_tenants', 
        'multiplus_accounts', 
        'multiplus_inventory', 
        'multiplus_os', 
        'multiplus_finance', 
        'multiplus_customers'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      setCompanies([]);
      alert('Sistema resetado com sucesso.');
      window.location.reload();
    }
  };

  const filteredCompanies = companies.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 text-indigo-400 rounded-2xl shadow-xl">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Console Multiplus</h1>
            <p className="text-slate-500 font-medium">Controle central de unidades SaaS.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleResetSystem}
            className="flex items-center justify-center px-4 py-4 bg-rose-50 text-rose-600 rounded-[1.5rem] font-black hover:bg-rose-100 transition-all uppercase tracking-widest text-[10px]"
          >
            <RefreshCcw size={16} className="mr-2" /> Reset Total
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs"
          >
            <Plus size={20} className="mr-2" /> Novo Cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Ativas</p>
           <p className="text-4xl font-black text-slate-900">{companies.filter(c => c.status === 'ACTIVE').length}</p>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Estimado</p>
           <p className="text-4xl font-black text-slate-900">{formatToBRL(companies.length * FIXED_PLAN_PRICE)}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
           <ShieldCheck className="absolute -bottom-4 -right-4 opacity-10 text-white" size={100} />
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segurança</p>
           <p className="text-2xl font-black">Sistema Blindado</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
           <h3 className="text-xl font-black text-slate-900">Empresas Contratantes</h3>
           <div className="relative max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidade</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Setup</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status SaaS</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-[0.3em]">Nenhuma empresa cadastrada</td></tr>
              ) : filteredCompanies.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className={`w-12 h-12 ${c.status === 'SUSPENDED' ? 'bg-slate-200 grayscale' : 'bg-indigo-50 text-indigo-600'} rounded-2xl flex items-center justify-center mr-4 font-black`}>
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${c.status === 'SUSPENDED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{c.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">{c.adminEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {c.profileCompleted ? (
                      <span className="text-[9px] font-black text-emerald-600 uppercase flex items-center justify-center gap-1"><UserCheck size={12}/> Configurado</span>
                    ) : (
                      <span className="text-[9px] font-black text-amber-500 uppercase flex items-center justify-center gap-1"><Clock size={12}/> Pendente</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                      c.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status === 'ACTIVE' ? 'Ativo' : 'Suspenso'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all"><MoreVertical size={20} /></button>
                    {activeMenu === c.id && (
                      <div className="absolute right-12 top-14 w-60 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-50 py-4 animate-in fade-in zoom-in duration-200">
                        <button onClick={() => handleLoginAs(c)} className="w-full flex items-center px-6 py-3 text-xs text-indigo-600 font-black hover:bg-indigo-50 transition-all uppercase tracking-widest"><ArrowUpRight size={14} className="mr-3" /> Dashboard</button>
                        <button onClick={() => handleSendCredentials(c)} className="w-full flex items-center px-6 py-3 text-xs text-emerald-600 font-black hover:bg-emerald-50 transition-all uppercase tracking-widest"><MessageCircle size={14} className="mr-3" /> Enviar Acesso</button>
                        <div className="h-px bg-slate-50 my-2 mx-4"></div>
                        <button onClick={() => toggleCompanyStatus(c.id)} className={`w-full flex items-center px-6 py-3 text-xs font-black hover:bg-rose-50 transition-all uppercase tracking-widest ${c.status === 'ACTIVE' ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {c.status === 'ACTIVE' ? <><Ban size={14} className="mr-3" /> Bloquear</> : <><UserCheck size={14} className="mr-3" /> Desbloquear</>}
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

      <div className="bg-rose-50/50 p-10 rounded-[3rem] border border-rose-100 border-dashed flex items-center justify-between">
         <div>
            <h3 className="text-lg font-black text-rose-900 uppercase">Zona de Perigo</h3>
            <p className="text-sm text-rose-600 font-medium">Use com extrema cautela. Limpa todo o ecossistema.</p>
         </div>
         <button onClick={handleResetSystem} className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-rose-700 transition-all">
            <Trash2 size={18} /> Apagar Tudo
         </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
            <h2 className="text-2xl font-black text-slate-900 uppercase mb-8">Provisionar Unidade</h2>
            <form className="space-y-6" onSubmit={handleRegisterCompany}>
               <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome Fantasia..." required />
               <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Email do Empresário..." required />
               <input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Senha Provisória..." required />
               <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl">Criar Ambiente e Acesso</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
