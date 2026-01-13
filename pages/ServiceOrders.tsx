
import React, { useState, useEffect } from 'react';
import { Plus, Search, X, CheckCircle2, Wrench, ClipboardCheck, Smartphone, Camera, Power, Volume2, Wifi, BatteryCharging, AlertTriangle, Clock } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS } from '../constants';
import { OSChecklist } from '../types';

export const ServiceOrders: React.FC = () => {
  const [osList, setOsList] = useState<any[]>(() => JSON.parse(localStorage.getItem('multiplus_os') || '[]'));
  const [customers] = useState<any[]>(() => JSON.parse(localStorage.getItem('multiplus_customers') || '[]'));

  useEffect(() => {
    localStorage.setItem('multiplus_os', JSON.stringify(osList));
  }, [osList]);

  const [filter, setFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceDefect, setDeviceDefect] = useState('');
  const [deviceCondition, setDeviceCondition] = useState('');
  
  const [checklist, setChecklist] = useState<OSChecklist>({
    power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED',
  });

  const handleCreateOS = (e: React.FormEvent) => {
    e.preventDefault();
    const newOS = {
      id: `OS-${Date.now().toString().slice(-5)}`,
      customerName: selectedCustomer?.name || 'Cliente Avulso',
      device: deviceModel,
      defect: deviceDefect,
      status: 'AWAITING',
      price: 0,
      date: new Date().toISOString(),
      checklist
    };
    setOsList([newOS, ...osList]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => { setSelectedCustomer(null); setCustomerSearch(''); setDeviceModel(''); setDeviceDefect(''); setDeviceCondition(''); setChecklist({ power: 'NOT_TESTED', touch: 'NOT_TESTED', cameras: 'NOT_TESTED', audio: 'NOT_TESTED', wifi: 'NOT_TESTED', charging: 'NOT_TESTED' }); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Painel de Reparos (O.S.)</h1>
          <p className="text-slate-500 text-sm font-medium">Gestão técnica centralizada.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px]"><Plus size={18} className="mr-2 inline" /> Abrir Protocolo</button>
      </div>

      {osList.length === 0 ? (
        <div className="py-32 text-center bg-white rounded-[3rem] border border-slate-100">
           <Smartphone size={64} className="mx-auto text-slate-100 mb-6" />
           <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Nenhuma O.S. ativa</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {osList.filter(os => filter === 'ALL' || os.status === filter).map((os) => (
            <div key={os.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{os.id}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_COLORS[os.status as any]}`}>{STATUS_LABELS[os.status]}</span>
              </div>
              <h3 className="font-black text-slate-900 text-base mb-1 truncate">{os.device}</h3>
              <p className="text-[10px] text-slate-500 mb-6 font-bold uppercase tracking-widest">{os.customerName}</p>
              <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                 <Clock size={16} className="text-slate-300" />
                 <p className="text-lg font-black text-slate-900">{os.price > 0 ? `R$ ${os.price}` : 'Em Orçamento'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[95vh] flex flex-col">
             <div className="p-8 bg-slate-50/30 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">Novo Protocolo Técnico</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400"><X size={24} /></button>
             </div>
             <form className="p-8 space-y-6 overflow-y-auto" onSubmit={handleCreateOS}>
                <div className="space-y-4">
                   <input type="text" placeholder="Nome do cliente..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={customerSearch} onChange={e => {setCustomerSearch(e.target.value); setSelectedCustomer(customers.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase())))}} />
                   <input type="text" placeholder="Dispositivo (Ex: iPhone 14 Pro Max)" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" value={deviceModel} onChange={e => setDeviceModel(e.target.value)} required />
                   <textarea placeholder="Relato do Defeito..." className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none resize-none" rows={3} value={deviceDefect} onChange={e => setDeviceDefect(e.target.value)} required />
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-indigo-700 transition-all">Abrir Ordem de Serviço</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
