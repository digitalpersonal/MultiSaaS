
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Building2, Zap, MessageCircle, Eye, EyeOff, Crown, Ban, Download, Cloud, CloudOff } from 'lucide-react';
import { UserRole, CompanyStatus, User as UserType, Company } from '../types';
import { databaseService } from '../services/databaseService';
import { isCloudEnabled } from '../services/supabase';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [cloudStatus, setCloudStatus] = useState<boolean>(false);

  const isMasterEmail = email.trim().toLowerCase() === 'digitalpersonal@gmail.com';

  useEffect(() => {
    // Verifica status da conexão com a nuvem
    setCloudStatus(isCloudEnabled());

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    setTimeout(async () => { 
      // 1. MASTER ADMIN (Hardcoded para recuperação/emergência)
      if (normalizedEmail === 'digitalpersonal@gmail.com' && normalizedPassword === 'Mld3602#?+') {
        onLogin({
          id: '936d5924-0115-47d4-9851-b245f1d2ac5d',
          name: 'Silvio T. de Sá Filho',
          email: 'digitalpersonal@gmail.com',
          role: UserRole.SUPER_ADMIN,
          companyId: 'platform_core'
        });
        setIsLoading(false);
        return;
      }

      // 2. TENANTS (Busca no Banco)
      try {
        const savedAccounts = await databaseService.fetch<UserType>('accounts', 'multiplus_accounts');
        const tenants = await databaseService.fetch<Company>('tenants', 'multiplus_tenants');
        
        const userExists = savedAccounts.find((acc: UserType) => 
          acc.email.trim().toLowerCase() === normalizedEmail
        );

        if (userExists && userExists.password.trim() === normalizedPassword) {
            const company = tenants.find((t: Company) => t.id === userExists.companyId);
            
            if (company && company.status === CompanyStatus.SUSPENDED) {
              setError('ACESSO BLOQUEADO. A UNIDADE ESTÁ SUSPENSA.');
            } else {
              onLogin(userExists);
            }
        } else {
            setError('E-mail ou senha inválidos. Verifique seus dados.');
        }
      } catch (err) {
        console.error("Erro ao buscar dados de login:", err);
        setError('ERRO DE CONEXÃO. Verifique sua internet e tente novamente.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/5535991048020?text=Olá Silvio! Gostaria de falar sobre o sistema Multiplus.', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white relative">
      
      {/* Indicador de Status do Servidor (Visual) */}
      <div 
        className={`absolute top-6 right-6 flex items-center gap-2 px-4 py-2 backdrop-blur-md rounded-full shadow-sm border ${cloudStatus ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white/50 border-slate-200'}`}
        title={cloudStatus ? "Conectado à Nuvem (Online)" : "Erro de Conexão (Offline)"}
      >
         {cloudStatus ? (
            <><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><Cloud size={14} className="text-emerald-600"/><span className="text-[10px] font-bold text-emerald-700 uppercase">Cloud On</span></>
         ) : (
            <><div className="w-2 h-2 rounded-full bg-rose-500"></div><CloudOff size={14} className="text-rose-500"/><span className="text-[10px] font-bold text-rose-600 uppercase">Cloud Off</span></>
         )}
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Multiplus SaaS</h1>
          <p className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-[0.4em]">Acesso Seguro</p>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[4rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-[10px] font-black flex items-center gap-4 animate-shake uppercase tracking-tight leading-relaxed">
                {error.includes('SUSPENSA') || error.includes('BLOQUEADO') ? <Ban size={24} /> : <AlertCircle size={24} />} {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail ou Usuário</label>
              <div className="relative">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 ${isMasterEmail ? 'text-indigo-600' : 'text-slate-300'}`} size={20} />
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none transition-all" 
                  placeholder="usuario@empresa.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Senha</label>
              <div className="relative">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 ${isMasterEmail ? 'text-indigo-600' : 'text-slate-300'}`} size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none transition-all" 
                  placeholder="••••••••"
                  required 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-6 rounded-[2rem] font-black shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs ${isMasterEmail ? 'bg-slate-900 text-indigo-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>{isMasterEmail ? 'Acessar Central Mestre' : 'Entrar no Sistema'}</>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center flex flex-col items-center gap-4">
          {installPrompt && (
            <button 
              onClick={handleInstallApp}
              className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
            >
              <Download size={20} />
              Instalar Sistema
            </button>
          )}

          <button onClick={handleContactSupport} className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 group">
            <MessageCircle size={20} className="group-hover:animate-pulse" />
            Falar com o desenvolvedor
          </button>
          
          <div className="pt-8 border-t border-slate-200/60 w-full">
            <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">Desenvolvido por Multiplus - Sistemas Inteligentes</p>
            <p className="text-sm font-black text-slate-900 mt-2 uppercase tracking-[0.1em]">Silvio T. de Sá Filho</p>
          </div>
        </div>
      </div>
    </div>
  );
};