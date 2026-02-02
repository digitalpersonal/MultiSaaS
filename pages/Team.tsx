
import React, { useState, useEffect } from 'react';
import { Plus, User, Mail, Phone, Shield, Edit2, Trash2, X, CheckCircle2, UserCheck, UserRound, Search, BadgeCheck } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { User as UserType, UserRole } from '../types';

export const Team: React.FC = () => {
  const ACCOUNTS_STORAGE_KEY = 'multiplus_accounts';
  const ACCOUNTS_TABLE_NAME = 'accounts';

  const [members, setMembers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const companyId = JSON.parse(localStorage.getItem('multiplus_user') || '{}').companyId;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
      // Filtra apenas membros da mesma empresa, excluindo o Super Admin
      setMembers(data.filter(u => u.companyId === companyId && u.role !== UserRole.SUPER_ADMIN));
      setIsLoading(false);
    };
    loadData();
  }, [companyId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<UserType | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [document, setDocument] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TECHNICIAN);
  const [password, setPassword] = useState('');

  const handleOpenModal = (m?: UserType) => {
    if (m) {
      setEditingMember(m); setName(m.name); setEmail(m.email); setPhone(m.phone || ''); 
      setDocument(m.document || ''); setRole(m.role); setPassword('');
    } else {
      setEditingMember(null); setName(''); setEmail(''); setPhone(''); setDocument(''); setRole(UserRole.TECHNICIAN); setPassword('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;

    const memberData: UserType = {
      id: editingMember ? editingMember.id : `USR-${Date.now()}`,
      companyId,
      name, email, phone, document, role,
      password: password || editingMember?.password || '123456',
      active: true,
      createdAt: editingMember?.createdAt || new Date().toISOString()
    };

    if (editingMember) {
      await databaseService.updateOne<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, memberData.id, memberData);
    } else {
      await databaseService.insertOne<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, memberData);
    }

    const updated = await databaseService.fetch<UserType>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY);
    setMembers(updated.filter(u => u.companyId === companyId && u.role !== UserRole.SUPER_ADMIN));
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Equipe & Capital Humano</h1>
          <p className="text-slate-500 text-sm font-medium">Gestão de acessos e colaboradores da unidade.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg flex items-center gap-2">
            <Plus size={16} /> Novo Colaborador
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Buscar por nome ou e-mail..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(member => (
          <div key={member.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative group overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg ${member.role === UserRole.COMPANY_ADMIN ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   {member.name.charAt(0)}
                </div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${member.role === UserRole.COMPANY_ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                   {member.role.replace('_', ' ')}
                </span>
             </div>
             <h3 className="text-base font-black text-slate-900 mb-1">{member.name}</h3>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{member.email}</p>
             
             <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Phone size={14} className="text-slate-300" /> {member.phone || 'Sem telefone'}</div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Shield size={14} className="text-slate-300" /> CPF: {member.document || 'Não informado'}</div>
             </div>

             <div className="flex gap-2 pt-6 border-t border-slate-50">
                <button onClick={() => handleOpenModal(member)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[9px] uppercase hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"><Edit2 size={12}/> Editar</button>
                <button className="p-2 text-slate-300 hover:text-rose-600 transition-all"><Trash2 size={18} /></button>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl animate-in zoom-in p-10 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase">Ficha do Colaborador</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={24} /></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                   <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome completo..." required />
                   <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="E-mail de acesso..." required />
                   <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="WhatsApp" />
                      <input type="text" value={document} onChange={e => setDocument(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="CPF" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none cursor-pointer">
                         <option value={UserRole.TECHNICIAN}>Técnico</option>
                         <option value={UserRole.SALES}>Vendedor/Caixa</option>
                         <option value={UserRole.COMPANY_ADMIN}>Gerente Admin</option>
                      </select>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder={editingMember ? "Nova senha (opcional)" : "Senha inicial"} required={!editingMember} />
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl">Salvar Colaborador</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
