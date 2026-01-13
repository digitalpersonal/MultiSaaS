
import React from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  PieChart as PieChartIcon,
  ShoppingBag,
  Wrench,
  Users
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
  Pie
} from 'recharts';

const salesData = [
  { name: 'Jan', value: 12000 },
  { name: 'Fev', value: 15400 },
  { name: 'Mar', value: 14200 },
  { name: 'Abr', value: 19800 },
  { name: 'Mai', value: 18100 },
  { name: 'Jun', value: 24500 },
];

const categoryData = [
  { name: 'Serviços', value: 40, color: '#6366f1' },
  { name: 'Produtos', value: 35, color: '#a855f7' },
  { name: 'Personalizados', value: 25, color: '#ec4899' },
];

export const Reports: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios Gerenciais</h1>
          <p className="text-slate-500 text-sm">Analise métricas profundas e tome decisões baseadas em dados.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50">
            <Calendar size={18} className="mr-2" /> Out/2023 - Mar/2024
          </button>
          <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            <Download size={18} className="mr-2" /> Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-black text-slate-900 tracking-tight">Crescimento de Faturamento</h3>
            </div>
            <span className="text-xs font-bold text-green-600">+24% vs semestre anterior</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === salesData.length - 1 ? '#6366f1' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-violet-50 text-violet-600 rounded-xl">
              <PieChartIcon size={20} />
            </div>
            <h3 className="font-black text-slate-900 tracking-tight">Distribuição de Receita</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {categoryData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Ticket Médio', value: 'R$ 245,80', icon: <ShoppingBag size={18} />, delta: '+12%', color: 'indigo' },
          { label: 'Produtividade Técnica', value: '94%', icon: <Wrench size={18} />, delta: '+3%', color: 'blue' },
          { label: 'Retenção de Clientes', value: '68%', icon: <Users size={18} />, delta: '-2%', color: 'pink' },
        ].map(item => (
          <div key={item.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 bg-${item.color}-50 text-${item.color}-600 rounded-xl`}>{item.icon}</div>
              <span className={`text-[10px] font-black ${item.delta.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{item.delta}</span>
            </div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</h4>
            <p className="text-xl font-black text-slate-900 mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
