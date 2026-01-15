
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_ADMIN = 'COMPANY_ADMIN',
  TECHNICIAN = 'TECHNICIAN',
  SALES = 'SALES'
}

export enum CompanyStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRIAL = 'TRIAL',
  PENDING_SETUP = 'PENDING_SETUP'
}

export interface Company {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string; // CNPJ/CPF
  logo?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: CompanyStatus;
  currency: string;
  taxRate: number;
  serviceFeeRate: number;
  profileCompleted: boolean;
  pixType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  pixKey?: string;
  creditCardFee?: number; // Taxa Cartão de Crédito %
  debitCardFee?: number;  // Taxa Cartão de Débito %
  adminEmail?: string; // Temporário para SuperAdmin mockado
  address?: string; 
  phone?: string; // WhatsApp / Telefone de Contato
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Apenas para simulação mock
}

export enum OSStatus {
  AWAITING = 'AWAITING', // Aguardando Triagem
  IN_ANALYSIS = 'IN_ANALYSIS', // Em Triagem/Análise (Entrada)
  BUDGET_PENDING = 'BUDGET_PENDING', // Orçamento Feito (Aguardando Cliente)
  WAITING_PARTS = 'WAITING_PARTS', // Aprovado (Aguardando Peças)
  IN_REPAIR = 'IN_REPAIR', // Aprovado (Em Manutenção)
  COMPLETED = 'COMPLETED', // Pronto/Entregue
  CANCELLED = 'CANCELLED' // Recusado/Cancelado
}

export interface OSChecklist {
  power: 'YES' | 'NO' | 'NOT_TESTED';
  touch: 'YES' | 'NO' | 'NOT_TESTED';
  cameras: 'YES' | 'NO' | 'NOT_TESTED';
  audio: 'YES' | 'NO' | 'NOT_TESTED';
  wifi: 'YES' | 'NO' | 'NOT_TESTED';
  charging: 'YES' | 'NO' | 'NOT_TESTED';
}

export interface ServiceOrder {
  id: string;
  companyId: string; // Adicionado para multi-tenancy
  customerId: string;
  customerName: string;
  phone?: string;
  device: string;
  imei?: string; // Novo
  devicePassword?: string; // Novo
  accessories?: string; // Novo: Acessórios deixados (Capa, Carregador, etc)
  defect: string;
  status: OSStatus;
  price: number;
  discount?: number;
  observations?: string;
  deviceCondition?: string;
  date: string;
  technicianId?: string;
  technicianName?: string;
  checklist?: OSChecklist;
}

export interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  stock: number;
}

export interface Product {
  id: string;
  companyId: string; // Adicionado para multi-tenancy
  name: string;
  category: string;
  sku?: string;
  stock?: number;
  minStock?: number;
  costPrice: number;
  salePrice: number;
  type: 'PHYSICAL' | 'DIGITAL' | 'PERSONALIZED' | 'SERVICE';
  active: boolean;
  observations?: string;
  hasVariations: boolean;
  variations?: ProductVariation[];
  estimatedDuration?: string;
}

export interface Customer {
  id: string;
  companyId: string; // Adicionado para multi-tenancy
  name: string;
  taxId: string;
  email: string;
  phone: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  status?: string; // Adicionado para mock do SuperAdmin
}

export interface FinanceCategory {
  id: string;
  companyId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Transaction {
  id: string;
  companyId: string; // Adicionado para multi-tenancy
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  category?: string;
  account?: string;
  method?: string;
  notes?: string;
  desc?: string; // Adicionado para mock do Finance
  installment?: {
    parentId: string;
    current: number;
    total: number;
  };
}

export interface BudgetItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  companyId: string;
  customerId?: string;
  customerName: string;
  items: BudgetItem[];
  totalValue: number;
  discount: number;
  finalValue: number;
  status: 'OPEN' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  createdAt: string;
  validUntil: string;
  notes?: string;
  linkedOsId?: string; // Novo: Link para atualizar a OS original
}
