import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, CheckCircle2, Wrench, ClipboardCheck, Smartphone, Camera, Power, Volume2, Wifi, BatteryCharging, AlertTriangle, Clock, Edit2, Trash2, DollarSign, CreditCard, AlertCircle } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { OSChecklist, ServiceOrder, Customer, UserRole, Company, Transaction, OSStatus } from '../types';
import { databaseService } from '../services/databaseService';

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatToBRL = (value: number) => currencyFormatter.format(value);

export const ServiceOrders: React.FC = () => {
  const OS_STORAGE_KEY = 'multiplus_os';
  const OS_TABLE_NAME = 'os';
  const CUSTOMER_STORAGE_KEY = 'multiplus_customers';
  const CUSTOMER_TABLE_NAME = 'customers';
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';
  const FINANCE_STORAGE_KEY = 'multiplus_finance';
  const FINANCE_TABLE_NAME = 'finance';

  const [osList, setOsList] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      const osData = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
      const customerData = await databaseService.fetch<Customer>(CUSTOMER_TABLE_NAME, CUSTOMER_STORAGE_KEY);
      
      if (companyId) {
        const tenants = await databaseService.fetch<Company>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
        const comp = tenants.find(t => t.id === companyId);
        setCurrentCompany(comp || null);
      }

      setOsList(osData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCustomers(customerData);
      setIsLoading(false);
    };
    loadData();
  }, [companyId]);

  const [filter, setFilter] = useState('ALL');
  
  // Modal de Criação/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceDefect, setDeviceDefect] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('');
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);
  const [osPrice, setOsPrice] = useState('');
  const [checklist, setChecklist] = useState<OSChecklist>({
    power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED',
  });

  // Modal de Pagamento/Finalização
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [osToFinalize, setOsToFinalize] = useState<ServiceOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleOpenModal = (os?: ServiceOrder) => {
    if (os) {
      setEditingOS(os);
      setSelectedCustomer(customers.find(c => c.id === os.customerId) || null);
      setCustomerSearch(os.customerName);
      setDeviceModel(os.device);
      setDeviceDefect(os.defect);
      setDeviceCondition(os.deviceCondition || '');
      setChecklist(os.checklist || { power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED' });
      setOsPrice(os.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 }));
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const parseCurrencyToNumber = (formattedValue: string) => {
    if (!formattedValue) return 0;
    return parseFloat(formattedValue.replace(/\./g, '').replace(',', '.'));
  };

  const handleCreateOrUpdateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    const osData: ServiceOrder = {
      id: editingOS ? editingOS.id : `OS-${Date.now().toString().slice(-5)}`,
      companyId: companyId,
      customerId: selectedCustomer?.id || 'avulso',
      customerName: selectedCustomer?.name || customerSearch || 'Cliente Avulso',
      device: deviceModel,
      defect: deviceDefect,
      status: editingOS?.status || OSStatus.AWAITING,
      price: parseCurrencyToNumber(osPrice),
      date: editingOS?.date || new Date().toISOString(),
      checklist: checklist,
      deviceCondition: deviceCondition,
    };

    if (editingOS) {
      await databaseService.updateOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, osData.id, osData);
    } else {
      await databaseService.insertOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, osData);
    }
    
    const updatedOsList = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
    setOsList(updatedOsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteOS = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta Ordem de Serviço?')) {
      await databaseService.deleteOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, id);
      const updatedOsList = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
      setOsList(updatedOsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  };

  // --- Lógica de Finalização e Pagamento ---

  const handleOpenPaymentModal = (os: ServiceOrder) => {
    setOsToFinalize(os);
    setPaymentMethod('');
    setIsPaymentModalOpen(true);
  };

  const getFeeInfo = () => {
    if (!currentCompany || !osToFinalize) return null;
    let rate = 0;
    // Mapeamento dos métodos
    if (paymentMethod === 'CRÉDITO') rate = currentCompany.creditCardFee || 0;
    if (paymentMethod === 'DÉBITO') rate = currentCompany.debitCardFee || 0;
    
    if (rate > 0) {
      const feeValue = osToFinalize.price * (rate / 100);
      return { rate, value: feeValue };
    }
    return null;
  };

  const feeInfo = getFeeInfo();

  const handleFinalizeOS = async () => {
    if (!companyId || !osToFinalize || !paymentMethod) return;

    // 1. Atualizar Status da OS
    await databaseService.updateOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, osToFinalize.id, {
      status: OSStatus.COMPLETED
    });

    // 2. Lançar Receita no Financeiro
    const incomeTransaction: Transaction = {
      id: `FIN-OS-${osToFinalize.id}`,
      companyId,
      description: `Recebimento OS #${osToFinalize.id} - ${osToFinalize.device}`,
      amount: osToFinalize.price,
      type: 'INCOME',
      status: 'PAID',
      date: new Date().toISOString(),
      category: 'Serviços',
      method: paymentMethod
    };
    await databaseService.insertOne<Transaction>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, incomeTransaction);

    // 3. Lançar Taxa (Se houver)
    if (feeInfo) {
      const feeTransaction: Transaction = {
        id: `FEE-OS-${osToFinalize.id}`,
        companyId,
        description: `Taxa Operacional (${paymentMethod}) - OS #${osToFinalize.id}`,
        amount: feeInfo.value,
        type: 'EXPENSE',
        status: 'PAID',
        date: new Date().toISOString(),
        method: 'Automático',
        category: 'Taxas Financeiras'
      };
      await databaseService.insertOne<Transaction>(FINANCE_TABLE_NAME, FINANCE_STORAGE_KEY, feeTransaction);
    }

    // Atualizar UI
    const updatedOsList = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
    setOsList(updatedOsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsPaymentModalOpen(false);
    setOsToFinalize(null);
    setPaymentMethod('');

    alert('Serviço concluído e pagamento registrado com sucesso!');
  };

  const resetForm = () => { 
    setEditingOS(null);
    setSelectedCustomer(null); 
    setCustomerSearch(''); 
    setDeviceModel(''); 
    setDeviceDefect(''); 
    setDeviceCondition(''); 
    setChecklist({ power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED' }); 
    setOsPrice('');
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando Ordens de Serviço...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Reparos (O.S.)</h1>
          <p className="text-slate-500 text-sm font-medium">Gestão técnica centralizada.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]"><Plus size={18} className="mr-2 inline" /> Abrir Protocolo</button>
      </div>

      {osList.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
           <Smartphone size={64} className="mx-auto text-slate-100 mb-6" />
           <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhuma O.S. ativa</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {osList.filter(os => filter === 'ALL' || os.status === filter).map((os) => (
            <div key={os.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all relative group">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{os.id}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[os.status as any]}`}>{STATUS_LABELS[os.status]}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1 truncate">{os.device}</h3>
              <p className="text-[10px] text-slate-500 mb-6 font-bold uppercase tracking-widest">{os.customerName}</p>
              
              <div className="mt-auto space-y-4">
                 <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <Clock size={16} className="text-slate-300" />
                    <p className="text-lg font-black text-slate-900">{os.price > 0 ? formatToBRL(os.price) : 'Em Orçamento'}</p>
                 </div>
                 
                 {os.status !== 'COMPLETED' && os.status !== 'CANCELLED' && (
                    <button 
                      onClick={() => handleOpenPaymentModal(os)}
                      className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                       <CheckCircle2 size={14} /> Concluir & Receber
                    </button>
                 )}
              </div>

              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(os)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                <button onClick={() => handleDeleteOS(os.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
             <div className="p-8 bg-slate-50/30 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">{editingOS ? 'Editar Protocolo Técnico' : 'Novo Protocolo Técnico'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
             </div>
             <form className="p-8 space-y-6 overflow-y-auto custom-scrollbar" onSubmit={handleCreateOrUpdateOS}>
                <div className="space-y-4">
                   <input 
                     type="text" 
                     placeholder="Nome do cliente..." 
                     className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" 
                     value={customerSearch} 
                     onChange={e => {
                        setCustomerSearch(e.target.value); 
                        setSelectedCustomer(customers.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase())) || null);
                     }} 
                   />
                   {selectedCustomer && (
                     <p className="text-xs text-slate-500 font-medium px-2">Cliente selecionado: {selectedCustomer.name}</p>
                   )}
                   <input type="text" placeholder="Dispositivo (Ex: iPhone 14 Pro Max)" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} required />
                   <textarea placeholder="Relato do Defeito..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none resize-none" rows={3} value={deviceDefect} onChange={e => setDeviceDefect(e.target.value)} required />
                   <input type="text" placeholder="Preço (R$)" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={osPrice} onChange={e => {
                     const val = e.target.value.replace(/\D/g, ''); 
                     setOsPrice((Number(val)/100).toLocaleString('pt-BR', {minimumFractionDigits: 2}));
                   }} />
                   
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mt-6">Checklist de Entrada</h3>
                   <div className="grid grid-cols-2 gap-4">
                     {Object.keys(checklist).map((key) => {
                       const status = checklist[key as keyof OSChecklist];
                       const Icon = {
                         power: Power, touch: Smartphone, cameras: Camera, audio: Volume2, wifi: Wifi, charging: BatteryCharging
                       }[key as keyof OSChecklist] || ClipboardCheck;
                       
                       const statusColor = status === 'YES' ? 'bg-emerald-50 text-emerald-600' : 
                                           status === 'NO' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400';
                       
                       return (
                         <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                           <div className="flex items-center gap-2">
                             <Icon size={18} className="text-slate-400" />
                             <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                           </div>
                           <select 
                             value={status} 
                             onChange={(e) => setChecklist(prev => ({ ...prev, [key]: e.target.value as 'YES' | 'NO' | 'NOT_TESTED' }))}
                             className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColor} appearance-none cursor-pointer outline-none`}
                           >
                             <option value="NOT_TESTED">NÃO TESTADO</option>
                             <option value="YES">SIM</option>
                             <option value="NO">NÃO</option>
                           </select>
                         </div>
                       );
                     })}
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all">{editingOS ? 'Atualizar Ordem de Serviço' : 'Abrir Ordem de Serviço'}</button>
             </form>
          </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO/FINALIZAÇÃO */}
      {isPaymentModalOpen && osToFinalize && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl animate-in zoom-in">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-black text-slate-900 uppercase">Finalizar Serviço</h2>
                 <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-rose-600"><X size={24} /></button>
             </div>

             <div className="bg-slate-50 p-6 rounded-[2rem] mb-6 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total do Serviço</p>
                <p className="text-3xl font-black text-slate-900 mt-2">{formatToBRL(osToFinalize.price)}</p>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Forma de Pagamento</p>
                <div className="grid grid-cols-2 gap-2">
                   {['DINHEIRO', 'PIX', 'DÉBITO', 'CRÉDITO'].map(m => (
                     <button 
                        key={m} 
                        onClick={() => setPaymentMethod(m)} 
                        className={`py-4 border-2 rounded-2xl text-[10px] font-black uppercase transition-all ${paymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-white bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                     >
                        {m}
                     </button>
                   ))}
                </div>

                {feeInfo && (
                   <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                         <p className="text-[10px] font-black uppercase text-amber-700 mb-1">Custo Operacional</p>
                         <p className="text-[10px] text-amber-600 leading-relaxed">
                            A taxa de <strong>{feeInfo.rate}% ({formatToBRL(feeInfo.value)})</strong> será lançada como despesa da empresa. <br/>
                            <span className="font-bold underline">O cliente pagará o valor normal de {formatToBRL(osToFinalize.price)}.</span>
                         </p>
                      </div>
                   </div>
                )}

                <button 
                   disabled={!paymentMethod} 
                   onClick={handleFinalizeOS} 
                   className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                   Confirmar Pagamento
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};