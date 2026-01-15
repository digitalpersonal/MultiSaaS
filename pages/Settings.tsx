import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Save, QrCode, Key, MapPin, ImageIcon, UploadCloud, AlertTriangle, ChevronRight, Zap, Phone, Lock, CheckCircle2 } from 'lucide-react';
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
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [logo, setLogo] = useState('');

  // States para Financeiro (Pix e Taxas)
  const [pixType, setPixType] = useState('CNPJ');
  const [pixKey, setPixKey] = useState('');
  const [creditCardFee, setCreditCardFee] = useState('');
  const [debitCardFee, setDebitCardFee] = useState('');

  // States para Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleSaveCompanyData = async () => {
    setIsSaving(true);
    if (!company || !currentUser) return;

    const updatedCompany: CompanyType = { 
      ...company, 
      name: companyName, 
      taxId, 
      address,
      phone,
      pixType, 
      pixKey, 
      logo, 
      creditCardFee: parseFloat(creditCardFee) || 0,
      debitCardFee: parseFloat(debitCardFee) || 0,
      profileCompleted: true 
    };
    
    // Atualiza apenas esta empresa específica no Supabase
    await databaseService.updateOne<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY, company.id, updatedCompany);

    // Recarrega os dados para garantir que o estado local está atualizado
    const updatedTenants = await databaseService.fetch<CompanyType>(TENANTS_TABLE_NAME, TENANTS_STORAGE_KEY);
    const reloadedCompany = updatedTenants.find(t => t.id === company.id);
    setCompany(reloadedCompany || null);

    setIsSaving(false);
    alert('DADOS ATUALIZADOS! Configurações salvas com sucesso.');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('As senhas não conferem.');
      return;
    }

    setIsSaving(true);

    // Atualiza a senha na tabela de contas
    await databaseService.updateOne<User>(ACCOUNTS_TABLE_NAME, ACCOUNTS_STORAGE_KEY, currentUser.id, {
      password: newPassword
    });

    // Atualiza o usuário na sessão local
    const updatedUser = { ...currentUser, password: newPassword };
    localStorage.setItem('multiplus_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    setNewPassword('');
    setConfirmPassword('');
    setIsSaving(false);
    alert('SENHA ALTERADA COM SUCESSO! Utilize sua nova credencial no próximo login.');
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
        {activeTab !== 'security' && (
          <button onClick={handleSaveCompanyData} disabled={isSaving} className="px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50">
            {isSaving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1.5 shrink-0">
          <button onClick={() => setActiveTab('empresa')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'empresa' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <Building2 size={18} /> Empresa
          </button>
          <button onClick={() => setActiveTab('financeiro')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'financeiro' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <CreditCard size={18} /> Dados Financeiros
          </button>
          <div className="h-px bg-slate-200 mx-4 my-2"></div>
          <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-400 hover:bg-white'}`}>
            <Lock size={18} /> Segurança
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1 flex items-center gap-1"><Phone size={10} /> WhatsApp / Contato</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="(00) 90000-0000" />
                  </div>
                  <div className="col-span-full">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Endereço de Atendimento</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="Rua, Número, Bairro, Cidade - UF" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               {/* Seção Pix */}
               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                      <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem]">
                        <QrCode size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Recebimento Pix</h3>
                        <p className="text-sm text-slate-500 font-medium">Dados para geração de QR Code.</p>
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

               <div className="h-px bg-slate-100 w-full"></div>

               {/* Seção Taxas de Cartão */}
               <div className="space-y-6">
                  <div className="flex items-center gap-6">
                      <div className="p-4 bg-violet-50 text-violet-600 rounded-[1.5rem]">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Taxas de Máquina de Cartão</h3>
                        <p className="text-sm text-slate-500 font-medium">Configuração para desconto automático em vendas.</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Taxa Crédito (%)</label>
                        <div className="relative">
                           <input type="number" step="0.01" value={creditCardFee} onChange={e => setCreditCardFee(e.target.value)} className="w-full pl-6 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="0.00" />
                           <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Taxa Débito (%)</label>
                        <div className="relative">
                           <input type="number" step="0.01" value={debitCardFee} onChange={e => setDebitCardFee(e.target.value)} className="w-full pl-6 pr-10 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none" placeholder="0.00" />
                           <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                        </div>
                      </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <Zap size={12} className="inline mr-1 text-amber-500" />
                    As taxas configuradas aqui serão lançadas automaticamente como <strong>Despesa</strong> (Taxas Financeiras) sempre que você realizar uma venda por cartão no PDV ou no Financeiro.
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem]">
                     <Lock size={32} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">Credenciais de Acesso</h3>
                     <p className="text-sm text-slate-500 font-medium">Gerencie a senha de administrador da sua conta. Mantenha-a segura.</p>
                  </div>
               </div>
               
               <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Nova Senha</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-rose-100 transition-all" 
                      placeholder="••••••••"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Confirmar Nova Senha</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-rose-100 transition-all" 
                      placeholder="••••••••"
                      required 
                    />
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={isSaving} className="w-full py-5 bg-rose-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                      {isSaving ? 'Atualizando...' : <><CheckCircle2 size={18} /> Atualizar Senha</>}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-bold mt-4 uppercase">Esta ação não pode ser desfeita.</p>
                  </div>
               </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};