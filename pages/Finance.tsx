
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Minus,
  Search, 
  MoreVertical, 
  X,
  TrendingUp,
  CreditCard,
  Printer,
  BarChart3,
  Wallet,
  ArrowRightLeft,
  Banknote,
  QrCode,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  Tag,
  FileText,
  Target,
  Users,
  Download,
  // Fix: Added missing CheckCircle2 import from lucide-react
  CheckCircle2
} from 'lucide-react';

const mockTransactions = [
  { id: 'TR-101', desc: 'Venda de iPhone 13 Pro (VEN-001)', amount: 850.00, type: 'INCOME', status: 'PAID', date: '2024-03-20', category: 'Vendas de Produtos', account: 'Caixa Local', method: 'PIX' },
  { id: 'TR-102', desc: 'Aluguel Unidade Matriz', amount: 3500.00, type: 'EXPENSE', status: 'PENDING', date: '2024-04-05', category: 'Despesas Fixas', account: 'Banco Itaú', method: 'BOLETO' },
  { id: 'TR-103', desc: 'Fornecedor de Telas LCD', amount: 1200.00, type: 'EXPENSE', status: 'PAID', date: '2024-03-18', category: 'Custo de Mercadoria', account: 'Banco Itaú', method: 'TED' },
  { id: 'TR-104', desc: 'Serviço Manutenção S22', amount: 450.00, type: 'INCOME', status: 'PAID', date: '2024-03-19', category: 'Serviços Técnicos', account: 'Pix', method: 'PIX' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Finance: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'closures' | 'dre'>('overview');
  const [closurePeriod, setClosurePeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [transactions, setTransactions] = useState(mockTransactions);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const [trDesc, setTrDesc] = useState('');
  const [trAmount, setTrAmount] = useState('');
  const [trType, setTrType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [trCategory, setTrCategory] = useState('Despesas Fixas');
  const [trStatus, setTrStatus] = useState<'PAID' | 'PENDING'>('PENDING');
  const [trMethod, setTrMethod] = useState('DINHEIRO');

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const pix = transactions.filter(t => t.method === 'PIX' && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const card = transactions.filter(t => (t.method === 'CARTÃO' || t.method === 'CRÉDITO' || t.method === 'DÉBITO') && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const cash = transactions.filter(t => t.method === 'DINHEIRO' && t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      netProfit: income - expense,
      overdue: transactions.filter(t => t.status === 'OVERDUE').reduce((acc, t) => acc + t.amount, 0),
      pending: transactions.filter(t => t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0),
      mix: { pix, card, cash }
    };
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(trAmount.replace(/\D/g, '')) / 100;
    const newTr = {
      id: `TR-${Math.floor(Math.random() * 1000)}`,
      desc: trDesc,
      amount: cleanAmount,
      type: trType,
      status: trStatus as any,
      date: new Date().toISOString().split('T')[0],
      category: trCategory,
      account: 'Caixa Local',
      method: trMethod
    };
    setTransactions([newTr, ...transactions]);
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter(t => filterType === 'ALL' || t.type === filterType);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão Financeira</h1>
          <p className="text-slate-500 text-sm font-medium">Controle de receitas, despesas e fluxos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setTrType('EXPENSE'); setIsModalOpen(true); }} className="px-5 py-2.5 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 uppercase tracking-widest text-[10px]">
            <ArrowDownCircle size={18} className="mr-2" /> Despesa
          </button>
          <button onClick={() => { setTrType('INCOME'); setIsModalOpen(true); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-[10px]">
            <Plus size={18} className="mr-2" /> Receita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><ArrowUpCircle size={24} /></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receitas</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatToBRL(stats.totalIncome)}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><ArrowDownCircle size={24} /></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Despesas</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{formatToBRL(stats.totalExpense)}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp size={24} className="text-indigo-400" /></div>
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Saldo Líquido</span>
          </div>
          <p className="text-2xl font-black">{formatToBRL(stats.netProfit)}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex gap-4 items-center justify-between bg-slate-50/30 no-print">
           <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl">
              <button onClick={() => setActiveTab('overview')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Extrato</button>
              <button onClick={() => setActiveTab('closures')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'closures' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Fechamento</button>
              <button onClick={() => setActiveTab('dre')} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'dre' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>DRE</button>
           </div>
        </div>

        {activeTab === 'overview' && (
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-slate-50/20 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                   <th className="px-8 py-5">Lançamento</th>
                   <th className="px-8 py-5 text-right">Valor</th>
                   <th className="px-8 py-5 text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                 {filteredTransactions.map(tr => (
                   <tr key={tr.id} className="hover:bg-slate-50/50 transition-all">
                     <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-900">{tr.desc}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase">{tr.category}</span>
                     </td>
                     <td className={`px-8 py-5 text-right font-black text-sm ${tr.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tr.type === 'INCOME' ? '+' : '-'} {formatToBRL(tr.amount)}
                     </td>
                     <td className="px-8 py-5 text-center">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${tr.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {tr.status === 'PAID' ? 'Liquidado' : 'Pendente'}
                        </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        )}

        {activeTab === 'dre' && (
           <div className="p-8 md:p-12 max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 no-print">
                 <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Análise de Resultado (DRE)</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Visão Contábil Consolidada</p>
                 </div>
                 <button 
                   onClick={() => window.print()} 
                   className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]"
                 >
                   <Download size={18} className="mr-2" /> Exportar PDF
                 </button>
              </div>

              {/* Printable Area */}
              <div className="space-y-6 bg-white print:p-0 print:shadow-none">
                 <div className="print-only mb-10 text-center border-b border-slate-200 pb-8">
                    <h1 className="text-2xl font-black uppercase text-slate-900">Demonstração do Resultado do Exercício</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Unidade Multiplus SaaS - Relatório de Competência</p>
                 </div>

                 <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white text-emerald-600 rounded-2xl shadow-sm"><ArrowUpCircle size={24} /></div>
                       <span className="text-xs md:text-sm font-black text-slate-600 uppercase tracking-widest">(+) Receita Bruta Operacional</span>
                    </div>
                    <span className="text-lg md:text-xl font-black text-slate-900">{formatToBRL(stats.totalIncome)}</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-8 bg-rose-50/40 rounded-[2rem] border border-rose-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-sm"><ArrowDownCircle size={24} /></div>
                       <span className="text-xs md:text-sm font-black text-rose-600 uppercase tracking-widest">(-) Deduções e Impostos</span>
                    </div>
                    <span className="text-lg md:text-xl font-black text-rose-600">-{formatToBRL(stats.totalIncome * 0.06)}</span>
                 </div>

                 <div className="flex items-center justify-between p-8 bg-slate-50/40 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white text-slate-400 rounded-2xl shadow-sm"><FileText size={24} /></div>
                       <span className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest">(=) Receita Líquida</span>
                    </div>
                    <span className="text-lg md:text-xl font-black text-slate-700">{formatToBRL(stats.totalIncome * 0.94)}</span>
                 </div>

                 <div className="flex items-center justify-between p-8 bg-rose-50/40 rounded-[2rem] border border-rose-100">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-white text-rose-600 rounded-2xl shadow-sm"><Minus size={24} /></div>
                       <span className="text-xs md:text-sm font-black text-rose-600 uppercase tracking-widest">(-) Custos Operacionais / CMV</span>
                    </div>
                    <span className="text-lg md:text-xl font-black text-rose-600">-{formatToBRL(stats.totalExpense)}</span>
                 </div>

                 <div className="flex items-center justify-between p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3rem] text-white shadow-2xl shadow-indigo-200">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-1">Resultado Líquido</span>
                       <span className="text-xl md:text-2xl font-black uppercase tracking-widest">Lucro Real do Período</span>
                    </div>
                    <span className="text-3xl md:text-4xl font-black">{formatToBRL((stats.totalIncome * 0.94) - stats.totalExpense)}</span>
                 </div>
              </div>

              <div className="print-only mt-20 text-center border-t border-slate-100 pt-8">
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gerado automaticamente via Multiplus SaaS - Digital Personal</p>
              </div>
           </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={`p-10 border-b border-slate-50 flex items-center justify-between ${trType === 'INCOME' ? 'bg-emerald-50/30' : 'bg-rose-50/30'}`}>
              <div>
                <h2 className="text-2xl font-black text-slate-900">{trType === 'INCOME' ? 'Nova Receita' : 'Lançar Despesa'}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Controle Profissional de Fluxo de Caixa</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 bg-white rounded-2xl border border-slate-100 shadow-sm"><X size={20} /></button>
            </div>
            
            <form className="p-10 space-y-8" onSubmit={handleAddTransaction}>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Descrição do Lançamento</label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input 
                        autoFocus
                        type="text" 
                        value={trDesc}
                        onChange={e => setTrDesc(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" 
                        placeholder="Ex: Aluguel Unidade 01"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Valor (R$)</label>
                      <div className="relative">
                        <DollarSign className={`absolute left-4 top-1/2 -translate-y-1/2 ${trType === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`} size={18} />
                        <input 
                          type="text" 
                          value={trAmount}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            const masked = (Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            setTrAmount(masked);
                          }}
                          className={`w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-lg font-black outline-none ${trType === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`} 
                          placeholder="0,00"
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Forma de Pagamento</label>
                      <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select 
                          value={trMethod}
                          onChange={e => setTrMethod(e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none appearance-none cursor-pointer"
                        >
                          <option value="DINHEIRO">Dinheiro (Em Mãos)</option>
                          <option value="PIX">Pix (Transferência)</option>
                          <option value="CARTÃO">Cartão (Débito/Crédito)</option>
                          <option value="TED">Transferência/TED</option>
                          <option value="BOLETO">Boleto Bancário</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Categoria Financeira</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select 
                          value={trCategory}
                          onChange={e => setTrCategory(e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none appearance-none cursor-pointer"
                        >
                          {trType === 'INCOME' ? (
                            <>
                              <option>Vendas de Produtos</option>
                              <option>Serviços Técnicos</option>
                              <option>Acessórios</option>
                              <option>Outras Receitas</option>
                            </>
                          ) : (
                            <>
                              <option>Despesas Fixas</option>
                              <option>Custo de Mercadoria</option>
                              <option>Marketing / ADS</option>
                              <option>Salários / Pró-labore</option>
                              <option>Manutenção / Reparos</option>
                              <option>Impostos / Taxas</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-end">
                       <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full">
                          <button type="button" onClick={() => setTrStatus('PENDING')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trStatus === 'PENDING' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Pendente</button>
                          <button type="button" onClick={() => setTrStatus('PAID')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${trStatus === 'PAID' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Liquidado</button>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="pt-4">
                  <button type="submit" className={`w-full py-5 text-white rounded-[1.5rem] font-black shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-xs ${trType === 'INCOME' ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 'bg-rose-600 shadow-rose-100 hover:bg-rose-700'}`}>
                    <CheckCircle2 size={20} /> {trType === 'INCOME' ? 'Confirmar Recebimento' : 'Lançar Despesa'}
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { display: block !important; }
        }
      `}</style>
    </div>
  );
};
