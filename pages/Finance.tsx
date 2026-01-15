import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, Plus, Search, X, TrendingUp, BarChart3, FileText, CheckCircle2, Calendar, Printer, Filter, PieChart, AlertTriangle, Tag, Settings2, Trash2, CalendarDays, Clock, CreditCard } from 'lucide-react';
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
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // Início do mês atual
    end: new Date().toISOString().split('T')[0] // Hoje
  });
  const [filterPeriod, setFilterPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('MONTH');

  const getCurrentCompanyId = (): string | undefined => {
    const userString = localStorage.getItem('multiplus_user');
    if (userString) {
      const user = JSON.parse(userString);
      if (user.role !== UserRole.SUPER_ADMIN) {
        return user.companyId;
      }
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

      // Ordenar por data decrescente (mais recente primeiro)
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(sortedData);
      
      // Seed initial categories if empty
      if (cats.length === 0 && companyId) {
        const defaultCategories: FinanceCategory[] = [
          { id: 'cat_1', companyId, name: 'Vendas', type: 'INCOME' },
          { id: 'cat_2', companyId, name: 'Serviços', type: 'INCOME' },
          { id: 'cat_3', companyId, name: 'Fornecedores', type: 'EXPENSE' },
          { id: 'cat_4', companyId, name: 'Aluguel', type: 'EXPENSE' },
          { id: 'cat_5', companyId, name: 'Energia/Água', type: 'EXPENSE' },
          { id: 'cat_6', companyId, name: 'Pessoal', type: 'EXPENSE' },
          { id: 'cat_7', companyId, name: 'Marketing', type: 'EXPENSE' },
          { id: 'cat_8', companyId, name: 'Taxas Financeiras', type: 'EXPENSE' },
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
  
  // Transaction Form States
  const [trType, setTrType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [trDesc, setTrDesc] = useState('');
  const [trAmount, setTrAmount] = useState('');
  const [trCategory, setTrCategory] = useState('');
  const [trMethod, setTrMethod] = useState('');
  const [trDate, setTrDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Installment States
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(2);

  // Category Manager States
  const [newCategoryName, setNewCategoryName] = useState('');

  // Helper para simular taxa
  const getSimulatedFee = () => {
    if (trType !== 'INCOME' || !currentCompany || !trAmount) return null;
    const value = parseFloat(trAmount.replace(/\D/g, '')) / 100;
    
    let rate = 0;
    if (trMethod === 'CREDIT') rate = currentCompany.creditCardFee || 0;
    if (trMethod === 'DEBIT') rate = currentCompany.debitCardFee || 0;
    
    if (rate > 0) {
      const fee = value * (rate / 100);
      return { rate, fee, net: value - fee };
    }
    return null;
  };
  const simulatedFee = getSimulatedFee();

  // Lógica de Filtro e Cálculos
  const applyDateFilter = (period: 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM') => {
    setFilterPeriod(period);
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'TODAY') {
      start = today;
      end = today;
    } else if (period === 'WEEK') {
      start = new Date(today.setDate(today.getDate() - 7));
      end = new Date();
    } else if (period === 'MONTH') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }

    if (period !== 'CUSTOM') {
      setDateRange({
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    const start = new Date(dateRange.start);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate >= start && tDate <= end;
    });
  }, [transactions, dateRange]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const balance = income - expense;
    
    // Indicadores de Saúde
    const profitMargin = income > 0 ? ((balance / income) * 100) : 0;
    const expenseRatio = income > 0 ? ((expense / income) * 100) : 0;
    
    return { income, expense, balance, profitMargin, expenseRatio };
  }, [filteredTransactions]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    const totalAmount = parseFloat(trAmount.replace(/\D/g, '')) / 100;
    
    const newTransactions: TransactionType[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isInstallment && installmentCount > 1) {
      const parentId = `INST-${Date.now()}`;
      const baseValue = Math.floor((totalAmount / installmentCount) * 100) / 100;
      const remainder = Math.round((totalAmount - (baseValue * installmentCount)) * 100) / 100;

      for (let i = 0; i < installmentCount; i++) {
        const isLast = i === installmentCount - 1;
        const amount = isLast ? baseValue + remainder : baseValue;
        
        // Calcular data da parcela
        const dateObj = new Date(trDate);
        dateObj.setMonth(dateObj.getMonth() + i);
        // Ajuste para não pular mês (ex: 31 de janeiro -> 28 de fevereiro)
        if (dateObj.getDate() !== new Date(trDate).getDate()) {
            dateObj.setDate(0); 
        }

        const isFuture = dateObj > today;

        newTransactions.push({
          id: `TR-${Date.now()}-${i}`,
          companyId: companyId,
          description: `${trDesc} (${i + 1}/${installmentCount})`,
          amount: amount,
          type: trType,
          date: dateObj.toISOString(),
          status: isFuture ? 'PENDING' : 'PAID',
          category: trCategory || 'Geral',
          method: trMethod,
          installment: {
            parentId,
            current: i + 1,
            total: installmentCount
          }
        });
      }
    } else {
      const dateObj = new Date(trDate);
      const isFuture = dateObj > today;
      
      newTransactions.push({
        id: `TR-${Date.now()}`,
        companyId: companyId,
        description: trDesc,
        amount: totalAmount,
        type: trType,
        date: dateObj.toISOString(),
        status: isFuture ? 'PENDING' : 'PAID',
        category: trCategory || 'Geral',
        method: trMethod
      });

      // Lógica de Taxa Automática (apenas para transação única e Receita)
      if (trType === 'INCOME' && !isFuture && currentCompany && (trMethod === 'CREDIT' || trMethod === 'DEBIT')) {
        let feeRate = 0;
        let feeName = '';

        if (trMethod === 'CREDIT') {
          feeRate = currentCompany.creditCardFee || 0;
          feeName = 'Crédito';
        } else if (trMethod === 'DEBIT') {
          feeRate = currentCompany.debitCardFee || 0;
          feeName = 'Débito';
        }

        if (feeRate > 0) {
          const feeAmount = totalAmount * (feeRate / 100);
          newTransactions.push({
            id: `FEE-${Date.now()}`,
            companyId: companyId,
            description: `Taxa Cartão ${feeName} - ${trDesc}`,
            amount: feeAmount,
            type: 'EXPENSE',
            date: dateObj.toISOString(),
            status: 'PAID',
            category: 'Taxas Financeiras',
            method: 'Automático'
          });
        }
      }
    }
    
    // Salvar todas as transações geradas
    for (const tr of newTransactions) {
      await databaseService.insertOne<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, tr);
    }
    
    const updatedTransactions = await databaseService.fetch<TransactionType>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY);
    setTransactions(updatedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    setIsModalOpen(false); 
    setTrDesc(''); 
    setTrAmount(''); 
    setTrCategory('');
    setTrMethod('');
    setIsInstallment(false);
    setInstallmentCount(2);
    setTrDate(new Date().toISOString().split('T')[0]);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !newCategoryName.trim()) return;

    const newCat: FinanceCategory = {
      id: `CAT-${Date.now()}`,
      companyId,
      name: newCategoryName,
      type: trType // Usa o tipo selecionado no modal
    };

    await databaseService.insertOne<FinanceCategory>(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY, newCat);
    
    const updatedCats = await databaseService.fetch<FinanceCategory>(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY);
    setCategories(updatedCats);
    setNewCategoryName('');
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Deseja excluir esta categoria?')) {
      await databaseService.deleteOne<FinanceCategory>(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY, id);
      const updatedCats = await databaseService.fetch<FinanceCategory>(CATEGORIES_TABLE_NAME, CATEGORIES_STORAGE_KEY);
      setCategories(updatedCats);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando Financeiro...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 print:pb-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Controladoria Financeira</h1>
          <p className="text-slate-500 text-sm font-medium">Fechamento de caixa, DRE e fluxo de caixa.</p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => { setTrType('EXPENSE'); setIsCategoryManagerOpen(true); }} className="px-4 py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Settings2 size={16} /> Categorias
           </button>
           <button onClick={handlePrint} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all">
              <Printer size={16} /> Imprimir Relatório
           </button>
           <button onClick={() => { setTrType('EXPENSE'); setIsModalOpen(true); setTrCategory(''); setTrMethod(''); setIsInstallment(false); }} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 hover:bg-rose-700 transition-all">
              <ArrowDownCircle size={16} /> Despesa
           </button>
           <button onClick={() => { setTrType('INCOME'); setIsModalOpen(true); setTrCategory(''); setTrMethod(''); setIsInstallment(false); }} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg flex items-center gap-2 hover:bg-emerald-700 transition-all">
              <ArrowUpCircle size={16} /> Receita
           </button>
        </div>
      </div>

      {/* Barra de Filtros - Não imprime */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 no-print">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto w-full md:w-auto">
          <button onClick={() => applyDateFilter('TODAY')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPeriod === 'TODAY' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Hoje</button>
          <button onClick={() => applyDateFilter('WEEK')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPeriod === 'WEEK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>7 Dias</button>
          <button onClick={() => applyDateFilter('MONTH')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPeriod === 'MONTH' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Este Mês</button>
          <button onClick={() => setFilterPeriod('CUSTOM')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterPeriod === 'CUSTOM' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Personalizado</button>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">DE</span>
             <input type="date" value={dateRange.start} onChange={(e) => { setDateRange(prev => ({ ...prev, start: e.target.value })); setFilterPeriod('CUSTOM'); }} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 outline-none" />
           </div>
           <div className="relative flex-1">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">ATÉ</span>
             <input type="date" value={dateRange.end} onChange={(e) => { setDateRange(prev => ({ ...prev, end: e.target.value })); setFilterPeriod('CUSTOM'); }} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-700 outline-none" />
           </div>
        </div>
      </div>

      {/* Cabeçalho de Impressão (Só aparece na impressão) */}
      <div className="hidden print-only mb-8 text-center border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black text-slate-900 uppercase">Relatório de Fechamento</h2>
        <p className="text-sm text-slate-500 font-medium">Período: {new Date(dateRange.start).toLocaleDateString()} até {new Date(dateRange.end).toLocaleDateString()}</p>
        <p className="text-xs text-slate-400 mt-1">Gerado pelo sistema Multiplus SaaS</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm print:border-slate-200 print:bg-white">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm"><ArrowUpCircle size={18} /></div>
               <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Receitas do Período</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{formatToBRL(stats.income)}</p>
         </div>
         
         <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 shadow-sm print:border-slate-200 print:bg-white">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-white rounded-xl text-rose-600 shadow-sm"><ArrowDownCircle size={18} /></div>
               <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest">Despesas do Período</span>
            </div>
            <p className="text-2xl font-black text-rose-700">{formatToBRL(stats.expense)}</p>
         </div>

         <div className={`p-6 rounded-[2.5rem] border shadow-sm print:border-slate-200 print:bg-white ${stats.balance >= 0 ? 'bg-indigo-50 border-indigo-100' : 'bg-amber-50 border-amber-100'}`}>
            <div className="flex items-center gap-3 mb-2">
               <div className={`p-2 bg-white rounded-xl shadow-sm ${stats.balance >= 0 ? 'text-indigo-600' : 'text-amber-600'}`}><DollarSign size={18} /></div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${stats.balance >= 0 ? 'text-indigo-800' : 'text-amber-800'}`}>Resultado (Saldo)</span>
            </div>
            <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-indigo-700' : 'text-amber-700'}`}>{formatToBRL(stats.balance)}</p>
         </div>

         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm print:hidden">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-slate-50 rounded-xl text-slate-600 shadow-sm"><TrendingUp size={18} /></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margem de Lucro</span>
            </div>
            <p className={`text-2xl font-black ${stats.profitMargin > 0 ? 'text-emerald-600' : 'text-rose-400'}`}>
               {stats.profitMargin.toFixed(1)}%
            </p>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Indice de despesas: {stats.expenseRatio.toFixed(1)}%</p>
         </div>
      </div>

      {/* Relatório de Saúde Financeira (Texto) */}
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 print:bg-white print:border-slate-200">
         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 size={16} className="text-indigo-600"/> Diagnóstico do Período</h3>
         <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Neste período ({new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}), a empresa registrou um total de <strong>{filteredTransactions.length} movimentações</strong>. 
            {stats.balance > 0 
               ? ` O saldo é POSITIVO, indicando saúde financeira. Sua margem de lucro operacional é de ${stats.profitMargin.toFixed(1)}%.` 
               : ` O saldo é NEGATIVO. As despesas consumiram ${stats.expenseRatio.toFixed(1)}% das receitas. É recomendável revisar custos operacionais.`}
         </p>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden print:border-0 print:shadow-none">
         {filteredTransactions.length === 0 ? (
           <div className="py-24 text-center text-slate-300 uppercase font-black tracking-widest text-xs">Nenhum lançamento neste período</div>
         ) : (
           <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50 print:bg-slate-100">
                  <th className="px-8 py-5">Data/Venc.</th>
                  <th className="px-8 py-5">Descrição</th>
                  <th className="px-8 py-5">Categoria</th>
                  <th className="px-8 py-5 text-center">Tipo</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 print:divide-slate-200">
                {filteredTransactions.map(tr => (
                  <tr key={tr.id} className="hover:bg-slate-50 transition-all print:hover:bg-white">
                    <td className="px-8 py-4 text-xs font-bold text-slate-500">{new Date(tr.date).toLocaleDateString()}</td>
                    <td className="px-8 py-4">
                      <p className="text-sm font-bold text-slate-900">{tr.description}</p>
                      {tr.installment && (
                         <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                           {tr.installment.current}/{tr.installment.total}
                         </span>
                      )}
                    </td>
                    <td className="px-8 py-4">
                       {tr.category && (
                         <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg">
                           <Tag size={10} className="text-slate-400"/>
                           <span className="text-[10px] font-bold text-slate-600 uppercase">{tr.category}</span>
                         </div>
                       )}
                    </td>
                    <td className="px-8 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${tr.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 print:bg-transparent print:text-black' : 'bg-rose-50 text-rose-600 print:bg-transparent print:text-black'}`}>
                          {tr.type === 'INCOME' ? 'Receita' : 'Despesa'}
                       </span>
                    </td>
                    <td className="px-8 py-4 text-center">
                        {tr.status === 'PENDING' ? (
                            <span className="flex items-center justify-center gap-1 text-[9px] font-bold text-amber-500 uppercase tracking-widest"><Clock size={10}/> Pendente</span>
                        ) : (
                            <span className="flex items-center justify-center gap-1 text-[9px] font-bold text-emerald-500 uppercase tracking-widest"><CheckCircle2 size={10}/> Pago</span>
                        )}
                    </td>
                    <td className={`px-8 py-4 text-right font-black text-sm ${tr.type === 'INCOME' ? 'text-emerald-600 print:text-black' : 'text-rose-600 print:text-black'}`}>
                       {tr.type === 'INCOME' ? '+' : '-'} {formatToBRL(tr.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 print:bg-white print:border-t-2 print:border-black">
                 <tr>
                    <td colSpan={5} className="px-8 py-5 text-right text-xs font-black uppercase text-slate-500 tracking-widest">Saldo Final do Relatório</td>
                    <td className="px-8 py-5 text-right text-base font-black text-slate-900">{formatToBRL(stats.balance)}</td>
                 </tr>
              </tfoot>
           </table>
         )}
      </div>

      {/* MODAL DE ADICIONAR TRANSAÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-slate-900 uppercase">{trType === 'INCOME' ? 'Nova Receita' : 'Novo Gasto'}</h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24}/></button>
              </div>
              <form onSubmit={handleAddTransaction} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Descrição</label>
                    <input type="text" value={trDesc} onChange={e => setTrDesc(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Ex: Venda Balcão, Luz, Água..." required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Valor Total (R$)</label>
                        <input type="text" value={trAmount} onChange={e => {const val = e.target.value.replace(/\D/g, ''); setTrAmount((Number(val)/100).toLocaleString('pt-BR', {minimumFractionDigits: 2}))}} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-lg font-black outline-none" placeholder="0,00" required />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Data / Início</label>
                        <input type="date" value={trDate} onChange={e => setTrDate(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" required />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Categoria</label>
                    <select value={trCategory} onChange={e => setTrCategory(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none cursor-pointer appearance-none">
                        <option value="">Selecione...</option>
                        {categories.filter(c => c.type === trType).map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                    </select>
                 </div>

                 {/* Seção Método de Pagamento (Apenas para Receitas) */}
                 {trType === 'INCOME' && (
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Forma de Pagamento</label>
                      <select value={trMethod} onChange={e => setTrMethod(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none cursor-pointer appearance-none">
                          <option value="">Outros / Dinheiro</option>
                          <option value="PIX">Pix</option>
                          <option value="CREDIT">Cartão de Crédito</option>
                          <option value="DEBIT">Cartão de Débito</option>
                      </select>
                      {simulatedFee && (
                         <div className="mt-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400">
                               <span>Valor Bruto (Entrada):</span>
                               <span>{formatToBRL(simulatedFee.fee + simulatedFee.net)}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-rose-500">
                               <span>(-) Taxa Admin ({simulatedFee.rate}%):</span>
                               <span>{formatToBRL(simulatedFee.fee)}</span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-emerald-600">
                               <span>Líquido Estimado:</span>
                               <span>{formatToBRL(simulatedFee.net)}</span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic pt-2">* A taxa será lançada como uma despesa separada.</p>
                         </div>
                      )}
                   </div>
                 )}

                 {/* Seção de Parcelamento */}
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-2"><CalendarDays size={16} className="text-indigo-600"/> Parcelamento</span>
                        <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 checked:right-0 checked:border-indigo-600" checked={isInstallment} onChange={e => setIsInstallment(e.target.checked)}/>
                            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 cursor-pointer"></label>
                        </div>
                    </div>
                    {isInstallment && (
                        <div className="animate-in slide-in-from-top-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Número de Parcelas</label>
                             <div className="flex items-center gap-4">
                                <input 
                                    type="number" 
                                    min="2" 
                                    max="60" 
                                    value={installmentCount} 
                                    onChange={e => setInstallmentCount(parseInt(e.target.value))} 
                                    className="w-20 px-4 py-3 bg-white border-none rounded-2xl text-center text-sm font-black outline-none" 
                                />
                                <div className="flex-1 text-[10px] text-slate-500 font-bold">
                                    {trAmount && (
                                        <span>
                                            {installmentCount}x de {((parseFloat(trAmount.replace(/\D/g, '')) / 100) / installmentCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    )}
                                </div>
                             </div>
                             <p className="text-[9px] text-slate-400 mt-3 leading-tight">Serão gerados lançamentos mensais automáticos com vencimento no mesmo dia dos meses seguintes.</p>
                        </div>
                    )}
                 </div>

                 <button type="submit" className={`w-full py-5 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl transition-all ${trType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                    Confirmar {trType === 'INCOME' ? 'Entrada' : 'Saída'} {isInstallment ? 'Parcelada' : ''}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* MODAL DE GERENCIAR CATEGORIAS */}
      {isCategoryManagerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 no-print">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsCategoryManagerOpen(false)}></div>
           <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-slate-900 uppercase">Gerenciar Categorias</h2>
                 <button onClick={() => setIsCategoryManagerOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24}/></button>
              </div>

              <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-6 shrink-0">
                   <button type="button" onClick={() => setTrType('INCOME')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trType === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Receitas</button>
                   <button type="button" onClick={() => setTrType('EXPENSE')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trType === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>Despesas</button>
              </div>

              <div className="overflow-y-auto flex-1 mb-6 pr-2 custom-scrollbar space-y-2">
                 {categories.filter(c => c.type === trType).map(cat => (
                   <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                   </div>
                 ))}
                 {categories.filter(c => c.type === trType).length === 0 && (
                   <p className="text-center text-[10px] text-slate-400 font-bold py-4 uppercase">Nenhuma categoria cadastrada</p>
                 )}
              </div>

              <form onSubmit={handleCreateCategory} className="shrink-0 pt-6 border-t border-slate-100">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nova Categoria de {trType === 'INCOME' ? 'Receita' : 'Despesa'}</label>
                 <div className="flex gap-3">
                   <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="flex-1 px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Digite o nome..." required />
                   <button type="submit" className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg hover:bg-black transition-all"><Plus size={20} /></button>
                 </div>
              </form>
           </div>
        </div>
      )}
      <style>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #6366f1;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #6366f1;
        }
      `}</style>
    </div>
  );
};