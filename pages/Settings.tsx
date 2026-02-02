
import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Save, QrCode, Key, MapPin, ImageIcon, UploadCloud, AlertTriangle, ChevronRight, Zap, Phone, Lock, CheckCircle2, Scale } from 'lucide-react';
import { databaseService } from '../services/databaseService';
import { Company as CompanyType, UserRole, User } from '../types';

export const Settings: React.FC = () => {
  const TENANTS_STORAGE_KEY = 'multiplus_tenants';
  const TENANTS_TABLE_NAME = 'tenants';
  const ACCOUNTS_STORAGE_KEY = 'multiplus_accounts';
  const ACCOUNTS_TABLE_NAME = 'accounts';

  const [activeTab, setActiveTab] = useState('empresa');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // States para Empresa
  const [companyName, setCompanyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [stateReg, setStateReg] = useState('');
  const [fiscalRegime, setFiscalRegime] = useState<any>('SIMPLES_NACIONAL');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');

  // States para Financeiro
  const [pixType, setPixType] = useState('CNPJ');
  const [pixKey, setPixKey] = useState('');
  const [creditCardFee, setCreditCardFee] = useState('');
  const [debitCardFee, setDebitCardFee] = useState('');

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
          setLegalName(currentCompany.legalName || '');
          setTaxId(currentCompany.taxId || '');
          setStateReg(currentCompany.stateRegistration || '');
          setFiscalRegime(currentCompany.fiscalRegime || 'SIMPLES_NACIONAL');
          setAddress(currentCompany.address || ''); 
          setPhone(currentCompany.phone || ''); 
          setPixType(currentCompany.pixType || 'CNPJ');
          setPixKey(currentCompany.pixKey || '');
          setLogo(currentCompany.logo || '');
          setCreditCardFee(currentCompany.creditCardFee ? currentCompany.creditCardFee.toString() : '0');
          setDebitCardFee(currentCompany.debitCardFee ? currentCompany.debitCardFee.toString() : '0');
        }
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleSaveCompanyData = async () => {
    setIsSaving(true);
    if (!company || !currentUser) return;

    const updatedCompany: CompanyType = { 
      ...company, 
      name: companyName, 
      legalName,
      taxId, 
      stateRegistration: stateReg,
      fiscalRegime,
      address,
      phone,
      pixType, 
      pixKey, 
      logo, 
      creditCardFee: parseFloat(creditCardFee) || 0,
      debitCardFee: parseFloat(debitCardFee) || 0,
      profileCompleted: true 
    };
    
    await databaseService.updateOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, company.id, updatedCompany);
    setIsSaving(false);
    alert('DADOS CORPORATIVOS SALVOS!');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Identidade Corporativa</h1>
          <p className="text-slate-500 text-sm font-medium">Configurações para conformidade fiscal e RH.</p>
        </div>
        <button onClick={handleSaveCompanyData} disabled={isSaving} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50">
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1.5 shrink-0">
          <button onClick={() => setActiveTab('empresa')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'empresa' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <Building2 size={18} /> Dados Fiscais
          </button>
          <button onClick={() => setActiveTab('financeiro')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'financeiro' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <CreditCard size={18} /> Pagamentos
          </button>
        </aside>

        <main className="flex-1 bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10">
          {activeTab === 'empresa' && (
            <div className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Razão Social</label>
                    <input type="text" value={legalName} onChange={e => setLegalName(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Nome Completo da Empresa" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Regime Tributário</label>
                    <select value={fiscalRegime} onChange={e => setFiscalRegime(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none cursor-pointer">
                      <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                      <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                      <option value="LUCRO_REAL">Lucro Real</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">CNPJ</label>
                    <input type="text" value={taxId} onChange={e => setTaxId(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="00.000.000/0000-00" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Inscrição Estadual</label>
                    <input type="text" value={stateReg} onChange={e => setStateReg(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Telefone Corporativo</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" />
                  </div>
               </div>
            </div>
          )}
          {/* Adicione abas de financeiro conforme necessário */}
        </main>
      </div>
    </div>
  );
};
