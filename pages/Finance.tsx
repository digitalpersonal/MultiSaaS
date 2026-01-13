
import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Search, X, TrendingUp, BarChart3, FileText, CheckCircle2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
// Exporting formatToBRL so it can be imported in SuperAdmin.tsx and other components
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>(() => JSON.parse(localStorage.getItem('multiplus_finance') || '[]'));
  useEffect(() => { localStorage.setItem('multiplus_finance', JSON.stringify(transactions)); }, [transactions]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trType, setTrType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [trDesc, setTrDesc] = useState('');
  const [trAmount, setTrAmount] = useState('');

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    return { income, expense, net: income - expense };
  }, [transactions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(trAmount.replace(/\D/g, '')) / 100;
    const newTr = { id: `TR-${Date.now()}`, desc: trDesc, amount: cleanAmount, type: trType, date: new Date().toISOString(), status: 'PAID' };
    setTransactions([newTr, ...transactions]);
    setIsModalOpen(false); setTrDesc(''); setTrAmount('');
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro Financeiro</h1><p className="text-slate-500 text-sm font-medium">Controle de entradas e saídas.</p></div>
        <div className="flex gap-2">
           <button onClick={() => { setTrType('EXPENSE'); setIsModalOpen(true); }} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Despesa</button>
           <button onClick={() => { setTrType('INCOME'); setIsModalOpen(true); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Receita</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase block mb-2">Ganhos</span><p className="text-2xl font-black text-emerald-600">{formatToBRL(stats.income)}</p></div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"><span className="text-[10px] font-black text-slate-400 uppercase block mb-2">Custos</span><p className="text-2xl font-black text-rose-600">{formatToBRL(stats.expense)}</p></div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl"><span className="text-[10px] font-black text-slate-400 uppercase block mb-2 text-indigo-400">Saldo Atual</span><p className="text-2xl font-black">{formatToBRL(stats.net)}</p></div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
         {transactions.length === 0 ? (
           <div className="py-24 text-center text-slate-300 uppercase font-black tracking-widest text-xs">Sem lançamentos registrados</div>
         ) : (
           <table className="w-full text-left">
              <thead><tr className="bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50"><th className="px-8 py-5">Descrição</th><th className="px-8 py-5 text-right">Valor</th></tr></thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50 transition-all"><td className="px-8 py-6"><p className="text-sm font-bold text-slate-900">{tr.desc}</p><span className="text-[9px] font-black uppercase text-slate-400">{new Date(tr.date).toLocaleDateString()}</span></td><td className={`px-8 py-6 text-right font-black text-sm ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>{tr.type === 'INCOME' ? '+' : '-'} {formatToBRL(tr.amount)}</td></tr>
                ))}
              </tbody>
           </table>
         )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
              <h2 className="text-xl font-black text-slate-900 uppercase mb-8">{trType === 'INCOME' ? 'Nova Receita' : 'Novo Gasto'}</h2>
              <form onSubmit={handleAdd} className="space-y-6">
                 <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Descrição (Ex: Venda O.S 123)" required />
                 <input type="text" value={trAmount} onChange={e => {const val = e.target.value.replace(/\D/g, ''); setTrAmount((Number(val)/100).toLocaleString('pt-BR', {minimumFractionDigits: 2}))}} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black outline-none" placeholder="Valor R$" required />
                 <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs">Efetivar Lançamento</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
