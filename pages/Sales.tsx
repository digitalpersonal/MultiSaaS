
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  DollarSign, 
  CreditCard, 
  Banknote, 
  QrCode, 
  CheckCircle2, 
  X,
  User,
  Printer,
  PlusCircle,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Barcode,
  Calculator,
  History,
  Store,
  UserPlus,
  ChevronLeft,
  ArrowLeft,
  Zap,
  Package,
  Check
} from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Tela iPhone 13 Pro', price: 850.00, category: 'Peças', stock: 12, sku: '1001', type: 'PRODUCT' },
  { id: '2', name: 'Bateria iPhone 11', price: 180.00, category: 'Peças', stock: 3, sku: '1002', type: 'PRODUCT' },
  { id: '3', name: 'Carregador 20W USB-C', price: 149.90, category: 'Acessórios', stock: 45, sku: '2001', type: 'PRODUCT' },
  { id: '4', name: 'Troca de Vidro (Mão de Obra)', price: 250.00, category: 'Serviços', stock: 999, sku: 'S001', type: 'SERVICE' },
  { id: '5', name: 'Limpeza Interna Notebook', price: 120.00, category: 'Serviços', stock: 999, sku: 'S002', type: 'SERVICE' },
];

const mockCustomers = [
  { id: '1', name: 'João da Silva', taxId: '123.456.789-00', phone: '5511999999999' },
  { id: '2', name: 'Maria Oliveira', taxId: '12.345.678/0001-90', phone: '5511888888888' },
  { id: '3', name: 'Consumidor Final', taxId: '000.000.000-00', phone: '' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const formatToBRL = (value: number) => currencyFormatter.format(value);

export const Sales: React.FC = () => {
  // Fluxo: 'START' (Escolha Balcão/Cliente) -> 'ORDER' (Seleção de Itens) -> 'CHECKOUT' (Pagamento)
  const [flow, setFlow] = useState<'START' | 'ORDER' | 'CHECKOUT'>('START');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[2]); 
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  const [cart, setCart] = useState<any[]>([]);
  const [discountValue, setDiscountValue] = useState('0,00');
  const [receivedValue, setReceivedValue] = useState('0,00');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (flow === 'ORDER') {
      searchInputRef.current?.focus();
    }
  }, [flow]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountNumeric = parseFloat(discountValue.replace(/\D/g, '')) / 100 || 0;
  const total = Math.max(0, subtotal - discountNumeric);
  
  const receivedNumeric = parseFloat(receivedValue.replace(/\D/g, '')) / 100 || 0;
  const change = Math.max(0, receivedNumeric - total);

  const handleFinalize = () => {
    const saleData = {
      id: `VEN-${Math.floor(Math.random() * 90000) + 10000}`,
      customer: selectedCustomer,
      total,
      subtotal,
      discount: discountNumeric,
      received: receivedNumeric,
      change,
      paymentMethod,
      date: new Date().toISOString(),
      items: cart
    };
    setLastSale(saleData);
    setIsSuccess(true);
  };

  const resetSale = () => {
    setCart([]);
    setFlow('START');
    setPaymentMethod(null);
    setDiscountValue('0,00');
    setReceivedValue('0,00');
    setSelectedCustomer(mockCustomers[2]);
    setIsSuccess(false);
    setLastSale(null);
  };

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return [];
    return mockProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.sku.includes(searchTerm)
    );
  }, [searchTerm]);

  const filteredCustomers = mockCustomers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.taxId.includes(customerSearch)
  );

  // TELA INICIAL: ESCOLHA DE BALCÃO OU CLIENTE
  if (flow === 'START') {
    return (
      <div className="h-[calc(100vh-12rem)] flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          <button 
            onClick={() => { setSelectedCustomer(mockCustomers[2]); setFlow('ORDER'); }}
            className="group bg-white p-12 rounded-[4rem] border-2 border-slate-100 hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-100 transition-all text-center flex flex-col items-center gap-8 active:scale-95"
          >
            <div className="w-28 h-28 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-[2.5rem] flex items-center justify-center transition-all shadow-inner">
              <Store size={56} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Venda Balcão</h2>
              <p className="text-slate-500 font-medium mt-3 text-lg">Início rápido sem cadastro</p>
            </div>
          </button>

          <button 
            onClick={() => setIsCustomerModalOpen(true)}
            className="group bg-white p-12 rounded-[4rem] border-2 border-slate-100 hover:border-violet-600 hover:shadow-2xl hover:shadow-violet-100 transition-all text-center flex flex-col items-center gap-8 active:scale-95"
          >
            <div className="w-28 h-28 bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white rounded-[2.5rem] flex items-center justify-center transition-all shadow-inner">
              <UserPlus size={56} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Buscar Cliente</h2>
              <p className="text-slate-500 font-medium mt-3 text-lg">Venda nominal e fidelidade</p>
            </div>
          </button>
        </div>

        {/* Modal Seleção Cliente */}
        {isCustomerModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCustomerModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Selecionar Cliente</h3>
                <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 text-slate-400"><X size={20}/></button>
              </div>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nome ou CPF..." 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" 
                  value={customerSearch} 
                  onChange={e => setCustomerSearch(e.target.value)} 
                />
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {filteredCustomers.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { setSelectedCustomer(c); setFlow('ORDER'); setIsCustomerModalOpen(false); }}
                    className="w-full p-5 border border-slate-50 rounded-2xl text-left hover:bg-violet-50 hover:border-violet-200 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-sm font-black text-slate-900">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.taxId || 'Não Informado'}</p>
                    </div>
                    <ArrowRight size={16} className="text-violet-300 group-hover:text-violet-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // INTERFACE PRINCIPAL (ORDER OU CHECKOUT)
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-10rem)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* LADO ESQUERDO: BUSCA E SELEÇÃO */}
      <div className={`flex-1 flex flex-col min-h-0 ${flow === 'CHECKOUT' ? 'hidden lg:flex opacity-40 grayscale pointer-events-none' : 'flex'}`}>
        <div className="bg-white p-6 rounded-[3rem] border border-slate-100 shadow-sm space-y-4 mb-4">
           <div className="flex items-center justify-between px-2">
              <button onClick={() => setFlow('START')} className="flex items-center text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all">
                <ArrowLeft size={16} className="mr-2" /> Reiniciar Fluxo
              </button>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                <User size={12} /> {selectedCustomer.name}
              </div>
           </div>
           
           <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={24} />
              </div>
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Busque por produtos ou serviços..." 
                className="w-full pl-16 pr-6 py-7 bg-slate-50 border-none rounded-[2.5rem] text-xl font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 shadow-inner" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              
              {/* Dropdown de Resultados Instantâneos */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2">
                   <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                      {filteredCatalog.length > 0 ? (
                        filteredCatalog.map(p => (
                          <button 
                            key={p.id} 
                            onClick={() => addToCart(p)}
                            className="w-full p-6 hover:bg-slate-50 flex items-center justify-between border-b border-slate-50 last:border-none transition-all group"
                          >
                             <div className="flex items-center gap-5">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${p.type === 'SERVICE' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                   {p.type === 'SERVICE' ? <Zap size={20}/> : <ShoppingBag size={20}/>}
                                </div>
                                <div className="text-left">
                                   <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{p.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sku} • {p.type === 'SERVICE' ? 'Mão de Obra' : 'Produto'}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-lg font-black text-slate-900">{formatToBRL(p.price)}</p>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase">Estoque: {p.stock} un</p>
                             </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-16 text-center space-y-3">
                           <AlertTriangle size={48} className="mx-auto text-slate-200" />
                           <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhum item encontrado</p>
                        </div>
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>

        {/* Guia de Seleção Visual */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-2 overflow-y-auto custom-scrollbar">
           {mockProducts.slice(0, 6).map(p => (
             <button key={p.id} onClick={() => addToCart(p)} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-indigo-400 hover:shadow-xl transition-all text-left group flex flex-col justify-between h-40">
                <div>
                   <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${p.type === 'SERVICE' ? 'bg-violet-50 text-violet-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      {p.type === 'SERVICE' ? <Zap size={18}/> : <Package size={18}/>}
                   </div>
                   <h4 className="text-xs font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{p.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-4">
                   <span className="text-sm font-black text-slate-900">{formatToBRL(p.price)}</span>
                   <Plus size={16} className="text-slate-300 group-hover:text-indigo-600" />
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* DIREITA: CUPOM TÉRMICO E CHECKOUT FINAL */}
      <div className={`
        fixed lg:static inset-0 lg:inset-auto z-[60] bg-white lg:bg-transparent transition-all duration-500
        ${flow === 'CHECKOUT' ? 'flex' : 'hidden lg:flex'}
        lg:w-[500px] flex-col overflow-hidden
      `}>
         
         <div className="flex-1 flex flex-col m-0 lg:m-4 lg:rounded-[4rem] bg-white lg:border border-slate-200 shadow-2xl lg:shadow-xl overflow-hidden relative">
            
            {/* Cabeçalho do Cupom */}
            <div className="p-8 border-b-2 border-dashed border-slate-100 bg-slate-50/30 flex items-center justify-between">
               {flow === 'CHECKOUT' && (
                 <button onClick={() => setFlow('ORDER')} className="p-3 text-slate-400 hover:text-indigo-600 bg-white rounded-2xl shadow-sm border border-slate-100">
                   <ChevronLeft size={24} />
                 </button>
               )}
               <div className="text-center flex-1">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">CUPOM DE VENDA</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedCustomer.name}</p>
               </div>
               {flow === 'ORDER' && (
                 <button onClick={resetSale} className="p-3 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={24} /></button>
               )}
            </div>

            {/* Listagem de Itens (Estilo Supermercado) */}
            <div className={`flex-1 overflow-y-auto p-8 font-mono space-y-5 custom-scrollbar ${flow === 'CHECKOUT' ? 'opacity-30 grayscale-0 max-h-[150px]' : ''}`}>
               {cart.map((item, idx) => (
                 <div key={item.id} className="flex flex-col gap-1.5 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-start">
                       <span className="text-[12px] font-black text-slate-900 uppercase truncate pr-4">{idx + 1}. {item.name}</span>
                       <button onClick={() => removeFromCart(item.id)} className="p-1 text-rose-500 lg:hidden"><X size={14}/></button>
                    </div>
                    <div className="flex justify-between items-end">
                       <div className="flex flex-col">
                          <span className="text-[11px] text-slate-400 font-bold">{item.quantity} un x {formatToBRL(item.price)}</span>
                          <div className="flex gap-2 mt-2">
                             <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Minus size={14}/></button>
                             <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-400 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all"><Plus size={14}/></button>
                          </div>
                       </div>
                       <span className="text-base font-black text-slate-900 tracking-tight">{formatToBRL(item.price * item.quantity)}</span>
                    </div>
                 </div>
               ))}
               
               {cart.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center opacity-10 text-slate-300 grayscale">
                    <ShoppingCart size={80} className="mb-6" />
                    <p className="font-black uppercase tracking-[0.4em] text-xs">Cupom Vazio</p>
                 </div>
               )}
            </div>

            {/* Rodapé Financeiro */}
            <div className="p-10 bg-slate-50 border-t-2 border-dashed border-slate-200 space-y-8">
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                     <span>Soma dos Itens</span>
                     <span>{formatToBRL(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Tag size={12} className="text-indigo-400" /> Desconto Especial (R$)
                     </span>
                     <input 
                       type="text" 
                       value={discountValue} 
                       onChange={(e) => {
                         const val = e.target.value.replace(/\D/g, '');
                         setDiscountValue((Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                       }}
                       className="w-28 text-right bg-white border border-slate-200 rounded-xl py-2 px-3 text-rose-500 font-black text-sm outline-none focus:ring-4 focus:ring-rose-100 transition-all"
                     />
                  </div>
                  <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                     <span className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Total a Receber</span>
                     <span className="text-5xl font-black text-slate-900 tracking-tighter">{formatToBRL(total)}</span>
                  </div>
               </div>

               {flow === 'ORDER' ? (
                 <button 
                   disabled={cart.length === 0}
                   onClick={() => setFlow('CHECKOUT')}
                   className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs active:scale-[0.98] disabled:opacity-30 group"
                 >
                   Fechar Pedido <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
               ) : (
                 <div className="space-y-6 animate-in slide-in-from-bottom-8">
                    {/* Opções de Pagamento Estilo Delivery */}
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'PIX', label: 'Pix', icon: <QrCode size={24} /> },
                         { id: 'DINHEIRO', label: 'Dinheiro', icon: <Banknote size={24} /> },
                         { id: 'CARTAO', label: 'Débito', icon: <CreditCard size={24} /> },
                         { id: 'CREDITO', label: 'Crédito', icon: <CreditCard size={24} /> },
                       ].map(m => (
                         <button 
                           key={m.id} 
                           onClick={() => setPaymentMethod(m.id)}
                           className={`p-5 border-2 rounded-3xl flex items-center gap-4 transition-all ${paymentMethod === m.id ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-xl shadow-indigo-100 scale-[1.02]' : 'border-white bg-white text-slate-400 hover:border-slate-100'}`}
                         >
                           <div className={paymentMethod === m.id ? 'text-indigo-600' : 'text-slate-300'}>{m.icon}</div>
                           <span className="text-[11px] font-black uppercase tracking-widest">{m.label}</span>
                         </button>
                       ))}
                    </div>

                    {/* Lógica de Troco para Dinheiro */}
                    {paymentMethod === 'DINHEIRO' && (
                      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 space-y-5 shadow-inner animate-in zoom-in-95">
                         <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Valor Recebido</span>
                            <input 
                               type="text" 
                               autoFocus
                               value={receivedValue} 
                               onChange={(e) => {
                                 const val = e.target.value.replace(/\D/g, '');
                                 setReceivedValue((Number(val) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                               }}
                               className="w-40 text-right bg-slate-50 border-none rounded-2xl py-3 px-4 text-xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-100"
                            />
                         </div>
                         <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Troco ao Cliente</span>
                            <span className={`text-2xl font-black ${change > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                               {formatToBRL(change)}
                            </span>
                         </div>
                      </div>
                    )}

                    <button 
                      disabled={!paymentMethod}
                      onClick={handleFinalize}
                      className="w-full py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-[13px] active:scale-[0.98] disabled:opacity-50"
                    >
                      <Check size={28} /> Finalizar e Imprimir
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>

      {/* SUCESSO: RECIBO TÉRMICO */}
      {isSuccess && lastSale && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-2xl" onClick={resetSale}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[4rem] p-12 text-center overflow-hidden shadow-2xl animate-in slide-in-from-bottom-12 duration-700">
             <div className="w-28 h-28 bg-emerald-50 text-emerald-500 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <CheckCircle2 size={56} strokeWidth={3} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Venda OK!</h2>
             <p className="text-slate-400 text-[10px] mb-12 font-black uppercase tracking-[0.4em]">Protocolo {lastSale.id}</p>
             
             <div className="bg-slate-50 rounded-[2.5rem] p-8 mb-12 text-left space-y-4 font-mono">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase">
                   <span>Pagamento</span>
                   <span className="text-slate-900">{lastSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase border-b border-slate-200 pb-2">
                   <span>Itens</span>
                   <span className="text-slate-900">{lastSale.items.length}</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-slate-900 pt-4">
                   <span className="tracking-tight">Total</span>
                   <span>{formatToBRL(lastSale.total)}</span>
                </div>
                {lastSale.change > 0 && (
                  <div className="flex justify-between text-base font-black text-emerald-600 pt-2">
                    <span>Troco</span>
                    <span>{formatToBRL(lastSale.change)}</span>
                  </div>
                )}
             </div>

             <div className="space-y-4">
               <button onClick={() => window.print()} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black flex items-center justify-center gap-4 hover:bg-black uppercase tracking-widest text-[11px] shadow-2xl shadow-slate-300 transition-all active:scale-95">
                  <Printer size={20} /> Imprimir Recibo
               </button>
               <button onClick={resetSale} className="w-full py-5 bg-indigo-50 text-indigo-600 rounded-3xl font-black hover:bg-indigo-100 transition-all text-[11px] uppercase tracking-widest">
                 Próximo Atendimento
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
