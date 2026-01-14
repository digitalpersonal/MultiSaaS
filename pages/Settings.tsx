import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Save, QrCode, Key, MapPin, ImageIcon, UploadCloud, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Company as CompanyType, UserRole, User } from '../types';

export const Settings: React.FC = () => {
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';

  const [activeTab, setActiveTab] = useState('empresa');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);


  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [pixType, setPixType] = useState('CNPJ');
  const [pixKey, setPixKey] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const user = JSON.parse(localStorage.getItem('multiplus_user') || 'null');
      setCurrentUser(user);

      if (user && user.companyId && user.role !== UserRole.SUPER_ADMIN) {
        const tenants = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
        const currentCompany = tenants.find((t: CompanyType) => t.id === user.companyId);
        if (currentCompany) {
          setCompany(currentCompany);
          setCompanyName(currentCompany.name || '');
          setTaxId(currentCompany.taxId || '');
          setAddress(currentCompany.address || ''); // Assumindo que company tem address
          setPixType(currentCompany.pixType || 'CNPJ');
          setPixKey(currentCompany.pixKey || '');
          setLogo(currentCompany.logo || '');
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []); // Dependência vazia, carrega uma vez ao montar

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    if (!company || !currentUser) return;

    const updatedCompany: CompanyType = { 
      ...company, 
      name: companyName, 
      taxId, 
      address, // Salva o endereço
      pixType, 
      pixKey, 
      logo, 
      profileCompleted: true 
    };
    
    // Atualiza apenas esta empresa específica no Supabase
    await databaseService.updateOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, company.id, updatedCompany);

    // Recarrega os dados para garantir que o estado local está atualizado
    const updatedTenants = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
    const reloadedCompany = updatedTenants.find(t => t.id === company.id);
    setCompany(reloadedCompany || null);

    setIsSaving(false);
    alert('DADOS ATUALIZADOS! Sua empresa está configurada para emissão de documentos.');
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest">
        Carregando Configurações...
      </div>
    );
  }

  if (!company) {
    return (
      <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
        Nenhuma empresa encontrada para configurar.
      </div>
    );
  }


  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identidade & Configurações</h1>
          <p className="text-slate-500 text-sm font-medium">Personalize sua unidade para uso oficial.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50">
          {isSaving ? 'Salvando...' : 'Salvar Tudo'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1.5 shrink-0">
          <button onClick={() => setActiveTab('empresa')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'empresa' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <Building2 size={18} /> Empresa
          </button>
          <button onClick={() => setActiveTab('pix')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pix' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <QrCode size={18} /> Cobrança Pix
          </button>
        </aside>

        <main className="flex-1 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
          {activeTab === 'empresa' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center gap-8 flex-col sm:flex-row text-center sm:text-left">
                  <div className="relative group">
                     <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                        {logo ? <img src={logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-slate-200" />}
                     </div>
                     <label className="absolute inset-0 flex items-center justify-center bg-indigo-600/80 opacity-0 group-hover:opacity-100 transition-all rounded-[2.5rem] cursor-pointer text-white text-[10px] font-black uppercase">
                        Alterar Logo
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                     </label>
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">Logomarca Oficial</h3>
                     <p className="text-sm text-slate-500 font-medium">Esta imagem aparecerá em todos os seus recibos e ordens de serviço.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nome Fantasia da Unidade</label>
                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Ex: Multiplus Assistência Técnica" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">CNPJ ou CPF</label>
                    <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="00.000.000/0000-00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Endereço de Atendimento</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'pix' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem]">
                     <QrCode size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">Recebimento Instantâneo (PIX)</h3>
                     <p className="text-sm text-slate-500 font-medium">Configura os dados para geração de QR Code e links de pagamento.</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tipo de Chave</label>
                    <select value={pixType} onChange={e => setPixType(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none cursor-pointer">
                       <option value="CNPJ">CNPJ</option><option value="CPF">CPF</option><option value="EMAIL">E-mail</option><option value="PHONE">Celular</option><option value="RANDOM">Aleatória</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Chave Pix Oficial</label>
                    <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Sua chave aqui..." />
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};