import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, Tag, DollarSign, CreditCard, Banknote, QrCode, CheckCircle2, X, User, Printer, ShoppingBag, ArrowRight, ArrowLeft, Zap, Package, Store, UserPlus, ChevronLeft, Check, LayoutDashboard } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Product, Customer, Transaction, UserRole } from '../types';
import { useNavigate } from 'react-router-dom';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Sales: React.FC = () => {
  const INVENTORY_STORAGE_KEY = 'multiplus_inventory';
  const INVENTORY_TABLE_NAME = 'inventory';
  const CUSTOMER_STORAGE_KEY = 'multiplus_customers';
  const CUSTOMER_TABLE_NAME = 'customers';
  const FINANCE_STORAGE_KEY = 'multiplus_finance';
  const FINANCE_TABLE_NAME = 'finance';

  const navigate = useNavigate();
  const [flow, setFlow] = useState<'START' | 'ORDER' | 'CHECKOUT'>('START');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); 
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  const [cart, setCart] = useState<any[]>([]);
  const [discountValue, setDiscountValue] = useState('0,00');
  const [receivedValue, setReceivedValue] = useState('0,00'); // Não usado na finalização, mas pode ser útil para troco
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (flow === 'ORDER') searchInputRef.current?.focus(); 

    const loadData = async () => {
      setIsLoading(true);
      const inventoryData = await databaseService.fetch<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY);
      const customersData = await databaseService.fetch<Customer>(CUSTOMER_TABLE_NAME, CUSTOMER_STORAGE_KEY);
      setCatalog(inventoryData);
      setCustomers(customersData);
      setIsLoading(false);
    };
    loadData();
  }, [flow, companyId]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        // Verificar estoque disponível antes de adicionar
        const availableStock = product.stock !== undefined ? product.stock : Infinity;
        if (existing.quantity + 1 <= availableStock) {
          return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
          alert(`Estoque insuficiente para ${product.name}!`);
          return prev;
        }
      }
      // Verificar estoque para o primeiro item adicionado
      if (product.stock !== undefined && product.stock < 1) {
        alert(`Estoque insuficiente para ${product.name}!`);
        return prev;
      }
      return [...prev, { ...product, quantity: 1, price: product.salePrice }];
    });
    setSearchTerm('');
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        const productInCatalog = catalog.find(p => p.id === productId);
        const availableStock = productInCatalog?.stock !== undefined ? productInCatalog.stock : Infinity;

        if (newQuantity > 0 && newQuantity <= availableStock) {
          return { ...item, quantity: newQuantity };
        } else if (newQuantity === 0) {
          return { ...item, quantity: 0, _remove: true }; // Marca para remover
        } else if (newQuantity > availableStock) {
          alert(`Estoque máximo para ${item.name} alcançado!`);
        }
      }
      return item;
    }).filter(item => !item._remove));
  };


  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountNumeric = parseFloat(discountValue.replace(/\D/g, '')) / 100 || 0;
  const total = Math.max(0, subtotal - discountNumeric);

  const handleFinalize = async () => {
    if (!companyId) return;

    // 1. Registrar no financeiro
    const newTransaction: Transaction = { 
      id: `FIN-${Date.now()}`, 
      companyId: companyId,
      description: `Venda ${Date.now().toString().slice(-5)}`, // Usando description para texto
      amount: total, 
      type: 'INCOME', 
      status: 'PAID', 
      date: new Date().toISOString(), 
      method: paymentMethod || 'Não Informado' 
    };
    await databaseService.insertOne<Transaction>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, newTransaction);

    // 2. Decrementar estoque dos produtos vendidos
    for (const item of cart) {
      if (item.type === 'PHYSICAL' && item.stock !== undefined) {
        const currentProduct = catalog.find(p => p.id === item.id);
        if (currentProduct) {
          const updatedStock = (currentProduct.stock || 0) - item.quantity;
          await databaseService.updateOne<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY, item.id, { stock: updatedStock });
        }
      }
    }
    // Recarregar catálogo após as vendas
    const updatedCatalog = await databaseService.fetch<Product>(INVENTORY_TABLE_NAME, INVENTORY_STORAGE_KEY);
    setCatalog(updatedCatalog);

    const saleData = { id: `VEN-${Date.now().toString().slice(-5)}`, customer: selectedCustomer || { name: 'Consumidor Final' }, total, paymentMethod, date: new Date().toISOString(), items: cart };
    setLastSale(saleData); 
    setIsSuccess(true);
  };

  const resetSale = () => { setCart([]); setFlow('START'); setPaymentMethod(null); setDiscountValue('0,00'); setReceivedValue('0,00'); setSelectedCustomer(null); setIsSuccess(false); };

  const filteredCatalog = catalog.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())));
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando dados para Venda...
      </div>
    );
  }

  if (flow === 'START') {
    return (
      <div className="h-[calc(100vh-12rem)] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-0 left-0 flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <LayoutDashboard size={16} /> Voltar ao Painel
        </button>

        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 mt-8">
          <button onClick={() => { setSelectedCustomer(null); setFlow('ORDER'); }} className="group bg-white p-12 rounded-[4rem] border-2 border-slate-100 hover:border-indigo-600 hover:shadow-2xl transition-all text-center flex flex-col items-center gap-8 active:scale-95">
            <div className="w-24 h-24 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-3xl flex items-center justify-center transition-all shadow-inner"><Store size={48} /></div>
            <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Venda Rápida</h2><p className="text-slate-500 font-medium mt-2">Sem identificação</p></div>
          </button>
          <button onClick={() => setIsCustomerModalOpen(true)} className="group bg-white p-12 rounded-[4rem] border-2 border-slate-100 hover:border-violet-600 hover:shadow-2xl transition-all text-center flex flex-col items-center gap-8 active:scale-95">
            <div className="w-24 h-24 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-3xl flex items-center justify-center transition-all shadow-inner"><UserPlus size={48} /></div>
            <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Identificar Cliente</h2><p className="text-slate-500 font-medium mt-2">Fidelidade e Cadastro</p></div>
          </button>
        </div>
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCustomerModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-xl font-black text-slate-900 mb-6">Localizar Cliente</h3>
              <input type="text" placeholder="Nome do cliente..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none mb-4" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredCustomers.map(c => <button key={c.id} onClick={() => { setSelectedCustomer(c); setFlow('ORDER'); setIsCustomerModalOpen(false); }} className="w-full p-4 border border-slate-100 rounded-xl text-left hover:bg-violet-50 transition-all font-bold text-sm">{c.name}</button>)}
                {filteredCustomers.length === 0 && <p className="text-center text-xs text-slate-400 font-bold py-4">Nenhum cliente cadastrado ainda.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      <div className={`flex-1 flex flex-col min-h-0 ${flow === 'CHECKOUT' ? 'hidden lg:flex opacity-40 grayscale pointer-events-none' : 'flex'}`}>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm space-y-4 mb-4">
           <div className="flex items-center justify-between px-2">
              <button onClick={() => setFlow('START')} className="flex items-center text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all"><ArrowLeft size={16} className="mr-2" /> Reiniciar</button>
              <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest"><User size={12} className="inline mr-1" /> {selectedCustomer?.name || 'Venda Balcão'}</div>
           </div>
           <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
              <input ref={searchInputRef} type="text" placeholder="Pesquisar catálogo..." className="w-full pl-16 pr-6 py-6 bg-slate-50 border-none rounded-[2.5rem] text-lg font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-inner" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                   {filteredCatalog.map(p => (
                     <button key={p.id} onClick={() => addToCart(p)} className="w-full p-6 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-none transition-all group">
                        <div className="text-left"><p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{p.sku}</p></div>
                        <span className="text-lg font-black text-slate-900">{formatToBRL(p.salePrice)}</span>
                     </button>
                   ))}
                </div>
              )}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 gap-4 p-2 custom-scrollbar">
           {catalog.slice(0, 12).map(p => (
             <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-400 transition-all text-left flex flex-col justify-between h-40 group">
                <div><div className={`w-8 h-8 rounded-lg mb-3 flex items-center justify-center ${p.type === 'SERVICE' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'}`}>{p.type === 'SERVICE' ? <Zap size={16}/> : <Package size={16}/>}</div><h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-indigo-600">{p.name}</h4></div>
                <div className="flex items-center justify-between mt-4"><span className="text-sm font-black text-slate-900">{formatToBRL(p.salePrice)}</span><Plus size={16} className="text-slate-300" /></div>
             </button>
           ))}
        </div>
      </div>
      <div className={`lg:w-[450px] flex flex-col ${flow === 'CHECKOUT' ? 'flex w-full' : 'hidden lg:flex'}`}>
         <div className="flex-1 bg-white lg:border border-slate-200 rounded-[3rem] shadow-xl flex flex-col overflow-hidden m-0 lg:m-2">
            <div className="p-8 border-b-2 border-dashed border-slate-50 text-center bg-slate-50/20">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Cupom Fiscal de Venda</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-8 font-mono space-y-4">
               {cart.map((item, idx) => (
                 <div key={item.id} className="flex justify-between items-end border-b border-slate-50 pb-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 uppercase">{idx + 1}. {item.name}</span>
                       <span className="text-[10px] text-slate-400 font-bold">{item.quantity} un x {formatToBRL(item.salePrice)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-rose-600"><Minus size={14}/></button>
                      <span className="text-sm font-black text-slate-900">{formatToBRL(item.salePrice * item.quantity)}</span>
                      <button onClick={() => updateCartQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-indigo-600"><Plus size={14}/></button>
                    </div>
                 </div>
               ))}
               {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-20 text-slate-300"><ShoppingCart size={64} className="mb-4"/><p className="text-[10px] font-black uppercase">Vazio</p></div>}
            </div>
            <div className="p-8 bg-slate-50 border-t-2 border-dashed border-slate-200 space-y-6">
               <div className="flex justify-between items-center text-xs font-black uppercase"><span className="text-slate-400">Subtotal</span><span className="text-slate-900">{formatToBRL(subtotal)}</span></div>
               <div className="flex justify-between items-center text-2xl font-black"><span className="text-slate-900">Total</span><span className="text-indigo-600">{formatToBRL(total)}</span></div>
               {flow === 'ORDER' ? (
                 <button disabled={cart.length === 0} onClick={() => setFlow('CHECKOUT')} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-20">Fechar Atendimento</button>
               ) : (
                 <div className="space-y-4 animate-in slide-in-from-bottom-4">
                    <div className="grid grid-cols-2 gap-2">
                       {['PIX', 'DINHEIRO', 'CARTÃO', 'CRÉDITO'].map(m => (
                         <button key={m} onClick={() => setPaymentMethod(m)} className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase transition-all ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-white bg-white text-slate-400'}`}>{m}</button>
                       ))}
                    </div>
                    <button disabled={!paymentMethod} onClick={handleFinalize} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-indigo-700 transition-all disabled:opacity-20">Concluir Pagamento</button>
                 </div>
               )}
            </div>
         </div>
      </div>
      {isSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={resetSale}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[4rem] p-12 text-center shadow-2xl animate-in zoom-in">
             <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 size={48} /></div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">Venda Concluída!</h2>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">Código: {lastSale?.id}</p>
             <div className="space-y-3">
                <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3"><Printer size={18} /> Imprimir Recibo</button>
                <button onClick={resetSale} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-3xl font-black uppercase tracking-widest text-[10px]">Nova Venda</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};