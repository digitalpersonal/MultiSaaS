
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
  UserCheck
} from 'lucide-react';
import { MOCK_COMPANIES } from '../constants';
import { formatToBRL } from './Finance';
import { UserRole, CompanyStatus } from '../types';

const FIXED_PLAN_PRICE = 149.90;

export const SuperAdmin: React.FC = () => {
  const [companies, setCompanies] = useState(() => {
    const saved = localStorage.getItem('multiplus_tenants');
    return saved ? JSON.parse(saved) : MOCK_COMPANIES;
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
      status: CompanyStatus.PENDING_SETUP,
      revenue: 0,
      profileCompleted: false
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

    alert(`AMBIENTE PROVISIONADO COM SUCESSO!\n\nEmpresa: ${companyName}\nLogin: ${adminEmail}\nSenha: ${adminPassword}\n\nO empresário deverá completar os dados no primeiro acesso.`);
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
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Console de Administração SaaS</h1>
            <p className="text-slate-500 font-medium">Controle central de provisionamento Multiplus - Acesso Exclusivo.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
        >
          <Plus size={20} className="mr-2" /> Novo Cliente Multiplus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresas na Base</p>
           <p className="text-4xl font-black text-slate-900">{companies.length}</p>
           <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs pt-2">
             <TrendingUp size={14} /> +2 este mês
           </div>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-2">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MRR (Faturamento Recorrente)</p>
           <p className="text-4xl font-black text-slate-900">{formatToBRL(companies.length * FIXED_PLAN_PRICE)}</p>
           <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs pt-2">
             <CheckCircle2 size={14} /> 100% Adimplente
           </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200 space-y-2 relative overflow-hidden">
           <div className="relative z-10">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status do Sistema</p>
              {/* Fix: Changed div to span inside p tag to correct invalid HTML structure */}
              <p className="text-2xl font-black flex items-center gap-2">SaaS Operacional <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span></p>
              <p className="text-[10px] text-slate-400 mt-2">Logado como: digitalpersonal@gmail.com</p>
           </div>
           <ShieldCheck size={100} className="absolute -bottom-4 -right-4 opacity-10 text-white" />
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between gap-4">
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Ambientes Provisionados</h3>
           <div className="relative max-w-xs w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Empresa</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Configuração do Perfil</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status SaaS</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mr-4 font-black shadow-inner">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{c.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-tighter">{c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {c.profileCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                        <UserCheck size={12} /> Dados Finalizados
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-100">
                        <Clock size={12} /> Aguardando Empresário
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      c.status === 'ACTIVE' || c.status === 'PENDING_SETUP' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === c.id ? null : c.id)}
                      className="p-2 text-slate-300 hover:text-indigo-600 rounded-xl transition-all"
                    >
                      <MoreVertical size={20} />
                    </button>
                    {activeMenu === c.id && (
                      <div className="absolute right-12 top-14 w-56 bg-white border border-slate-100 rounded-3xl shadow-2xl z-20 py-3 animate-in fade-in zoom-in duration-100">
                        <button className="w-full flex items-center px-4 py-2.5 text-xs text-indigo-600 font-bold hover:bg-indigo-50 transition-all"><ArrowUpRight size={14} className="mr-3" /> Dashboard Empresário</button>
                        <button className="w-full flex items-center px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-slate-50 transition-all"><Mail size={14} className="mr-3" /> Enviar Dados Acesso</button>
                        <div className="h-px bg-slate-50 my-2 mx-3"></div>
                        <button className="w-full flex items-center px-4 py-2.5 text-xs text-rose-600 font-bold hover:bg-rose-50 transition-all"><AlertTriangle size={14} className="mr-3" /> Suspender Unidade</button>
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
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
            <div className="px-6 md:px-10 py-8 md:py-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Provisionar Novo Cliente</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Configuração inicial de ambiente Multiplus</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all"><X size={20} /></button>
            </div>
            
            <form className="p-6 md:p-10 space-y-8 overflow-y-auto custom-scrollbar" onSubmit={handleRegisterCompany}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome da Empresa (Razão Social ou Fantasia)</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none shadow-sm" placeholder="Ex: Master Cell Assistência" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail de Login do Empresário</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none shadow-sm" placeholder="empresario@email.com" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Senha Provisória</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="text" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none shadow-sm" placeholder="senha123" required />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-indigo-100">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                             <Zap size={24} className="text-indigo-400" />
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plano SaaS Ativado</p>
                             <p className="text-lg font-black">Multiplus Full Experience</p>
                          </div>
                       </div>
                       <p className="text-2xl font-black text-indigo-400">R$ 149,90</p>
                    </div>
                  </div>
               </div>
               
               <div className="pt-4 sticky bottom-0 bg-white py-4 mt-2">
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs">
                    <CheckCircle2 size={20} /> Provisionar e Gerar Acesso
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
