
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Bell, User, LogOut, ChevronRight, LayoutDashboard, Package, Wrench, DollarSign, ShieldCheck } from 'lucide-react';
import { NAV_ITEMS, SUPER_ADMIN_NAV_ITEM } from '../constants';
import { User as UserType, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const isSuperAdmin = user.role === UserRole.SUPER_ADMIN;

  const bottomNavItems = [
    { label: 'Início', icon: <LayoutDashboard size={20} />, path: '/' },
    { label: 'Estoque', icon: <Package size={20} />, path: '/estoque' },
    { label: 'Serviços', icon: <Wrench size={20} />, path: '/servicos' },
    { label: 'Financeiro', icon: <DollarSign size={20} />, path: '/financeiro' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-all duration-300 transform shadow-2xl lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Multiplus SaaS
              </span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={20} /></button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
            <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ambiente Administrativo</p>
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500 transition-colors'}>{item.icon}</span>
                    <span className="font-semibold text-sm">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-white/70" />}
                </Link>
              );
            })}

            {isSuperAdmin && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gestão da Plataforma</p>
                <Link
                  to={SUPER_ADMIN_NAV_ITEM.path}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                    location.pathname === SUPER_ADMIN_NAV_ITEM.path 
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={location.pathname === SUPER_ADMIN_NAV_ITEM.path ? 'text-white' : 'text-slate-400 group-hover:text-slate-900 transition-colors'}>
                      {SUPER_ADMIN_NAV_ITEM.icon}
                    </span>
                    <span className="font-semibold text-sm font-black">{SUPER_ADMIN_NAV_ITEM.label}</span>
                  </div>
                  {location.pathname === SUPER_ADMIN_NAV_ITEM.path && <ChevronRight size={14} className="text-white/70" />}
                </Link>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="p-3 bg-slate-50 rounded-2xl flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                {isSuperAdmin ? <ShieldCheck className="text-indigo-600" size={18} /> : <User size={18} className="text-slate-400" />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{isSuperAdmin ? 'Platform Owner' : 'Empresa Admin'}</p>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center w-full px-3 py-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors text-sm font-semibold">
              <LogOut size={18} className="mr-3" /> Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors mr-2"><Menu size={24} /></button>
            <h2 className="text-sm font-bold text-slate-900 lg:hidden">
              {location.pathname === '/super-admin' ? 'Gestão SaaS' : (NAV_ITEMS.find(item => item.path === location.pathname)?.label || 'Painel')}
            </h2>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-900">{user.email}</p>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{user.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shadow-sm">
               {isSuperAdmin ? <ShieldCheck className="text-indigo-600" size={18} /> : <User className="text-slate-400" size={18} />}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] pb-safe">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.label} to={item.path} className={`flex flex-col items-center space-y-1 transition-all duration-300 ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'}`}>
                <div className={`${isActive ? 'bg-indigo-50 p-1.5 rounded-lg' : ''}`}>{item.icon}</div>
                <span className={`text-[10px] font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <style>{`
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 12px); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};
