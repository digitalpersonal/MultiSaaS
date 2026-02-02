
import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Search, X, TrendingUp, BarChart3, FileText, CheckCircle2, Calendar, Printer, Filter, PieChart, AlertTriangle, Tag, Settings2, Trash2, CalendarDays, Clock, CreditCard, Edit2, Download, FileSpreadsheet } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Transaction as TransactionType, UserRole, FinanceCategory, Company } from '../types';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Finance: React.FC = () => {
  const FINANCE_STORAGE_KEY = 'multiplus_finance';
  const FINANCE_TABLE_NAME = 'finance';
  const CATEGORIES_STORAGE_KEY = 'multiplus_finance_categories';
  const CATEGORIES_TABLE_NAME = 'finance_categories';
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros de Data
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filterPeriod, setFilterPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('MONTH');

  const getCurrentCompanyId = (): string | undefined => {
    const userString = localStorage.getItem('multiplus_user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role !== UserRole.SUPER_ADMIN) return user.companyId;
    }
    return undefined;
  };
  const companyId = getCurrentCompanyId();

  useEffect(() => { 
    const loadData = async () => {
      setIsLoading(true);
      const data = await databaseService.fetch<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY);
      const cats = await databaseService.fetch<FinanceCategory>(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY);
      
      if (companyId) {
        const tenants = await databaseService.fetch<Company>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
        const comp = tenants.find(t => t.id === companyId);
        setCurrentCompany(comp || null);
      }

      setTransactions(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      if (cats.length === 0 && companyId) {
        // Fixed property name typo: companyType changed to companyId
        const defaultCategories: FinanceCategory[] = [
          { id: 'cat_1', companyId, name: 'Vendas de Produtos', type: 'INCOME' },
          { id: 'cat_2', companyId, name: 'Serviços Prestados', type: 'INCOME' },
          { id: 'cat_3', companyId, name: 'Compras Fornecedores', type: 'EXPENSE' },
          { id: 'cat_4', companyId, name: 'Aluguel e Condomínio', type: 'EXPENSE' },
          { id: 'cat_5', companyId, name: 'Salários e Encargos', type: 'EXPENSE' },
          { id: 'cat_6', companyId, name: 'Impostos e Taxas', type: 'EXPENSE' },
        ];
        await databaseService.save(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY, defaultCategories);
        setCategories(defaultCategories);
      } else {
        setCategories(cats);
      }
      setIsLoading(false);
    };
    loadData();
  }, [companyId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  
  const [trType, setTrType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [trDesc, setTrDesc] = useState('');
  const [trAmount, setTrAmount] = useState('');
  const [trCategory, setTrCategory] = useState('');
  const [trMethod, setTrMethod] = useState('');
  const [trDate, setTrDate] = useState(new Date().toISOString().split('T')[0]);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);

  const applyDateFilter = (period: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM') => {
    setFilterPeriod(period);
    const today = new Date();
    let start = new Date();
    let end = new Date();
    if (period === 'TODAY') { start = today; end = today; }
    else if (period === 'WEEK') { start = new Date(today.setDate(today.getDate() - 7)); end = new Date(); }
    else if (period === 'MONTH') { start = new Date(today.getFullYear(), today.getMonth(), 1); end = new Date(today.getFullYear(), today.getMonth() + 1, 0); }
    if (period !== 'CUSTOM') setDateRange({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
  };

  const filteredTransactions = useMemo(() => {
    const start = new Date(dateRange.start); start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end); end.setHours(23, 59, 59, 999);
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dateRange]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [filteredTransactions]);

  const handleExportAccounting = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Metodo', 'Valor', 'Status'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description.replace(/;/g, ','),
      t.category || 'Geral',
      t.type === 'INCOME' ? 'RECEITA' : 'DESPESA',
      t.method || 'N/A',
      t.amount.toFixed(2).replace('.', ','),
      t.status === 'PAID' ? 'LIQUIDADO' : 'PENDENTE'
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Financeiro_Multiplus_${dateRange.start}_a_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    const totalAmount = parseFloat(trAmount.replace(/\D/g, '')) / 100;
    const dateObj = new Date(trDate);

    const mainTr: TransactionType = {
      id: `TR-${Date.now()}`, companyId, description: trDesc, amount: totalAmount, type: trType, date: dateObj.toISOString(),
      status: 'PAID', category: trCategory || 'Geral', method: trMethod
    };

    await databaseService.insertOne<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, mainTr);
    
    // Taxa automática se for cartão
    if (trType === 'INCOME' && currentCompany && (trMethod === 'CREDIT' || trMethod === 'DEBIT')) {
        const rate = trMethod === 'CREDIT' ? currentCompany.creditCardFee : currentCompany.debitCardFee;
        if (rate && rate > 0) {
            await databaseService.insertOne<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, {
                id: `FEE-${Date.now()}`, companyId, description: `Taxa ${trMethod} - ${trDesc}`, amount: totalAmount * (rate / 100),
                type: 'EXPENSE', date: dateObj.toISOString(), status: 'PAID', category: 'Impostos e Taxas', method: 'Automático'
            });
        }
    }

    const updated = await databaseService.fetch<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY);
    setTransactions(updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false); setTrAmount(''); setTrDesc('');
  };

  return (
    <div className="space-y-8 pb-20 print:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fluxo de Caixa & Contabilidade</h1>
          <p className="text-slate-500 text-sm font-medium">Relatórios prontos para o seu contador.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={handleExportAccounting} className="px-6 py-3 bg-white text-emerald-600 border border-emerald-100 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center gap-2 hover:bg-emerald-50 transition-all">
              <FileSpreadsheet size={16} /> Exportar CSV (Contador)
           </button>
           <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 hover:bg-indigo-700 transition-all">
              <Plus size={16} /> Lançamento Manual
           </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 no-print">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          {['TODAY', 'WEEK', 'MONTH', 'CUSTOM'].map(p => (
            <button key={p} onClick={() => applyDateFilter(p as any)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPeriod === p ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>
                {p === 'TODAY' ? 'Hoje' : p === 'WEEK' ? '7 Dias' : p === 'MONTH' ? 'Este Mês' : 'Personalizado'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" />
           <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
            <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-2">Entradas Brutas</span>
            <p className="text-3xl font-black text-emerald-700">{formatToBRL(stats.income)}</p>
         </div>
         <div className="bg-rose-50 p-8 rounded-[2.5rem] border border-rose-100">
            <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest block mb-2">Saídas Consolidadas</span>
            <p className="text-3xl font-black text-rose-700">{formatToBRL(stats.expense)}</p>
         </div>
         <div className={`p-8 rounded-[2.5rem] border ${stats.balance >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest block mb-2">Resultado Líquido</span>
            <p className={`text-3xl font-black ${stats.balance >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>{formatToBRL(stats.balance)}</p>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                <th className="px-8 py-5">Data</th>
                <th className="px-8 py-5">Descrição</th>
                <th className="px-8 py-5">Categoria ERP</th>
                <th className="px-8 py-5 text-center">Meio</th>
                <th className="px-8 py-5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map(tr => (
                <tr key={tr.id} className="hover:bg-slate-50 transition-all">
                  <td className="px-8 py-4 text-xs font-bold text-slate-500">{new Date(tr.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-4 text-sm font-black text-slate-900">{tr.description}</td>
                  <td className="px-8 py-4"><span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{tr.category}</span></td>
                  <td className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase">{tr.method}</td>
                  <td className={`px-8 py-4 text-right font-black text-sm ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tr.type === 'INCOME' ? '+' : '-'} {formatToBRL(tr.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
         </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
             <h2 className="text-xl font-black text-slate-900 uppercase mb-8">Novo Lançamento</h2>
             <form onSubmit={handleAddTransaction} className="space-y-6">
                <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                   <button type="button" onClick={() => setTrType('INCOME')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${trType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Receita</button>
                   <button type="button" onClick={() => setTrType('EXPENSE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase ${trType === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Despesa</button>
                </div>
                <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Descrição do lançamento..." required />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" value={trAmount} onChange={e => {const v = e.target.value.replace(/\D/g, ''); setTrAmount((Number(v)/100).toLocaleString('pt-BR', {minimumFractionDigits: 2}))}} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black outline-none" placeholder="R$ 0,00" required />
                   <input type="date" value={trDate} onChange={e => setTrDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" required />
                </div>
                <select value={trCategory} onChange={e => setTrCategory(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer">
                   <option value="">Categoria Fiscal...</option>
                   {categories.filter(c => c.type === trType).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select value={trMethod} onChange={e => setTrMethod(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer">
                   <option value="">Meio de Pagamento...</option>
                   <option value="DINHEIRO">Dinheiro</option><option value="PIX">Pix</option><option value="CREDIT">Cartão de Crédito</option><option value="DEBIT">Cartão de Débito</option>
                </select>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl">Confirmar Lançamento</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
