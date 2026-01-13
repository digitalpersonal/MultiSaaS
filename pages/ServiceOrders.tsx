
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  Smartphone, 
  Wrench,
  QrCode,
  MoreVertical,
  ClipboardCheck,
  AlertTriangle,
  Zap,
  Power,
  Wifi,
  Volume2,
  Camera,
  BatteryCharging
} from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { OSChecklist } from '../types';

const mockCustomers = [
  { id: '1', name: 'João da Silva', taxId: '123.456.789-00', phone: '5511999999999' },
  { id: '2', name: 'Maria Oliveira', taxId: '12.345.678/0001-90', phone: '5511888888888' },
];

const mockTechnicians = [
  { id: 'tech_1', name: 'Ricardo Silva' },
  { id: 'tech_2', name: 'Ana Souza' },
  { id: 'tech_3', name: 'Marcos Lima' },
];

const initialOS = [
  { id: 'OS-1001', customerName: 'João da Silva', device: 'iPhone 13 Pro', defect: 'Tela quebrada', status: 'IN_REPAIR', price: 1200.00, date: '2023-10-25', technicianName: 'Ricardo Silva' },
  { id: 'OS-1002', customerName: 'Maria Oliveira', device: 'Samsung S22', defect: 'Não liga', status: 'IN_ANALYSIS', price: 0, date: '2023-10-26', technicianName: 'Não atribuído' },
];

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatToBRL = (value: number) => currencyFormatter.format(value);

export const ServiceOrders: React.FC = () => {
  const [osList, setOsList] = useState(initialOS);
  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceDefect, setDeviceDefect] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('');
  const [selectedTech, setSelectedTech] = useState('');

  // Checklist States
  const [checklist, setChecklist] = useState<OSChecklist>({
    power: 'NOT_TESTED',
    touch: 'NOT_TESTED',
    cameras: 'NOT_TESTED',
    audio: 'NOT_TESTED',
    wifi: 'NOT_TESTED',
    charging: 'NOT_TESTED',
  });

  const handleChecklistChange = (key: keyof OSChecklist, value: 'YES' | 'NO' | 'NOT_TESTED') => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const tech = mockTechnicians.find(t => t.id === selectedTech);
    const newOS = {
      id: `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: selectedCustomer.name,
      device: deviceModel,
      defect: deviceDefect,
      status: 'AWAITING',
      price: 0,
      date: new Date().toISOString().split('T')[0],
      technicianName: tech?.name || 'Não atribuído'
    };

    setOsList([newOS, ...osList]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCustomer(null); setCustomerSearch(''); setDeviceModel(''); setDeviceDefect(''); setDeviceCondition('');
    setSelectedTech('');
    setChecklist({ power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED' });
  };

  const filteredCustomers = mockCustomers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ordens de Serviço</h1>
          <p className="text-slate-500 text-sm font-medium">Controle de reparos e integridade de entrada.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 uppercase tracking-widest text-[10px]">
          <Plus size={18} className="mr-2" /> Abrir Nova OS
        </button>
      </div>

      <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar">
        {Object.keys(STATUS_LABELS).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {osList.filter(os => filter === 'ALL' || os.status === filter).map((os) => (
          <div key={os.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{os.id}</span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[os.status as any]}`}>
                {STATUS_LABELS[os.status]}
              </span>
            </div>
            <h3 className="font-black text-slate-900 text-lg mb-1 truncate">{os.device}</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium truncate">{os.customerName}</p>
            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase">Responsável</p>
                 <p className="text-[10px] font-bold text-indigo-600">{os.technicianName}</p>
              </div>
              <p className="text-lg font-black text-slate-900">{os.price > 0 ? formatToBRL(os.price) : 'Orçando'}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
             <div className="flex justify-between items-center p-8 border-b border-slate-50 bg-slate-50/30">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Nova Ordem de Serviço</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
             </div>
             <form className="p-8 space-y-8 overflow-y-auto custom-scrollbar" onSubmit={handleCreateOS}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="col-span-full">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Cliente</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" placeholder="Buscar por nome ou CPF..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
                      {customerSearch && !selectedCustomer && (
                        <div className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-2">
                           {filteredCustomers.map(c => (
                             <button key={c.id} type="button" onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); }} className="w-full text-left p-3 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all">{c.name}</button>
                           ))}
                        </div>
                      )}
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Modelo do Dispositivo</label>
                      <input type="text" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} placeholder="Ex: iPhone 13 Pro" required />
                   </div>

                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Técnico</label>
                      <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer">
                        <option value="">Selecione...</option>
                        {mockTechnicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                   </div>

                   <div className="col-span-full">
                      <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                         <div className="flex items-center gap-3 mb-6">
                            <ClipboardCheck size={20} className="text-indigo-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Checklist de Integridade</h3>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              { key: 'power', label: 'Liga?', icon: <Power size={14} /> },
                              { key: 'touch', label: 'Touch?', icon: <Zap size={14} /> },
                              { key: 'cameras', label: 'Câmeras?', icon: <Camera size={14} /> },
                              { key: 'audio', label: 'Áudio?', icon: <Volume2 size={14} /> },
                              { key: 'wifi', label: 'Wi-Fi?', icon: <Wifi size={14} /> },
                              { key: 'charging', label: 'Carga?', icon: <BatteryCharging size={14} /> },
                            ].map(item => (
                              <div key={item.key} className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">{item.icon} {item.label}</label>
                                 <div className="flex gap-1 bg-white/5 p-1 rounded-xl">
                                    {['YES', 'NO', 'NOT_TESTED'].map(val => (
                                      <button 
                                        key={val}
                                        type="button"
                                        onClick={() => handleChecklistChange(item.key as any, val as any)}
                                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${checklist[item.key as keyof OSChecklist] === val ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                      >
                                        {val === 'YES' ? 'SIM' : val === 'NO' ? 'NÃO' : 'N/T'}
                                      </button>
                                    ))}
                                 </div>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="col-span-full">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Estado Estético do Dispositivo</label>
                      <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none resize-none" rows={2} value={deviceCondition} onChange={(e) => setDeviceCondition(e.target.value)} placeholder="Ex: Tela riscada, tampa traseira trincada no canto..." />
                   </div>

                   <div className="col-span-full">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Defeito Relatado</label>
                      <textarea className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none resize-none" rows={2} value={deviceDefect} onChange={(e) => setDeviceDefect(e.target.value)} placeholder="O que o cliente relatou?" required />
                   </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-white py-4 border-t border-slate-50">
                   <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs">
                      <CheckCircle2 size={20} className="inline mr-2" /> Gerar Ordem de Serviço
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
