import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FileText, CheckCircle2, X, Trash2, Printer, Calendar, User, ShoppingCart, ArrowRight, DollarSign, Package } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Budget, BudgetItem, Product, Customer, UserRole, Transaction } from '../types';
import { useNavigate } from 'react-router-dom';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Budgets: React.FC = () => {
  const BUDGET_STORAGE_KEY = 'multiplus_budgets';
  const BUDGET_TABLE_NAME = 'budgets';
  const INVENTORY_STORAGE_KEY = 'multiplus_inventory';
  const INVENTORY_TABLE_NAME = 'inventory';
  const CUSTOMER_STORAGE_KEY = 'multiplus_customers';
  const CUSTOMER_TABLE_NAME = 'customers';
  const FINANCE_STORAGE_KEY = 'multiplus_finance';
  const FINANCE_TABLE_NAME = 'finance';

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<BudgetItem[]>([]);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');

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
      const bData = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
      const pData = await databaseService.fetch<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY);
      const cData = await databaseService.fetch<Customer>(CUSTOMER_TABLE_NAME, CUSTOMER_STORAGE_KEY);
      
      setBudgets(bData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProducts(pData);
      setCustomers(cData);
      setIsLoading(false);
    };
    loadData();
  }, [companyId]);

  const handleOpenModal = () => {
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProductSearch('');
    setCartItems([]);
    setNotes('');
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setValidUntil(nextWeek.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const addItemToBudget = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.salePrice,
        total: product.salePrice
      }];
    });
    setProductSearch('');
  };

  const removeItemFromBudget = (productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateItemQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQty, total: newQty * i.unitPrice } : i));
  };

  const handleCreateBudget = async () => {
    if (!companyId) return;
    
    const totalValue = cartItems.reduce((acc, item) => acc + item.total, 0);
    
    const newBudget: Budget = {
      id: `ORC-${Date.now().toString().slice(-6)}`,
      companyId,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || customerSearch || 'Cliente Visitante',
      items: cartItems,
      totalValue,
      discount: 0,
      finalValue: totalValue,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      validUntil,
      notes
    };

    await databaseService.insertOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, newBudget);
    const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
    setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setIsModalOpen(false);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      await databaseService.deleteOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, id);
      const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
      setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleConvertToSale = async (budget: Budget) => {
    if (!companyId) return;
    if (budget.status === 'CONVERTED') return;

    if (!confirm(`Deseja EFETIVAR este orçamento?\n\nIsso irá:\n1. Baixar o estoque dos itens\n2. Lançar R$ ${formatToBRL(budget.finalValue)} no financeiro\n3. Marcar o orçamento como CONVERTIDO`)) {
      return;
    }

    // 1. Atualizar Financeiro
    const newTransaction: Transaction = {
      id: `FIN-${Date.now()}`,
      companyId,
      description: `Venda ref. Orçamento ${budget.id}`,
      amount: budget.finalValue,
      type: 'INCOME',
      status: 'PAID',
      date: new Date().toISOString(),
      category: 'Vendas',
      method: 'Outros'
    };
    await databaseService.insertOne<Transaction>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, newTransaction);

    // 2. Baixar Estoque
    for (const item of budget.items) {
      const product = products.find(p => p.id === item.productId);
      if (product && product.type === 'PHYSICAL' && product.stock !== undefined) {
        const newStock = product.stock - item.quantity;
        await databaseService.updateOne<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY, product.id, { stock: newStock });
      }
    }

    // 3. Atualizar Status do Orçamento
    await databaseService.updateOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, budget.id, { status: 'CONVERTED' });

    // Atualizar UI
    const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
    setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    
    // Atualizar produtos locais para refletir baixa de estoque
    const updatedProducts = await databaseService.fetch<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY);
    setProducts(updatedProducts);

    alert('Venda efetuada com sucesso!');
  };

  const filteredBudgets = budgets.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando Orçamentos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Orçamentos</h1>
          <p className="text-slate-500 text-sm font-medium">Crie propostas e transforme em vendas.</p>
        </div>
        <button onClick={handleOpenModal} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2">
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input type="text" placeholder="Buscar por cliente ou nº do orçamento..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {filteredBudgets.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100">
           <FileText size={64} className="mx-auto text-slate-100 mb-6" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Nenhum orçamento encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBudgets.map(budget => (
            <div key={budget.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0">
                    <FileText size={20} />
                 </div>
                 <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">{budget.id}</h3>
                       <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          budget.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700' :
                          budget.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                          budget.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                       }`}>
                          {budget.status === 'CONVERTED' ? 'Venda Efetivada' : 
                           budget.status === 'APPROVED' ? 'Aprovado' :
                           budget.status === 'REJECTED' ? 'Rejeitado' : 'Em Aberto'}
                       </span>
                    </div>
                    <p className="text-sm font-bold text-slate-600">{budget.customerName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Calendar size={10} /> Criado em {new Date(budget.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="flex flex-col items-end min-w-[120px]">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor Total</p>
                 <p className="text-xl font-black text-slate-900">{formatToBRL(budget.finalValue)}</p>
              </div>

              <div className="flex items-center gap-2">
                 {budget.status === 'OPEN' && (
                    <button 
                      onClick={() => handleConvertToSale(budget)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
                      title="Transformar em Venda (Baixar Estoque)"
                    >
                       <ShoppingCart size={14} /> Efetivar Venda
                    </button>
                 )}
                 <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Imprimir" onClick={() => window.print()}><Printer size={18} /></button>
                 <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Excluir"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO ORÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl animate-in zoom-in flex flex-col max-h-[90vh] overflow-hidden">
             
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-black text-slate-900 uppercase">Novo Orçamento</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24} /></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* 1. Cliente */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={14} className="text-indigo-600"/> Dados do Cliente</h3>
                   <div className="relative">
                      <input 
                         type="text" 
                         placeholder="Buscar ou digitar nome do cliente..." 
                         className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none"
                         value={customerSearch}
                         onChange={e => {
                            setCustomerSearch(e.target.value);
                            setSelectedCustomer(null);
                         }}
                      />
                      {customerSearch && !selectedCustomer && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-40 overflow-y-auto">
                            {filteredCustomers.map(c => (
                               <button key={c.id} onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); }} className="w-full text-left px-6 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50 last:border-none">
                                  {c.name}
                               </button>
                            ))}
                         </div>
                      )}
                   </div>
                </div>

                {/* 2. Produtos */}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Package size={14} className="text-indigo-600"/> Adicionar Itens</h3>
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                         type="text" 
                         placeholder="Buscar produto para adicionar..." 
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none"
                         value={productSearch}
                         onChange={e => setProductSearch(e.target.value)}
                      />
                      {productSearch && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
                            {filteredProducts.map(p => (
                               <button key={p.id} onClick={() => addItemToBudget(p)} className="w-full flex justify-between items-center px-6 py-4 hover:bg-slate-50 border-b border-slate-50 last:border-none group">
                                  <div className="text-left">
                                     <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600">{p.name}</p>
                                     <p className="text-[10px] text-slate-400 uppercase">{p.sku ? `SKU: ${p.sku}` : 'Sem SKU'}</p>
                                  </div>
                                  <span className="text-sm font-black text-emerald-600">{formatToBRL(p.salePrice)}</span>
                               </button>
                            ))}
                         </div>
                      )}
                   </div>
                   
                   {/* Lista de Itens */}
                   <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      {cartItems.length === 0 && <p className="text-center text-[10px] text-slate-400 font-bold py-4 uppercase">Nenhum item adicionado</p>}
                      {cartItems.map(item => (
                         <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                            <span className="text-sm font-bold flex-1 truncate">{item.name}</span>
                            <div className="flex items-center gap-3">
                               <input 
                                  type="number" 
                                  min="1" 
                                  className="w-16 bg-slate-50 rounded-lg py-1 px-2 text-center text-sm font-bold outline-none"
                                  value={item.quantity}
                                  onChange={e => updateItemQuantity(item.productId, parseInt(e.target.value))}
                               />
                               <span className="text-sm font-black min-w-[80px] text-right">{formatToBRL(item.total)}</span>
                               <button onClick={() => removeItemFromBudget(item.productId)} className="text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>

                {/* 3. Detalhes Finais */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Validade da Proposta</label>
                      <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Total do Orçamento</label>
                      <div className="w-full px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xl font-black text-indigo-700 flex items-center gap-2">
                         <DollarSign size={20} />
                         {formatToBRL(cartItems.reduce((acc, i) => acc + i.total, 0))}
                      </div>
                   </div>
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Observações Internas</label>
                   <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none resize-none" placeholder="Detalhes adicionais..." />
                </div>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white">
                <button 
                   onClick={handleCreateBudget}
                   disabled={cartItems.length === 0}
                   className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                   Gerar Orçamento
                </button>
             </div>

          </div>
        </div>
      )}
    </div>
  );
};