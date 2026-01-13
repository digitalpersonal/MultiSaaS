
import React, { useState, useEffect } from 'react';
import { Search, Plus, User, Mail, Phone, Edit2, Trash2, X, MoreVertical, CheckCircle2, History, ArrowUpRight } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>(() => JSON.parse(localStorage.getItem('multiplus_customers') || '[]'));
  useEffect(() => { localStorage.setItem('multiplus_customers', JSON.stringify(customers)); }, [customers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [taxId, setTaxId] = useState('');

  const handleOpenModal = (c?: any) => {
    if (c) { setEditingCustomer(c); setName(c.name); setEmail(c.email); setPhone(c.phone); setTaxId(c.taxId); }
    else { setEditingCustomer(null); setName(''); setEmail(''); setPhone(''); setTaxId(''); }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { id: editingCustomer ? editingCustomer.id : `CLI-${Date.now()}`, name, email, phone, taxId, status: 'Novo' };
    if (editingCustomer) setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? data : c));
    else setCustomers(prev => [data, ...prev]);
    setIsModalOpen(false);
  };

  const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Clientes (CRM)</h1><p className="text-slate-500 text-sm font-medium">Contatos e Fidelização.</p></div>
        <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg"><Plus size={18} className="inline mr-2" /> Novo Cliente</button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input type="text" placeholder="Pesquisar clientes..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100">
           <User size={64} className="mx-auto text-slate-100 mb-6" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Sem clientes cadastrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner font-black">{c.name.charAt(0)}</div>
              <h3 className="font-black text-slate-900 text-lg mb-4">{c.name}</h3>
              <div className="space-y-2 mb-6">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Phone size={14} className="text-slate-300" /> {c.phone}</div>
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Mail size={14} className="text-slate-300" /> {c.email}</div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                 <button onClick={() => handleOpenModal(c)} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Editar Perfil</button>
                 <button onClick={() => setCustomers(prev => prev.filter(x => x.id !== c.id))} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in">
             <h2 className="text-xl font-black text-slate-900 uppercase mb-8">{editingCustomer ? 'Atualizar Perfil' : 'Novo Cadastro'}</h2>
             <form onSubmit={handleSubmit} className="space-y-6">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome Completo..." required />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="WhatsApp" required />
                   <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="CPF / CNPJ" />
                </div>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="E-mail" />
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs">Confirmar Cliente</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
