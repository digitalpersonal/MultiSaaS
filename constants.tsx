
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
  FileText
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} />, path: '/' },
  { id: 'sales', label: 'Frente de Caixa (PDV)', icon: <ShoppingCart size={20} />, path: '/vendas' },
  { id: 'budgets', label: 'Orçamentos', icon: <FileText size={20} />, path: '/orcamentos' },
  { id: 'services', label: 'Ordens de Serviço', icon: <Wrench size={20} />, path: '/servicos' },
  { id: 'inventory', label: 'Estoque de Produtos', icon: <Package size={20} />, path: '/estoque' },
  { id: 'finance', label: 'Gestão Financeira', icon: <DollarSign size={20} />, path: '/financeiro' },
  { id: 'customers', label: 'Cadastro de Clientes', icon: <Users size={20} />, path: '/clientes' },
  { id: 'reports', label: 'Relatórios Gerenciais', icon: <BarChart3 size={20} />, path: '/relatorios' },
  { id: 'settings', label: 'Configurações', icon: <Settings size={20} />, path: '/configuracoes' },
];

export const SUPER_ADMIN_NAV_ITEM = { 
  id: 'super-admin', 
  label: 'Gestão SaaS (Dono)', 
  icon: <ShieldCheck size={20} />, 
  path: '/super-admin' 
};

export const STATUS_LABELS: Record<string, string> = {
  ALL: 'Todos os Status',
  AWAITING: 'Aguardando Início',
  IN_ANALYSIS: 'Em Orçamento',
  WAITING_PARTS: 'Aguardando Peças',
  IN_REPAIR: 'Em Manutenção',
  COMPLETED: 'Serviço Concluído',
  CANCELLED: 'Serviço Cancelado',
};

export const STATUS_COLORS: Record<string, string> = {
  AWAITING: 'bg-yellow-100 text-yellow-800',
  IN_ANALYSIS: 'bg-blue-100 text-blue-800',
  WAITING_PARTS: 'bg-orange-100 text-orange-800',
  IN_REPAIR: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};