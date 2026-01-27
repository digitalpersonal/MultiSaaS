
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  PieChart as PieChartIcon,
  ShoppingBag,
  Wrench,
  Users,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { databaseService } from '../services/databaseService';
import { Transaction, ServiceOrder, Customer, OSStatus } from '../types';

const formatToBRL = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [trans, os] = await Promise.all([
        databaseService.fetch<Transaction>('finance', 'multiplus_finance'),
        databaseService.fetch<ServiceOrder>('os', 'multiplus_os'),
      ]);
      setTransactions(trans);
      setServiceOrders(os);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const monthlyRevenueData = useMemo(() => {
    const data: { name: string; value: number }[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
        
        const monthlyTotal = transactions
            .filter(t => t.type === 'INCOME' && new Date(t.date) <= today)
            .filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
            
        data.push({ name: monthName, value: monthlyTotal });
    }
    return data;
  }, [transactions]);
  
  const totalLast6Months = monthlyRevenueData.reduce((sum, item) => sum + item.value, 0);

  const revenueByCategoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions
      .filter(t => t.type === 'INCOME' && t.category)
      .forEach(t => {
        const categoryName = t.category || 'Outros';
        const currentTotal = categoryMap.get(categoryName) || 0;
        categoryMap.set(categoryName, currentTotal + t.amount);
      });
      
    const totalIncome = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);
    if (totalIncome === 0) return [];
    
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];
    
    return Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value: parseFloat(((value / totalIncome) * 100).toFixed(1)),
      color: colors[index % colors.length]
    }));
  }, [transactions]);

  const kpiData = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const salesCount = incomeTransactions.length;
    const ticketMedio = salesCount > 0 ? totalRevenue / salesCount : 0;
    
    const completedOS = serviceOrders.filter(os => os.status === OSStatus.COMPLETED).length;
    const totalOS = serviceOrders.length;
    const osCompletionRate = totalOS > 0 ? (completedOS / totalOS) * 100 : 0;

    const osByCustomer = new Map<string, number>();
    serviceOrders.forEach(os => {
        osByCustomer.set(os.customerId, (osByCustomer.get(os.customerId) || 0) + 1);
    });
    const returningCustomers = Array.from(osByCustomer.values()).filter(count => count > 1).length;
    const totalCustomersWithOS = osByCustomer.size;
    const customerRetentionRate = totalCustomersWithOS > 0 ? (returningCustomers / totalCustomersWithOS) * 100 : 0;

    return {
      ticketMedio,
      osCompletionRate,
      customerRetentionRate,
    };
  }, [transactions, serviceOrders]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Gerando Relatórios...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios Gerenciais</h1>
          <p className="text-slate-500 text-sm">Analise métricas profundas e tome decisões baseadas em dados.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Download size={18} className="mr-2" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">Crescimento de Faturamento</h3>
                <p className="text-xs font-bold text-slate-400">Últimos 6 meses</p>
              </div>
            </div>
            <span className="text-lg font-black text-emerald-600">{formatToBRL(totalLast6Months)}</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} tickFormatter={(value) => `R$${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  formatter={(value: number) => [formatToBRL(value), 'Receita']}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {monthlyRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === monthlyRevenueData.length - 1 ? '#6366f1' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <PieChartIcon size={20} />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Distribuição de Receita</h3>
          </div>
          {revenueByCategoryData.length > 0 ? (
            <>
            <div className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (
                          <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                    }}
                  >
                    {revenueByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 mt-4">
              {revenueByCategoryData.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-xs font-bold text-slate-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-black text-slate-900">{item.value}%</span>
                </div>
              ))}
            </div>
            </>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
                <PieChartIcon size={40} className="mb-4 opacity-50"/>
                <p className="text-xs font-bold uppercase">Sem dados de receita para exibir</p>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Ticket Médio', value: formatToBRL(kpiData.ticketMedio), icon: <ShoppingBag size={18} />, color: 'indigo' },
          { label: 'Taxa de Conclusão de OS', value: `${kpiData.osCompletionRate.toFixed(0)}%`, icon: <CheckCircle2 size={18} />, color: 'blue' },
          { label: 'Clientes Recorrentes', value: `${kpiData.customerRetentionRate.toFixed(0)}%`, icon: <Users size={18} />, color: 'pink' },
        ].map(item => (
          <div key={item.label} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${item.color}-50 text-${item.color}-600 rounded-xl`}>{item.icon}</div>
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</h4>
            <p className="text-xl font-black text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};