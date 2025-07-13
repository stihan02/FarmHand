export interface WeightRecord {
  date: string;
  weight: number;
  notes?: string;
}

export interface Animal {
  id: string;
  type: string;
  breed?: string;
  sex: 'M' | 'F';
  tagNumber: string;
  tagColor: string;
  birthdate: string;
  campId?: string;
  position?: { lat: number; lng: number };
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
  weightRecords: WeightRecord[];
  history: HistoryEvent[];
  photoUrl?: string;
}

export interface GeneticInfo {
  traits: Record<string, string>;
  lineage: string[];
  notes: string;
  animalTagNumbers: string[];
  status?: 'Pending' | 'Completed';
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
  type: 'income' | 'expense';
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
  /** If true, this task is a reminder (not just a generic task) */
  reminder?: boolean;
  /** Animal IDs this reminder/task is related to */
  relatedAnimalIds?: string[];
  /** Group/camp this reminder/task is related to (e.g., 'cattle', 'camp-1') */
  relatedGroup?: string;
  /** Recurrence rule for reminders (for future extensibility) */
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  /** If snoozed, the new due date */
  snoozedUntil?: string;
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

export interface Camp {
  id: string;
  name: string;
  geoJson: {
    type: 'Feature';
    geometry: {
      type: 'Point' | 'Polygon';
      coordinates: number[] | number[][][]; // Point: [lng, lat], Polygon: [[[lng, lat], ...]]
    };
  };
  animals: Animal[];
  recommendedStockingRates?: {
    LSU?: number;
    SSU?: number;
    [key: string]: number | undefined;
  }; // e.g., { LSU: 0.1, SSU: 0.5 }
}

export interface FarmState {
  animals: Animal[];
  transactions: Transaction[];
  tasks: Task[];
  events: Event[];
  camps: Camp[];
  stats: {
    active: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    pendingTasks: number;
  };
}

export type FarmAction =
  | { type: 'ADD_ANIMAL'; payload: Animal }
  | { type: 'ADD_ANIMALS'; payload: Animal[] }
  | { type: 'UPDATE_ANIMAL'; payload: Animal }
  | { type: 'DELETE_ANIMAL'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'ADD_CAMP'; payload: Camp }
  | { type: 'UPDATE_CAMP'; payload: Camp }
  | { type: 'DELETE_CAMP'; payload: string }
  | { type: 'SET_STATS'; payload: FarmState['stats'] };

export interface InventoryItem {
  id: string;
  name: string;
  category: 'medicine' | 'feed' | 'fencing' | 'equipment' | 'other';
  quantity: number;
  unit: string;
  expiryDate?: string;
  supplier?: string;
  lastUsed?: string;
  history: { date: string; change: number; reason: string }[];
  lowStockThreshold?: number;
  notes?: string;
  price?: number;
}