
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, CheckCircle2, Wrench, ClipboardCheck, Box, Settings, Power, Activity, ShieldCheck, Eraser, Package, AlertTriangle, Clock, Edit2, Trash2, DollarSign, CreditCard, AlertCircle, Share2, Printer, Phone, FileText, ArrowRight, Lock, Hash, Monitor, History, FileQuestion, Tag, UserRound } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { OSChecklist, ServiceOrder, Customer, UserRole, Company, Transaction, OSStatus, User } from '../types';
import { databaseService } from '../services/databaseService';
import { useNavigate } from 'react-router-dom';

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
  const ACCOUNTS_STORAGE_KEY = 'multiplus_accounts';
  const ACCOUNTS_TABLE_NAME = 'accounts';

  const navigate = useNavigate();

  const [osList, setOsList] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [team, setTeam] = useState<User[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'TRIAGE' | 'BUDGET_WAIT' | 'LAB' | 'HISTORY'>('TRIAGE');

  const userString = localStorage.getItem('multiplus_user');
  const currentUser = userString ? JSON.parse(userString) as User : null;
  const companyId = currentUser?.companyId;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const osData = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
      const customerData = await databaseService.fetch<Customer>(CUSTOMER_TABLE_NAME, CUSTOMER_STORAGE_KEY);
      const teamData = await databaseService.fetch<User>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
      
      if (companyId) {
        const tenants = await databaseService.fetch<Company>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
        const comp = tenants.find(t => t.id === companyId);
        setCurrentCompany(comp || null);
        setTeam(teamData.filter(u => u.companyId === companyId));
      }

      setOsList(osData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setCustomers(customerData);
      setIsLoading(false);
    };
    loadData();
  }, [companyId]);

  // Modal de Criação/Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [itemCondition, setItemCondition] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [accessories, setAccessories] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);
  const [osPrice, setOsPrice] = useState('');
  const [checklist, setChecklist] = useState<OSChecklist>({
    power: 'NOT_TESTED', functionality: 'NOT_TESTED', physicalState: 'NOT_TESTED', safety: 'NOT_TESTED', cleaning: 'NOT_TESTED', accessories: 'NOT_TESTED',
  });

  const handleOpenModal = (os?: ServiceOrder) => {
    if (os) {
      setEditingOS(os);
      setSelectedCustomer(customers.find(c => c.id === os.customerId) || null);
      setCustomerSearch(os.customerName);
      setEquipmentName(os.equipment);
      setEquipmentCategory(os.category || '');
      setIssueDescription(os.defect);
      setItemCondition(os.itemCondition || '');
      setSerialNumber(os.serialNumber || '');
      setAccessCode(os.accessCode || '');
      setAccessories(os.accessories || '');
      setSelectedTechnicianId(os.technicianId || '');
      setChecklist(os.checklist || { power: 'NOT_TESTED', functionality: 'NOT_TESTED', physicalState: 'NOT_TESTED', safety: 'NOT_TESTED', cleaning: 'NOT_TESTED', accessories: 'NOT_TESTED' });
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
    if (!companyId || !currentUser) return;

    const technician = team.find(t => t.id === selectedTechnicianId);

    const osData: ServiceOrder = {
      id: editingOS ? editingOS.id : `OS-${Date.now().toString().slice(-5)}`,
      companyId: companyId,
      customerId: selectedCustomer?.id || 'avulso',
      customerName: selectedCustomer?.name || customerSearch || 'Cliente Avulso',
      equipment: equipmentName,
      category: equipmentCategory,
      defect: issueDescription,
      serialNumber: serialNumber,
      accessCode: accessCode,
      accessories: accessories,
      technicianId: selectedTechnicianId,
      technicianName: technician?.name || 'Não atribuído',
      openedById: editingOS?.openedById || currentUser.id,
      status: editingOS?.status || OSStatus.IN_ANALYSIS, 
      price: parseCurrencyToNumber(osPrice),
      date: editingOS?.date || new Date().toISOString(),
      checklist: checklist,
      itemCondition: itemCondition,
    };

    if (editingOS) {
      await databaseService.updateOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, osData.id, osData);
    } else {
      await databaseService.insertOne<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY, osData);
    }
    
    const updatedOsList = await databaseService.fetch<ServiceOrder>(OS_TABLE_NAME, OS_STORAGE_KEY);
    setOsList(updatedOsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
    
    if (!editingOS) {
        setLastProcessedOS(osData);
        setSuccessMode('ENTRY');
        setShowSuccessModal(true);
    }
    resetForm();
  };

  const resetForm = () => { 
    setEditingOS(null); setSelectedCustomer(null); setCustomerSearch(''); 
    setEquipmentName(''); setEquipmentCategory(''); setIssueDescription(''); setItemCondition(''); 
    setSerialNumber(''); setAccessCode(''); setAccessories(''); setSelectedTechnicianId('');
    setChecklist({ power: 'NOT_TESTED', functionality: 'NOT_TESTED', physicalState: 'NOT_TESTED', safety: 'NOT_TESTED', cleaning: 'NOT_TESTED', accessories: 'NOT_TESTED' }); 
    setOsPrice('');
  };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [osToFinalize, setOsToFinalize] = useState<ServiceOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastProcessedOS, setLastProcessedOS] = useState<ServiceOrder | null>(null);
  const [successMode, setSuccessMode] = useState<'ENTRY' | 'COMPLETION'>('ENTRY'); 
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [manualPhone, setManualPhone] = useState('');

  const handleWhatsAppShare = (osParam?: ServiceOrder, type?: 'ENTRY' | 'COMPLETION' | 'DIRECT_APPROVAL') => {
    const targetOS = osParam || lastProcessedOS;
    const mode = type || successMode;
    if (!targetOS) return;
    const customer = customers.find(c => c.id === targetOS.customerId);
    const phoneToUse = manualPhone || customer?.phone?.replace(/\D/g, '');
    if (!phoneToUse || phoneToUse.length < 8) { if (!osParam) setShowPhoneInput(true); else alert("Cliente sem telefone válido."); return; }
    const companyName = currentCompany?.name || 'Centro de Serviços';
    let message = '';
    if (mode === 'ENTRY') message = `*COMPROVANTE DE ENTRADA - ${companyName}*\n\nOlá *${targetOS.customerName}*!\nRecebemos seu item para análise.\n📋 *OS:* ${targetOS.id}\n🛠️ *Item:* ${targetOS.equipment}\n⏳ *Status:* Triagem`;
    else if (mode === 'DIRECT_APPROVAL') message = `*SERVIÇO APROVADO - ${companyName}*\n\nOlá *${targetOS.customerName}*!\nServiço para *${targetOS.equipment}* aprovado.\n💰 *Valor:* ${formatToBRL(targetOS.price)}`;
    else message = `*PRONTO PARA RETIRADA - ${companyName}*\n\nOlá *${targetOS.customerName}*!\nSeu *${targetOS.equipment}* está pronto.\n💰 *Valor:* ${formatToBRL(targetOS.price)}`;
    window.open(`https://wa.me/${phoneToUse}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredOS = useMemo(() => {
    if (activeTab === 'TRIAGE') return osList.filter(os => os.status === OSStatus.IN_ANALYSIS || os.status === OSStatus.AWAITING);
    if (activeTab === 'BUDGET_WAIT') return osList.filter(os => os.status === OSStatus.BUDGET_PENDING);
    if (activeTab === 'LAB') return osList.filter(os => os.status === OSStatus.WAITING_PARTS || os.status === OSStatus.IN_REPAIR);
    return osList.filter(os => os.status === OSStatus.COMPLETED || os.status === OSStatus.CANCELLED);
  }, [osList, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Centro de Serviços & Manutenção</h1>
          <p className="text-slate-500 text-sm font-medium">Fluxo operacional profissional com atribuição de técnicos.</p>
        </div>
        <button onClick={() => { setActiveTab('TRIAGE'); handleOpenModal(); }} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2">
            <Plus size={18} /> Nova Ordem de Serviço
        </button>
      </div>

      <div className="bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm flex overflow-x-auto gap-1">
        {[
          { id: 'TRIAGE', label: '1. Recepção', icon: <ClipboardCheck size={16} />, color: 'bg-blue-600' },
          { id: 'BUDGET_WAIT', label: '2. Orçamentos', icon: <FileQuestion size={16} />, color: 'bg-violet-600' },
          { id: 'LAB', label: '3. Oficina/Laboratório', icon: <Wrench size={16} />, color: 'bg-indigo-600' },
          { id: 'HISTORY', label: '4. Saída/Histórico', icon: <History size={16} />, color: 'bg-emerald-600' }
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[140px] py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? `${tab.color} text-white shadow-lg` : 'text-slate-400 hover:bg-slate-50'}`}>
                {tab.icon} {tab.label}
            </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOS.map((os) => (
            <div key={os.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all relative group animate-in zoom-in duration-300 h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{os.id}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[os.status as any]}`}>{STATUS_LABELS[os.status]}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1 truncate">{os.equipment}</h3>
              <div className="flex items-center gap-2 mb-4">
                <Tag size={12} className="text-indigo-400" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{os.category || 'Geral'}</p>
              </div>

              <div className="flex items-center gap-2 mb-6 p-2 bg-slate-50 rounded-xl">
                 <UserRound size={14} className="text-slate-400" />
                 <p className="text-[10px] text-slate-600 font-black uppercase">{os.technicianName || 'Técnico não atribuído'}</p>
              </div>
              
              <div className="mt-auto space-y-4">
                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <Clock size={16} className="text-slate-300" />
                    <p className="text-lg font-black text-slate-900">{os.price > 0 ? formatToBRL(os.price) : 'Pendente'}</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => handleWhatsAppShare(os)} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-100 flex items-center justify-center gap-1"><Share2 size={12}/> Whats</button>
                    <button onClick={() => handleOpenModal(os)} className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-[9px] uppercase hover:bg-slate-100 flex items-center justify-center gap-1"><Edit2 size={12}/> Editar</button>
                 </div>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
             <div className="p-8 bg-slate-50/30 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">Gestão da Ordem de Serviço</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
             </div>
             <form className="p-8 space-y-8 overflow-y-auto custom-scrollbar" onSubmit={handleCreateOrUpdateOS}>
                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><ClipboardCheck size={14} className="text-indigo-600"/> Cliente & Responsável</h3>
                   <input type="text" placeholder="Nome do cliente..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={customerSearch} onChange={e => {setCustomerSearch(e.target.value); setSelectedCustomer(customers.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase())) || null);}} />
                   
                   <div className="relative">
                      <UserRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <select value={selectedTechnicianId} onChange={e => setSelectedTechnicianId(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none appearance-none cursor-pointer">
                         <option value="">Atribuir Técnico...</option>
                         {team.filter(u => u.role === UserRole.TECHNICIAN || u.role === UserRole.COMPANY_ADMIN).map(t => (
                           <option key={t.id} value={t.id}>{t.name} ({t.role.replace('_', ' ')})</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Box size={14} className="text-indigo-600"/> Item Sob Reparo</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Equipamento" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={equipmentName} onChange={e => setEquipmentName(e.target.value)} required />
                      <input type="text" placeholder="Categoria (Ex: TI, Elétrica)" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={equipmentCategory} onChange={e => setEquipmentCategory(e.target.value)} />
                   </div>
                   <textarea placeholder="Diagnóstico Inicial / Defeito Relatado..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none resize-none" rows={3} value={issueDescription} onChange={e => setIssueDescription(e.target.value)} required />
                </div>

                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl">Confirmar Registro OS</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
