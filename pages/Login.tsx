
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, LogIn, AlertCircle, Building2, Zap, MessageCircle, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // 1. Verificar Credenciais Fixas do Super Admin (Master)
      // Reconhecendo o e-mail oficial master: digitalpersonal@gmail.com
      if (email === 'digitalpersonal@gmail.com' && password === 'Mld3602#?+') {
        onLogin({
          id: '936d5924-0115-47d4-9851-b245f1d2ac5d', // Seu UUID Master oficial
          name: 'Super Admin Master',
          email: 'digitalpersonal@gmail.com',
          role: UserRole.SUPER_ADMIN,
          companyId: 'platform_core'
        });
        setIsLoading(false);
        return;
      }

      // 2. Verificar Credenciais Dinâmicas (Criadas pelo Super Admin)
      const savedAccounts = JSON.parse(localStorage.getItem('multiplus_accounts') || '[]');
      const foundAccount = savedAccounts.find((acc: any) => acc.email === email && acc.password === password);

      if (foundAccount) {
        onLogin(foundAccount);
      } else {
        setError('E-mail ou senha incorretos. Acesso restrito a administradores e operadores autorizados.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleContactSupport = () => {
    window.open('https://wa.me/5535991048020?text=Olá Multiplus! Gostaria de falar sobre o sistema SaaS.', '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200 animate-bounce-slow">
            <ShieldCheck className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Multiplus SaaS</h1>
          <p className="text-slate-500 font-bold mt-2 text-xs uppercase tracking-[0.4em]">Portal de Acesso Seguro</p>
        </div>

        <div className="bg-white p-10 md:p-12 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
          
          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="p-5 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-[11px] font-black flex items-center gap-4 animate-shake uppercase tracking-tight">
                <AlertCircle size={20} className="shrink-0" /> {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none transition-all" 
                  placeholder="seu@email.com"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Senha de Acesso</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border-none rounded-3xl focus:ring-4 focus:ring-indigo-500/10 text-sm font-black outline-none transition-all" 
                  placeholder="••••••••"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none"
                  title={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 uppercase tracking-widest text-xs"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={22} /> Acessar Unidade
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <div className="flex items-center justify-center gap-6 text-slate-200">
               <Zap size={20} />
               <Building2 size={20} />
               <ShieldCheck size={20} />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-6 text-center">
          <button 
            onClick={handleContactSupport}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border border-slate-100 text-emerald-600 rounded-3xl text-xs font-black uppercase tracking-widest shadow-xl hover:bg-emerald-50 transition-all active:scale-95 group"
          >
            <MessageCircle size={20} className="group-hover:animate-pulse" />
            Suporte Multiplus
          </button>

          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Digital Personal & Multiplus SaaS
            </p>
            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
              Silvio T. de Sá Filho
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
        .border-3 { border-width: 3px; }
      `}</style>
    </div>
  );
};
