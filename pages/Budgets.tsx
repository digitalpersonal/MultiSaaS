
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, FileText, CheckCircle2, X, Trash2, Printer, Calendar, User, ShoppingCart, ArrowRight, DollarSign, Package, Share2, Phone, Zap, Wrench, ArrowUpRight, ArrowLeftCircle, Box } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Budget, BudgetItem, Product, Customer, UserRole, Transaction, Company, ServiceOrder, OSStatus } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { BUDGET_STATUS_LABELS, BUDGET_STATUS_COLORS } from '../constants';


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
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';
  const OS_STORAGE_KEY = 'multiplus_os';
  const OS_TABLE_NAME = 'os';

  const navigate = useNavigate();
  const location = useLocation();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'ALL' | 'PHYSICAL' | 'SERVICE'>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [cartItems, setCartItems] = useState<BudgetItem[]>([]);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  // Link com OS
  const [linkedOsId, setLinkedOsId] = useState<string | undefined>(undefined);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedBudget, setLastCreatedBudget] = useState<Budget | null>(null);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [manualPhone, setManualPhone] = useState('');

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
      const cData = await databaseService.fetch<Customer>(CUSTOMER_STORAGE_KEY, CUSTOMER_STORAGE_KEY);
      
      if (companyId) {
        const tenants = await databaseService.fetch<Company>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
        const comp = tenants.find(t => t.id === companyId);
        setCurrentCompany(comp || null);
      }

      setBudgets(bData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setProducts(pData);
      setCustomers(cData);
      setIsLoading(false);

      if (location.state && location.state.osData) {
        const os: ServiceOrder = location.state.osData;
        handleOpenModalFromOS(os, cData);
        window.history.replaceState({}, document.title);
      }
    };
    loadData();
  }, [companyId, location.state]);

  const handleOpenModal = () => {
    setSelectedCustomer(null); setCustomerSearch(''); setProductSearch(''); setItemTypeFilter('ALL'); setCartItems([]); setNotes(''); setLinkedOsId(undefined);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); setValidUntil(nextWeek.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleOpenModalFromOS = (os: ServiceOrder, allCustomers: Customer[]) => {
    const cust = allCustomers.find(c => c.id === os.customerId);
    setSelectedCustomer(cust || { id: os.customerId, name: os.customerName, phone: os.phone || '', email: '', taxId: '', type: 'INDIVIDUAL', companyId: os.companyId } as Customer);
    setCustomerSearch(os.customerName); setProductSearch(''); setItemTypeFilter('ALL'); setCartItems([]);
    setNotes(`Ref. OS #${os.id} - ${os.equipment}. Defeito: ${os.defect}`); setLinkedOsId(os.id);
    const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7); setValidUntil(nextWeek.toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const addItemToBudget = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) return prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i);
      return [...prev, { productId: product.id, name: product.name, quantity: 1, unitPrice: product.salePrice, total: product.salePrice }];
    });
    setProductSearch('');
  };

  const removeItemFromBudget = (productId: string) => setCartItems(prev => prev.filter(i => i.productId !== productId));

  const updateItemQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: newQty, total: newQty * i.unitPrice } : i));
  };

  const handleCreateBudget = async () => {
    if (!companyId) return;
    const totalValue = cartItems.reduce((acc, item) => acc + item.total, 0);
    const newBudget: Budget = {
      id: `ORC-${Date.now().toString().slice(-6)}`, companyId, customerId: selectedCustomer?.id, customerName: selectedCustomer?.name || customerSearch || 'Cliente Visitante',
      items: cartItems, totalValue, discount: 0, finalValue: totalValue, status: 'OPEN', createdAt: new Date().toISOString(), validUntil, notes, linkedOsId
    };

    await databaseService.insertOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, newBudget);
    if (linkedOsId) await databaseService.updateOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, linkedOsId, { status: OSStatus.BUDGET_PENDING, price: totalValue });

    const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
    setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLastCreatedBudget(newBudget); setIsModalOpen(false); setShowSuccessModal(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Excluir orçamento?')) {
      await databaseService.deleteOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, id);
      const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
      setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };
  
  const handleUpdateBudgetStatus = async (budgetId: string, newStatus: 'APPROVED' | 'REJECTED') => {
    if (confirm(`Confirmar que o cliente ${newStatus === 'APPROVED' ? 'APROVOU' : 'REJEITOU'} o orçamento?`)) {
        await databaseService.updateOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, budgetId, { status: newStatus });
        const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
        setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  };

  const handleConvertToOS = async (budget: Budget) => {
    if (!companyId) return;
    const itemsDescription = budget.items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    if (budget.linkedOsId) {
        await databaseService.updateOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, budget.linkedOsId, {
            status: OSStatus.IN_REPAIR, 
            price: budget.finalValue,
            defect: `APROVADO: ${itemsDescription}. ${budget.notes || ''}`
        });
        alert(`O Orçamento foi APROVADO! O Item agora está em Reparo.`);
        navigate('/servicos');
    } else {
        const newOS: ServiceOrder = {
            id: `OS-${Date.now().toString().slice(-5)}`, companyId, customerId: budget.customerId || 'avulso', customerName: budget.customerName, equipment: 'Item sob Orçamento',
            defect: `Aprovados: ${itemsDescription}. ${budget.notes || ''}`, status: OSStatus.IN_REPAIR, price: budget.finalValue, date: new Date().toISOString(),
            checklist: { power: 'NOT_TESTED', functionality: 'NOT_TESTED', physicalState: 'NOT_TESTED', safety: 'NOT_TESTED', cleaning: 'NOT_TESTED', accessories: 'NOT_TESTED' },
            itemCondition: 'Vindo de Orçamento Aprovado',
        };
        await databaseService.insertOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, newOS);
        alert('Orçamento Aprovado! Nova OS em execução.'); navigate('/servicos');
    }

    await databaseService.updateOne<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY, budget.id, { status: 'CONVERTED' });
    const updatedBudgets = await databaseService.fetch<Budget>(BUDGET_TABLE_NAME, BUDGET_STORAGE_KEY);
    setBudgets(updatedBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleWhatsAppShare = (budget?: Budget) => {
    const targetBudget = budget || lastCreatedBudget;
    if (!targetBudget) return;
    const customer = customers.find(c => c.id === targetBudget.customerId);
    const phoneToUse = manualPhone || customer?.phone?.replace(/\D/g, '');
    
    if (!phoneToUse || phoneToUse.length < 8) { setShowPhoneInput(true); return; }

    const message = `Olá ${targetBudget.customerName}! Segue proposta de orçamento.\n*Valor:* ${formatToBRL(targetBudget.finalValue)}\n\nItens:\n${targetBudget.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n')}`;
    window.open(`https://wa.me/${phoneToUse}?text=${encodeURIComponent(message)}`, '_blank'); 
    setShowPhoneInput(false);
  };

  const filteredBudgets = budgets.filter(b => b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) && (itemTypeFilter === 'ALL' || (itemTypeFilter === 'PHYSICAL' && p.type !== 'SERVICE') || (itemTypeFilter === 'SERVICE' && p.type === 'SERVICE')));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Orçamentos</h1><p className="text-slate-500 text-sm font-medium">Propostas comerciais profissionais.</p></div>
        <button onClick={handleOpenModal} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] flex items-center gap-2"><Plus size={18} /> Novo Orçamento</button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar orçamentos..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div></div>

      {filteredBudgets.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100"><FileText size={64} className="mx-auto text-slate-100 mb-6" /><p className="text-slate-400 font-black uppercase tracking-widest text-xs">Vazio</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBudgets.map(budget => (
            <div key={budget.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0"><FileText size={20} /></div>
                 <div>
                    <div className="flex items-center gap-2"><h3 className="text-sm font-black text-slate-900 uppercase">{budget.id}</h3><span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${BUDGET_STATUS_COLORS[budget.status] || 'bg-slate-100 text-slate-700'}`}>{BUDGET_STATUS_LABELS[budget.status] || budget.status}</span></div>
                    <p className="text-sm font-bold text-slate-600">{budget.customerName}</p>
                 </div>
              </div>
              <div className="flex flex-col items-end min-w-[120px]"><p className="text-[10px] font-bold text-slate-400 uppercase">Total</p><p className="text-xl font-black text-slate-900">{formatToBRL(budget.finalValue)}</p></div>
              <div className="flex items-center gap-2">
                 {budget.status === 'OPEN' && (
                  <><button onClick={() => handleUpdateBudgetStatus(budget.id, 'APPROVED')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase">Aprovar</button><button onClick={() => handleUpdateBudgetStatus(budget.id, 'REJECTED')} className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase">Rejeitar</button></>
                 )}
                 {budget.status === 'APPROVED' && (
                  <button onClick={() => handleConvertToOS(budget)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><Wrench size={14} /> Iniciar Reparo</button>
                 )}
                 <button className="p-2 text-slate-400 hover:text-emerald-500" onClick={() => handleWhatsAppShare(budget)}><Share2 size={18} /></button>
                 <button className="p-2 text-slate-400 hover:text-indigo-600" onClick={() => window.print()}><Printer size={18} /></button>
                 <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={18} /></button>
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
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50"><h2 className="text-xl font-black text-slate-900 uppercase">Novo Orçamento</h2><button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={24} /></button></div>
             <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {linkedOsId && <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center gap-3"><div className="p-2 bg-indigo-200 text-indigo-700 rounded-lg"><Wrench size={16}/></div><p className="text-xs font-bold text-indigo-800">Vinculado à O.S. #{linkedOsId}.</p></div>}
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><User size={14} className="text-indigo-600"/> Cliente</h3>
                   <input type="text" placeholder="Buscar cliente..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={customerSearch} onChange={e => {setCustomerSearch(e.target.value); setSelectedCustomer(null);}} />
                </div>
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box size={14} className="text-indigo-600"/> Adicionar Itens</h3>
                   <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-full"><button onClick={() => setItemTypeFilter('ALL')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase ${itemTypeFilter === 'ALL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Todos</button><button onClick={() => setItemTypeFilter('PHYSICAL')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase ${itemTypeFilter === 'PHYSICAL' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Produtos</button><button onClick={() => setItemTypeFilter('SERVICE')} className={`flex-1 px-4 py-2 rounded-lg text-[10px] font-black uppercase ${itemTypeFilter === 'SERVICE' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Serviços</button></div>
                   <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Buscar item..." className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={productSearch} onChange={e => setProductSearch(e.target.value)}/>
                      {productSearch && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
                            {filteredProducts.map(p => (
                               <button key={p.id} onClick={() => addItemToBudget(p)} className="w-full flex justify-between items-center px-6 py-4 hover:bg-slate-50 border-b border-slate-50 text-left"><div><p className="text-sm font-black text-slate-900">{p.name}</p></div><span className="text-sm font-black text-emerald-600">{formatToBRL(p.salePrice)}</span></button>
                            ))}
                         </div>
                      )}
                   </div>
                   <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      {cartItems.map(item => (
                         <div key={item.productId} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100"><span className="text-sm font-bold flex-1 truncate">{item.name}</span><div className="flex items-center gap-3"><input type="number" min="1" className="w-16 bg-slate-50 rounded-lg py-1 px-2 text-center text-sm font-bold outline-none" value={item.quantity} onChange={e => updateItemQuantity(item.productId, parseInt(e.target.value))}/><span className="text-sm font-black min-w-[80px] text-right">{formatToBRL(item.total)}</span><button onClick={() => removeItemFromBudget(item.productId)} className="text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button></div></div>
                      ))}
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-4"><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Validade</label><input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" /></div><div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Total</label><div className="w-full px-6 py-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-xl font-black text-indigo-700 flex items-center gap-2"><DollarSign size={20} />{formatToBRL(cartItems.reduce((acc, i) => acc + i.total, 0))}</div></div></div>
                <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Observações</label><textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none resize-none" placeholder="Detalhes técnicos ou comerciais..." /></div>
             </div>
             <div className="p-8 border-t border-slate-100 bg-white"><button onClick={handleCreateBudget} disabled={cartItems.length === 0} className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-xl disabled:opacity-50">Gerar Proposta</button></div>
          </div>
        </div>
      )}

      {/* MODAL SUCESSO */}
      {showSuccessModal && lastCreatedBudget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setShowSuccessModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[4rem] p-12 text-center shadow-2xl animate-in zoom-in">
             <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><FileText size={48} /></div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Orçamento Criado!</h2>
             <div className="space-y-3">
                <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl"><Printer size={18} /> Imprimir</button>
                <button onClick={() => handleWhatsAppShare()} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] flex items-center justify-center gap-3 shadow-xl"><Share2 size={18} /> Enviar WhatsApp</button>
                <button onClick={() => setShowSuccessModal(false)} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-3xl font-black uppercase text-[10px]">Fechar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
