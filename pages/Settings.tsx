
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Shield, 
  CreditCard, 
  Globe, 
  Bell, 
  Save, 
  CheckCircle2,
  ChevronRight,
  Plus,
  DollarSign,
  Percent,
  Smartphone,
  Mail,
  Zap,
  ShieldCheck,
  Scale,
  Palette,
  Image as ImageIcon,
  UploadCloud,
  FileText,
  MapPin,
  Tag,
  AlertTriangle,
  QrCode,
  Key
} from 'lucide-react';
import { Company } from '../types';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile Completion Logic
  const [company, setCompany] = useState<any>(() => {
    const user = JSON.parse(localStorage.getItem('multiplus_user') || '{}');
    const tenants = JSON.parse(localStorage.getItem('multiplus_tenants') || '[]');
    return tenants.find((t: any) => t.id === user.companyId) || {};
  });

  // State for company settings
  const [companyName, setCompanyName] = useState(company.name || 'Sua Empresa');
  const [taxId, setTaxId] = useState(company.taxId || '');
  const [legalName, setLegalName] = useState(company.legalName || '');
  const [phone, setPhone] = useState(company.phone || '');
  const [address, setAddress] = useState(company.address || '');
  
  // Pix Settings
  const [pixType, setPixType] = useState(company.pixType || 'CNPJ');
  const [pixKey, setPixKey] = useState(company.pixKey || '');

  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedCompany = {
        ...company,
        name: companyName,
        taxId,
        legalName,
        phone,
        address,
        pixType,
        pixKey,
        profileCompleted: true
      };

      const tenants = JSON.parse(localStorage.getItem('multiplus_tenants') || '[]');
      const newTenants = tenants.map((t: any) => t.id === company.id ? updatedCompany : t);
      localStorage.setItem('multiplus_tenants', JSON.stringify(newTenants));
      
      setCompany(updatedCompany);
      setIsSaving(false);
      alert('Configurações salvas com sucesso! Seus links de cobrança Pix estão ativos.');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configurações da Unidade</h1>
          <p className="text-slate-500 text-sm font-medium">Personalize sua empresa e configure seus métodos de recebimento.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 uppercase tracking-widest text-[10px]"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
          ) : (
            <Save size={18} className="mr-3" />
          )}
          Salvar Configurações
        </button>
      </div>

      {!company.profileCompleted && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] flex items-center gap-4 text-amber-800 animate-pulse">
          <AlertTriangle size={24} className="shrink-0" />
          <p className="text-sm font-bold uppercase tracking-tight">Ação Necessária: Complete os dados da empresa e configure o Pix para habilitar as cobranças.</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-72 shrink-0 space-y-1.5">
          {[
            { id: 'empresa', label: 'Identidade da Empresa', icon: <Building2 size={18} /> },
            { id: 'pix', label: 'Recebimento Pix', icon: <QrCode size={18} /> },
            { id: 'equipe', label: 'Gestão da Equipe', icon: <Users size={18} /> },
            { id: 'assinatura', label: 'Assinatura SaaS', icon: <CreditCard size={18} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.5rem] transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-xl border border-slate-100' 
                  : 'text-slate-400 hover:bg-white hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={activeTab === tab.id ? 'text-indigo-600' : 'text-slate-300'}>{tab.icon}</span>
                {tab.label}
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </aside>

        <main className="flex-1 min-w-0">
          {activeTab === 'empresa' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Dados Cadastrais</h3>
                      <p className="text-sm text-slate-500 font-medium">Informações exibidas em recibos e ordens de serviço.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nome Fantasia</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">CNPJ / CPF</label>
                    <input type="text" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" />
                  </div>
                  <div className="col-span-full">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Endereço Completo</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pix' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-6 duration-500">
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shadow-sm">
                    <QrCode size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Configuração de Cobrança Pix</h3>
                    <p className="text-sm text-slate-500 font-medium italic">Sua chave será usada para gerar links automáticos de pagamento.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Tipo de Chave Pix</label>
                    <select 
                      value={pixType} 
                      onChange={(e) => setPixType(e.target.value)} 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none cursor-pointer"
                    >
                      <option value="CNPJ">CNPJ</option>
                      <option value="CPF">CPF</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="PHONE">Celular</option>
                      <option value="RANDOM">Chave Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Chave Pix</label>
                    <div className="relative">
                       <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input 
                         type="text" 
                         value={pixKey} 
                         onChange={(e) => setPixKey(e.target.value)} 
                         className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-bold outline-none" 
                         placeholder="Insira sua chave aqui..." 
                       />
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center gap-6 shadow-2xl shadow-indigo-100/20">
                   <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                      <Zap size={24} className="text-indigo-400" />
                   </div>
                   <div>
                      <p className="text-sm font-bold uppercase tracking-tight">Como funciona o envio?</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">Ao finalizar uma Ordem de Serviço ou Venda, o sistema habilitará um botão de WhatsApp. Ao clicar, o cliente recebe uma mensagem profissional com os dados do pedido e sua chave Pix pronta para pagamento.</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assinatura' && (
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-right-6 duration-500">
                <div className="p-10 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Plano Atual</p>
                      <h3 className="text-3xl font-black">Multiplus PRO</h3>
                      <p className="text-sm text-indigo-400 font-bold mt-1">SaaS Ativo e Provisionado</p>
                   </div>
                   <div className="text-right">
                      <p className="text-4xl font-black">R$ 149,90</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Pagamento Mensal</p>
                   </div>
                </div>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};
