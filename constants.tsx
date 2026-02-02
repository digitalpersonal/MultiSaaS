
import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  ShieldCheck,
  FileText,
  UserRound,
  HelpCircle
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'sales', label: 'Vendas (PDV)', icon: <ShoppingCart size={20} />, path: '/vendas' },
  { id: 'services', label: 'Ordens de Serviço', icon: <Wrench size={20} />, path: '/servicos' },
  { id: 'budgets', label: 'Orçamentos', icon: <FileText size={20} />, path: '/orcamentos' },
  { id: 'inventory', label: 'Estoque & Catálogo', icon: <Package size={20} />, path: '/estoque' },
  { id: 'finance', label: 'Financeiro & Contábil', icon: <DollarSign size={20} />, path: '/financeiro' },
  { id: 'customers', label: 'Clientes (CRM)', icon: <Users size={20} />, path: '/clientes' },
  { id: 'team', label: 'Equipe & RH', icon: <UserRound size={20} />, path: '/equipe' },
  { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} />, path: '/relatorios' },
  { id: 'help', label: 'Ajuda & Guia ERP', icon: <HelpCircle size={20} />, path: '/ajuda' },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
];

export const SUPER_ADMIN_NAV_ITEM = { 
  id: 'super-admin', 
  label: 'Gestão SaaS', 
  icon: <ShieldCheck size={20} />, 
  path: '/super-admin' 
};

export const STATUS_LABELS: Record<string, string> = {
  AWAITING: 'Aguardando',
  IN_ANALYSIS: 'Entrada/Triagem',
  BUDGET_PENDING: 'Orçamento Enviado',
  WAITING_PARTS: 'Peças Solicitadas',
  IN_REPAIR: 'Em Manutenção',
  COMPLETED: 'Pronto/Entregue',
  CANCELLED: 'Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  AWAITING: 'bg-slate-100 text-slate-600',
  IN_ANALYSIS: 'bg-blue-100 text-blue-800',
  BUDGET_PENDING: 'bg-violet-100 text-violet-800',
  WAITING_PARTS: 'bg-orange-100 text-orange-800',
  IN_REPAIR: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const BUDGET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Em Aberto',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  CONVERTED: 'Convertido',
};

export const BUDGET_STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  REJECTED: 'bg-rose-100 text-rose-800',
  CONVERTED: 'bg-emerald-100 text-emerald-800',
};
