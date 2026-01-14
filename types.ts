
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
  AWAITING = 'AWAITING',
  IN_ANALYSIS = 'IN_ANALYSIS',
  WAITING_PARTS = 'WAITING_PARTS',
  IN_REPAIR = 'IN_REPAIR',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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
}
