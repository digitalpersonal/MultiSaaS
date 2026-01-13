
import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  Wrench, 
  Users, 
  DollarSign,
  Sparkles,
  ChevronRight,
  Zap,
  Target,
  Rocket,
  Medal,
  Building2,
  Clock,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { getBusinessInsights } from '../services/geminiService';
import { UserRole } from '../types';

const data = [
  { name: 'Seg', v: 4000 },
  { name: 'Ter', v: 3000 },
  { name: 'Qua', v: 2000 },
  { name: 'Qui', v: 2780 },
  { name: 'Sex', v: 1890 },
  { name: 'Sáb', v: 2390 },
  { name: 'Dom', v: 3490 },
];

const topTechnicians = [
  { name: 'Ricardo Silva', jobs: 42, efficiency: '98%' },
  { name: 'Ana Souza', jobs: 38, efficiency: '95%' },
  { name: 'Marcos Lima', jobs: 15, efficiency: '88%' },
];

export const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<string>('Analisando os dados do seu negócio...');
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('multiplus_user') || 'null');
    if (savedUser) {
      setUser(savedUser);
      const savedTenants = JSON.parse(localStorage.getItem('multiplus_tenants') || '[]');
      const currentCompany = savedTenants.find((t: any) => t.id === savedUser.companyId);
      setCompany(currentCompany);
    }
    
    const fetchInsights = async () => {
      const res = await getBusinessInsights({ faturamento: 45000, pedidos: 120, itens_baixo_estoque: 5 });
      setInsights(res || "Não foi possível carregar os insights estratégicos no momento.");
    };
    fetchInsights();
  }, []);

  const showOnboarding = user?.role === UserRole.COMPANY_ADMIN && company && !company.profileCompleted;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão Unificada</h1>
          <p className="text-slate-500 font-medium">Insights em tempo real para sua unidade Multiplus.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/vendas" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center uppercase tracking-widest text-[10px]">
            <Zap size={18} className="mr-2" /> Venda Rápida (PDV)
          </Link>
        </div>
      </div>

      {showOnboarding && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-6 duration-700 shadow-2xl shadow-orange-100 relative overflow-hidden group">
           <div className="relative z-10 flex items-center gap-8 text-center md:text-left flex-col md:flex-row">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-xl text-white rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <Rocket size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Quase lá, {user.name}!</h3>
                <p className="text-amber-50 font-medium text-lg max-w-lg mt-1">Sua instância SaaS foi provisionada com sucesso. Agora, complete os dados da empresa.</p>
              </div>
           </div>
           <Link to="/configuracoes" className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-orange-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95">
              Finalizar Setup <ChevronRight size={20} />
           </Link>
           <Building2 size={200} className="absolute -bottom-10 -right-10 opacity-10 text-white pointer-events-none" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Líquida', value: 'R$ 45.231,89', icon: <DollarSign />, trend: '+12.5%' },
          { label: 'Ordens em Aberto', value: '24', icon: <Wrench />, trend: '+3' },
          { label: 'Itens em Falta', value: '5 itens', icon: <Package />, trend: '-2' },
          { label: 'Ticket Médio', value: 'R$ 380,40', icon: <Target />, trend: '+8%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-black text-slate-900 tracking-tight uppercase tracking-widest text-xs">Desempenho Semanal</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.15)', padding: '16px'}}
                />
                <Area type="monotone" dataKey="v" name="Volume" stroke="#6366f1" fillOpacity={1} fill="url(#colorV)" strokeWidth={6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black mb-8 tracking-tight uppercase tracking-widest text-xs text-indigo-400">Produtividade da Equipe</h3>
            <div className="space-y-6">
              {topTechnicians.map((tech, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">
                         {i + 1}
                      </div>
                      <div>
                         <p className="text-sm font-bold">{tech.name}</p>
                         <p className="text-[10px] text-slate-400 uppercase font-black">{tech.jobs} Finalizados</p>
                      </div>
                   </div>
                   <p className="text-xs font-black text-emerald-400">{tech.efficiency}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-indigo-600 rounded-2xl text-center">
               <p className="text-[10px] font-black uppercase">Meta de Eficiência</p>
               <div className="w-full bg-indigo-900 h-2 rounded-full mt-2">
                  <div className="bg-white w-[85%] h-full rounded-full"></div>
               </div>
               <p className="text-xs font-bold mt-2">85% da meta atingida</p>
            </div>
          </div>
          <Medal size={200} className="absolute -bottom-10 -right-10 opacity-5 text-white" />
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-100 overflow-hidden relative group">
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-8">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <Sparkles className="text-indigo-200" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-[0.2em] text-indigo-100">Inteligência de Negócios</h2>
              <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">IA Strategic Insight</p>
            </div>
          </div>
          <div className="text-indigo-50 leading-relaxed whitespace-pre-wrap max-w-5xl text-lg font-medium italic">
            "{insights}"
          </div>
        </div>
        <Target size={250} className="absolute -bottom-20 -right-20 opacity-5 text-white" />
      </div>
    </div>
  );
};
