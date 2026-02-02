
import React, { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Package, Wrench, Users, DollarSign, Sparkles, ChevronRight, Zap, Target, Rocket, Medal, Building2, Clock, ShieldCheck, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBusinessInsights } from '../services/geminiService';
import { UserRole, Product, Customer, ServiceOrder, Transaction, Company, User } from '../types';
import { databaseService } from '../services/databaseService';

export const Dashboard: React.FC = () => {
  const [insights, setInsights] = useState<string>('Gerando análise estratégica...');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [inventoryData, setInventoryData] = useState<Product[]>([]);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [osData, setOsData] = useState<ServiceOrder[]>([]);
  const [financeData, setFinanceData] = useState<Transaction[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      const savedUser = JSON.parse(localStorage.getItem('multiplus_user') || 'null');
      if (savedUser) {
        setCurrentUser(savedUser);
        if (savedUser.companyId) {
          const allCompanies = await databaseService.fetch<Company>('tenants', 'multiplus_tenants');
          const company = allCompanies.find(c => c.id === savedUser.companyId);
          setCurrentCompany(company || null);
        }
      }
    };
    loadUserData();
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser || currentUser.role === UserRole.SUPER_ADMIN) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const inv = await databaseService.fetch<Product>('inventory', 'multiplus_inventory');
      const cust = await databaseService.fetch<Customer>('customers', 'multiplus_customers');
      const os = await databaseService.fetch<ServiceOrder>('os', 'multiplus_os');
      const fin = await databaseService.fetch<Transaction>('finance', 'multiplus_finance');

      setInventoryData(inv);
      setCustomersData(cust);
      setOsData(os);
      setFinanceData(fin);
      setIsLoading(false);

      const res = await getBusinessInsights({ 
        itens_estoque: inv.length, 
        total_clientes: cust.length,
        os_ativas: os.filter(o => o.status !== 'COMPLETED').length 
      });
      setInsights(res);
    };

    if (currentUser && currentUser.role !== UserRole.SUPER_ADMIN) {
      loadDashboardData();
    } else if (currentUser && currentUser.role === UserRole.SUPER_ADMIN) {
       setInsights("Bem-vindo, Super Administrador! Acesse a gestão da plataforma para gerenciar as unidades SaaS.");
       setIsLoading(false);
    }
  }, [currentUser]);

  const stats = useMemo(() => {
    const revenue = financeData.filter(f => f.type === 'INCOME').reduce((acc, f) => acc + f.amount, 0);
    const lowStock = inventoryData.filter(p => p.type === 'PHYSICAL' && p.stock !== undefined && p.stock <= (p.minStock || 0)).length;
    const openOS = osData.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
    return { revenue, lowStock, openOS, totalCust: customersData.length };
  }, [financeData, inventoryData, osData, customersData]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando painel de controle...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Multiplus Dashboard</h1>
          <p className="text-slate-500 font-medium">Gestão centralizada de vendas, serviços e estoque.</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/vendas" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all flex items-center uppercase tracking-widest text-[10px]">
            <Zap size={18} className="mr-2" /> Venda Rápida PDV
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Receita Operacional', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.revenue), icon: <DollarSign />, color: 'emerald' },
          { label: 'Serviços em Aberto', value: stats.openOS.toString(), icon: <Wrench />, color: 'amber' },
          { label: 'Base de Clientes', value: stats.totalCust.toString(), icon: <Users />, color: 'indigo' },
          { label: 'Itens em Falta', value: stats.lowStock.toString(), icon: <Package />, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all rounded-xl shadow-inner">{stat.icon}</div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-2xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-2 bg-indigo-600/30 rounded-xl border border-white/10"><Sparkles className="text-indigo-400" size={24} /></div>
            <div><h2 className="text-lg font-black uppercase tracking-[0.2em] text-indigo-100">Consultoria Multiplus IA</h2></div>
          </div>
          <div className="text-indigo-50 leading-relaxed max-w-5xl text-lg font-medium italic">"{insights}"</div>
        </div>
        <Box size={200} className="absolute -bottom-10 -right-10 opacity-5 text-white" />
      </div>
    </div>
  );
};
