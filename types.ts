
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
  stateRegistration?: string;
  municipalRegistration?: string;
  fiscalRegime?: 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
  logo?: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: CompanyStatus;
  currency: string;
  taxRate: number;
  serviceFeeRate: number;
  profileCompleted: boolean;
  pixType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
  pixKey?: string;
  creditCardFee?: number; 
  debitCardFee?: number;  
  adminEmail?: string; 
  address?: string; 
  phone?: string; 
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone?: string;
  document?: string; // CPF
  role: UserRole;
  password?: string;
  active: boolean;
  createdAt: string;
}

export enum OSStatus {
  AWAITING = 'AWAITING',
  IN_ANALYSIS = 'IN_ANALYSIS',
  BUDGET_PENDING = 'BUDGET_PENDING',
  WAITING_PARTS = 'WAITING_PARTS',
  IN_REPAIR = 'IN_REPAIR',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OSChecklist {
  power: 'YES' | 'NO' | 'NOT_TESTED';
  functionality: 'YES' | 'NO' | 'NOT_TESTED';
  physicalState: 'YES' | 'NO' | 'NOT_TESTED';
  safety: 'YES' | 'NO' | 'NOT_TESTED';
  cleaning: 'YES' | 'NO' | 'NOT_TESTED';
  accessories: 'YES' | 'NO' | 'NOT_TESTED';
}

export interface ServiceOrder {
  id: string;
  companyId: string; 
  customerId: string;
  customerName: string;
  phone?: string;
  equipment: string; 
  category?: string;
  serialNumber?: string; 
  accessCode?: string; 
  accessories?: string; 
  defect: string;
  status: OSStatus;
  price: number;
  discount?: number;
  observations?: string;
  itemCondition?: string; 
  date: string;
  technicianId?: string;
  technicianName?: string;
  openedById?: string; // Rastreabilidade
  checklist?: OSChecklist;
}

export interface Product {
  id: string;
  companyId: string; 
  name: string;
  category: string;
  sku: string;
  stock?: number;
  minStock?: number;
  costPrice: number;
  salePrice: number;
  type: 'PHYSICAL' | 'SERVICE';
  active: boolean;
}

export interface Customer {
  id: string;
  companyId: string; 
  name: string;
  taxId: string; // CPF/CNPJ
  email: string;
  phone: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  // Added status field to fix error in pages/Customers.tsx
  status?: string;
}

export interface Transaction {
  id: string;
  companyId: string; 
  type: 'INCOME' | 'EXPENSE';
  description: string;
  amount: number;
  date: string;
  paymentDate?: string;
  status: 'PAID' | 'PENDING';
  category?: string;
  method?: string;
  userId?: string; // Quem gerou o lançamento
}

// Added FinanceCategory interface to fix error in pages/Finance.tsx
export interface FinanceCategory {
  id: string;
  companyId: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

// Added BudgetItem interface to fix error in pages/Budgets.tsx
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
  // Added customerId field to fix error in pages/Budgets.tsx
  customerId?: string;
  customerName: string;
  // Updated items type to BudgetItem[] to fix error in pages/Budgets.tsx
  items: BudgetItem[];
  totalValue: number;
  // Added discount field to fix error in pages/Budgets.tsx
  discount?: number;
  // Added finalValue field to fix error in pages/Budgets.tsx
  finalValue: number;
  status: 'OPEN' | 'APPROVED' | 'REJECTED' | 'CONVERTED';
  createdAt: string;
  // Added validUntil field to fix error in pages/Budgets.tsx
  validUntil?: string;
  // Added notes field to fix error in pages/Budgets.tsx
  notes?: string;
  linkedOsId?: string; 
}
