
import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  MoreVertical, 
  CheckCircle2, 
  Tag, 
  History, 
  Calendar, 
  ExternalLink,
  ArrowUpRight,
  Clock,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Printer,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

// Dados simulados de vendas mais detalhados para o histórico
const mockSalesHistory: Record<string, any[]> = {
  '1': [
    { 
      id: 'VEN-001', 
      date: '2023-10-15T14:30:00', 
      total: 850.00, 
      status: 'Concluído', 
      paymentMethod: 'PIX',
      items: [
        { name: 'Tela iPhone 13 Pro', quantity: 1, price: 850.00 }
      ]
    },
    { 
      id: 'VEN-012', 
      date: '2023-11-02T10:15:00', 
      total: 45.00, 
      status: 'Concluído', 
      paymentMethod: 'Dinheiro',
      items: [
        { name: 'Película 3D', quantity: 1, price: 45.00 }
      ]
    }
  ],
  '2': [
    { 
      id: 'VEN-005', 
      date: '2023-09-20T16:45:00', 
      total: 1200.00, 
      status: 'Concluído', 
      paymentMethod: 'Cartão de Crédito',
      items: [
        { name: 'Conserto Placa Mãe S22', quantity: 1, price: 1200.00 }
      ]
    },
    { 
      id: 'VEN-025', 
      date: '2023-12-10T11:20:00', 
      total: 180.00, 
      status: 'Concluído', 
      paymentMethod: 'PIX',
      items: [
        { name: 'Bateria iPhone 11', quantity: 1, price: 180.00 }
      ]
    }
  ],
  '3': [
    { 
      id: 'VEN-040', 
      date: '2024-01-05T09:00:00', 
      total: 50.00, 
      status: 'Pendente', 
      paymentMethod: 'Dinheiro',
      items: [
        { name: 'Personalização Laser', quantity: 1, price: 50.00 }
      ]
    }
  ]
};

const initialCustomers = [
  { id: '1', name: 'João da Silva', email: 'joao@email.com', phone: '11999990001', taxId: '123.456.789-00', type: 'PF', city: 'São Paulo', status: 'VIP' },
  { id: '2', name: 'Maria Oliveira', email: 'maria@empresa.com.br', phone: '11988880002', taxId: '12.345.678/0001-90', type: 'PJ', city: 'Campinas', status: 'Recorrente' },
  { id: '3', name: 'Carlos Santos', email: 'carlos.tec@gmail.com', phone: '21977770003', taxId: '987.654.321-11', type: 'PF', city: 'Rio de Janeiro', status: 'Novo' },
];

