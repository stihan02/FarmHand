export interface Animal {
  id: string;
  type: string;
  breed?: string;
  sex: 'M' | 'F';
  tagNumber: string;
  tagColor: string;
  birthdate: string;
  camp: string;
  status: 'Active' | 'Sold' | 'Deceased';
  salePrice?: number;
  saleDate?: string;
  deceasedReason?: string;
  deceasedDate?: string;
  motherTag?: string;
  fatherTag?: string;
  offspringTags: string[];
  genetics: GeneticInfo;
  health: HealthRecord[];
  history: HistoryEvent[];
}

export interface GeneticInfo {
  traits: Record<string, string>;
  lineage: string[];
  notes: string;
}

export interface HealthRecord {
  date: string;
  type: 'Vaccination' | 'Treatment' | 'Check-up' | 'Other';
  description: string;
  performer: string;
  nextScheduledDate?: string;
}

export interface HistoryEvent {
  date: string;
  description: string;
}

export interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  description: string;
  amount: number;
  date: string;
  location?: string;
}

export interface Task {
  id: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
}

export interface FarmData {
  animals: Animal[];
  transactions: Transaction[];
  tasks: Task[];
}

export interface Stats {
  active: number;
  sold: number;
  deceased: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingTasks: number;
}

export interface Event {
  id: string;
  type: string;
  date: string; // ISO date string
  notes?: string;
  animalTagNumbers: string[];
  status?: 'Pending' | 'Completed';
}