const CUSTOMER_TYPE_LABELS: Record<string, string> = { PF: 'Pessoa Física', PJ: 'Pessoa Jurídica' };

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const maskPhone = (value: string) => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  if (v.length > 10) return v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  else if (v.length > 6) return v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  else if (v.length > 2) return v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  else if (v.length > 0) return v.replace(/^(\d*)/, "($1");
  return v;
};

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');
  const [type, setType] = useState('PF');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState('Novo');

  const handleOpenModal = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setName(customer.name);
      setEmail(customer.email);
      setPhone(maskPhone(customer.phone));
      setTaxId(customer.taxId);
      setType(customer.type);
      setCity(customer.city);
      setStatus(customer.status);
    } else {
      setEditingCustomer(null);
      setName(''); setEmail(''); setPhone(''); setTaxId(''); setType('PF'); setCity(''); setStatus('Novo');
    }
    setIsModalOpen(true);
    setActiveMenu(null);
  };

  const handleOpenHistory = (customer: any) => {
    setSelectedCustomerForHistory(customer);
    setIsHistoryOpen(true);
    setSelectedSale(null); // Reseta a venda selecionada ao abrir histórico
    setActiveMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente remover este cliente?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
      setActiveMenu(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerData = {
      id: editingCustomer ? editingCustomer.id : Math.random().toString(36).substr(2, 9),
      name, email, phone: phone.replace(/\D/g, ""), taxId, type, city, status
    };
    if (editingCustomer) setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? customerData : c));
    else setCustomers(prev => [customerData, ...prev]);
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.taxId.includes(searchTerm) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Clientes (CRM)</h1>
          <p className="text-slate-500 text-sm font-medium">Histórico completo e fidelização.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-[10px] uppercase tracking-widest">
          <Plus size={18} className="mr-2" /> Adicionar Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Pesquisar por nome, CPF/CNPJ ou e-mail..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative flex flex-col p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-[1.25rem] flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                  <User size={28} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors text-lg">{customer.name}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${customer.status === 'VIP' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {customer.status}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600">
                      {customer.type}
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                  <MoreVertical size={20} />
                </button>
                {activeMenu === customer.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-3xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in duration-100">
                    <button onClick={() => handleOpenModal(customer)} className="w-full flex items-center px-5 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors"><Edit2 size={14} className="mr-3 text-slate-400" /> Editar Perfil</button>
                    <button onClick={() => handleOpenHistory(customer)} className="w-full flex items-center px-5 py-3 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 transition-colors"><History size={14} className="mr-3 text-indigo-400" /> Histórico</button>
                    <div className="h-px bg-slate-50 my-1 mx-3"></div>
                    <button onClick={() => handleDelete(customer.id)} className="w-full flex items-center px-5 py-3 text-[11px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 transition-colors"><Trash2 size={14} className="mr-3 text-rose-400" /> Remover</button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center text-xs font-bold text-slate-600"><Mail size={16} className="mr-3 text-slate-300 shrink-0" /> {customer.email}</div>
              <div className="flex items-center text-xs font-bold text-slate-600"><Phone size={16} className="mr-3 text-slate-300 shrink-0" /> {maskPhone(customer.phone)}</div>
              <div className="flex items-center text-xs font-bold text-slate-400"><Tag size={16} className="mr-3 text-slate-300 shrink-0" /> {customer.taxId}</div>
            </div>

            <button onClick={() => handleOpenHistory(customer)} className="mt-8 pt-6 border-t border-slate-50 w-full flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-700 transition-all group/btn">
              Acessar Histórico <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Histórico de Vendas Completo */}
      {isHistoryOpen && selectedCustomerForHistory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            
            {/* Header do Modal */}
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
              <div className="flex items-center gap-4">
                {selectedSale ? (
                  <button onClick={() => setSelectedSale(null)} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-100 shadow-sm transition-all mr-2">
                    <ArrowLeft size={20} />
                  </button>
                ) : (
                  <div className="w-14 h-14 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100">
                    <History size={28} />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedSale ? `Detalhes ${selectedSale.id}` : 'Histórico Comercial'}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{selectedCustomerForHistory.name}</p>
                </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 bg-white rounded-2xl border border-slate-100 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo: Lista de Vendas ou Detalhes de uma Venda */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/20">
              {!selectedSale ? (
                /* Visão 1: Lista de Transações */
                <div className="space-y-6">
                  {/* Resumo Rápido */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total</p>
                       <p className="text-2xl font-black text-slate-900">
                         {currencyFormatter.format(mockSalesHistory[selectedCustomerForHistory.id]?.reduce((acc, s) => acc + s.total, 0) || 0)}
                       </p>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pedidos</p>
                       <p className="text-2xl font-black text-slate-900">
                         {mockSalesHistory[selectedCustomerForHistory.id]?.length || 0}
                       </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-4">Linha do Tempo</p>
                    {mockSalesHistory[selectedCustomerForHistory.id]?.length > 0 ? (
                      mockSalesHistory[selectedCustomerForHistory.id].map((sale) => (
                        <button 
                          key={sale.id} 
                          onClick={() => setSelectedSale(sale)}
                          className="w-full text-left p-6 bg-white rounded-[2.5rem] border border-slate-100 hover:border-indigo-400 hover:shadow-xl transition-all group flex items-center justify-between"
                        >
                          <div className="flex items-center gap-5">
                             <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                                <ShoppingBag size={20} />
                             </div>
                             <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-lg">{sale.id}</span>
                                  <span className="text-[11px] font-bold text-slate-900">{new Date(sale.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p className="text-xs font-medium text-slate-500 truncate max-w-[200px]">
                                  {sale.items.map((it: any) => it.name).join(', ')}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right">
                                <p className="text-lg font-black text-slate-900 tracking-tight">{currencyFormatter.format(sale.total)}</p>
                                <span className={`text-[9px] font-black uppercase ${sale.status === 'Concluído' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                  {sale.status}
                                </span>
                             </div>
                             <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-300 transition-all" />
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-4 opacity-30">
                         <Clock size={60} className="mx-auto text-slate-200" />
                         <p className="text-sm font-bold uppercase tracking-widest">Nenhuma transação encontrada</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Visão 2: Detalhes da Venda (Recibo Digital) */
                <div className="animate-in slide-in-from-right-8 duration-500 pb-8">
                  <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
                     <div className="p-8 bg-slate-50/50 border-b border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Comprovante Digital</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSale.id}</h4>
                        <div className="flex items-center justify-center gap-3 mt-4">
                           <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Calendar size={14} className="text-indigo-400"/> {new Date(selectedSale.date).toLocaleString('pt-BR')}</span>
                           <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                           <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><CreditCard size={14} className="text-indigo-400"/> {selectedSale.paymentMethod}</span>
                        </div>
                     </div>
                     
                     <div className="p-8 space-y-6">
                        <div className="space-y-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Itens do Pedido</p>
                           {selectedSale.items.map((item: any, idx: number) => (
                             <div key={idx} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div>
                                   <p className="text-xs font-black text-slate-900 uppercase">{item.name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.quantity} un x {currencyFormatter.format(item.price)}</p>
                                </div>
                                <span className="text-sm font-black text-slate-900">{currencyFormatter.format(item.quantity * item.price)}</span>
                             </div>
                           ))}
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                           <div className="space-y-1">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status do Pagamento</p>
                              <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase">
                                 <CheckCircle2 size={16} /> Pago e Conciliado
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total da Venda</p>
                              <p className="text-4xl font-black text-slate-900 tracking-tighter">{currencyFormatter.format(selectedSale.total)}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => window.print()} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3">
                        <Printer size={18} /> Re-imprimir
                     </button>
                     <button onClick={() => setSelectedSale(null)} className="py-4 bg-white text-slate-400 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Voltar à Lista
                     </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                     <DollarSign size={18} />
                  </div>
                  <div>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Saldo de Fidelidade</p>
                     <p className="text-sm font-black text-slate-900">450 Pontos Disponíveis</p>
                  </div>
               </div>
               <button onClick={() => setIsHistoryOpen(false)} className="text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Fechar Consulta</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{editingCustomer ? 'Editar Perfil' : 'Cadastrar Cliente'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-all"><X size={24} /></button>
            </div>
            <form className="p-10 grid grid-cols-2 gap-8" onSubmit={handleSubmit}>
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Completo / Razão Social</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none" placeholder="Digite o nome..." required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">E-mail Corporativo</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none" placeholder="exemplo@email.com" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">WhatsApp / Celular</label>
                <input type="text" value={phone} onChange={e => setPhone(maskPhone(e.target.value))} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none" placeholder="(00) 00000-0000" required />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Documento (CPF/CNPJ)</label>
                <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo de Cliente</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none cursor-pointer">
                  <option value="PF">Pessoa Física</option><option value="PJ">Pessoa Jurídica</option>
                </select>
              </div>
              <div className="col-span-2 pt-6">
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] flex items-center justify-center uppercase tracking-widest text-[11px]">
                  <CheckCircle2 size={20} className="mr-3" /> {editingCustomer ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
