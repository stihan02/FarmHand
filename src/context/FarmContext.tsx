import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Animal, Transaction, Task, FarmData, Stats, Event } from '../types';

interface FarmState extends FarmData {
  stats: Stats;
  events: Event[];
  camps: string[]; // list of camp names
}

type FarmAction =
  | { type: 'ADD_ANIMAL'; payload: Animal }
  | { type: 'UPDATE_ANIMAL'; payload: Animal }
  | { type: 'BULK_UPDATE_ANIMALS_CAMP'; payload: { animalIds: string[], camp: string } }
  | { type: 'REMOVE_ANIMAL'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'REMOVE_EVENT'; payload: string }
  | { type: 'LOAD_DATA'; payload: FarmData & { events?: Event[], camps?: string[] } }
  | { type: 'ADD_CAMP'; payload: string }
  | { type: 'RENAME_CAMP'; payload: { oldName: string, newName: string } }
  | { type: 'DELETE_CAMP'; payload: string };

const calculateStats = (animals: Animal[], transactions: Transaction[], tasks: Task[]): Stats => {
  const active = animals.filter(a => a.status === 'Active').length;
  const sold = animals.filter(a => a.status === 'Sold').length;
  const deceased = animals.filter(a => a.status === 'Deceased').length;
  
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpenses;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  return { active, sold, deceased, totalIncome, totalExpenses, balance, pendingTasks };
};

const farmReducer = (state: FarmState, action: FarmAction): FarmState => {
  let newState: FarmState;
  
  switch (action.type) {
    case 'ADD_ANIMAL':
      newState = {
        ...state,
        animals: [...state.animals, action.payload],
        stats: calculateStats([...state.animals, action.payload], state.transactions, state.tasks)
      };
      break;
    case 'UPDATE_ANIMAL':
      newState = {
        ...state,
        animals: state.animals.map(a => a.id === action.payload.id ? action.payload : a),
        stats: calculateStats(
          state.animals.map(a => a.id === action.payload.id ? action.payload : a),
          state.transactions,
          state.tasks
        )
      };
      break;
    case 'BULK_UPDATE_ANIMALS_CAMP':
      newState = {
        ...state,
        animals: state.animals.map(animal =>
          action.payload.animalIds.includes(animal.id)
            ? { ...animal, camp: action.payload.camp }
            : animal
        )
      };
      break;
    case 'REMOVE_ANIMAL':
      newState = {
        ...state,
        animals: state.animals.filter(a => a.id !== action.payload),
        stats: calculateStats(
          state.animals.filter(a => a.id !== action.payload),
          state.transactions,
          state.tasks
        )
      };
      break;
    case 'ADD_TRANSACTION':
      newState = {
        ...state,
        transactions: [...state.transactions, action.payload],
        stats: calculateStats(state.animals, [...state.transactions, action.payload], state.tasks)
      };
      break;
    case 'REMOVE_TRANSACTION':
      newState = {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
        stats: calculateStats(
          state.animals,
          state.transactions.filter(t => t.id !== action.payload),
          state.tasks
        )
      };
      break;
    case 'ADD_TASK':
      newState = {
        ...state,
        tasks: [...state.tasks, action.payload],
        stats: calculateStats(state.animals, state.transactions, [...state.tasks, action.payload])
      };
      break;
    case 'UPDATE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.map(t => t.id === action.payload.id ? action.payload : t),
        stats: calculateStats(
          state.animals,
          state.transactions,
          state.tasks.map(t => t.id === action.payload.id ? action.payload : t)
        )
      };
      break;
    case 'REMOVE_TASK':
      newState = {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        stats: calculateStats(
          state.animals,
          state.transactions,
          state.tasks.filter(t => t.id !== action.payload)
        )
      };
      break;
    case 'ADD_EVENT':
      newState = {
        ...state,
        events: [...(state.events || []), action.payload]
      };
      break;
    case 'UPDATE_EVENT':
      newState = {
        ...state,
        events: state.events.map(e => e.id === action.payload.id ? action.payload : e)
      };
      break;
    case 'REMOVE_EVENT':
      newState = {
        ...state,
        events: state.events.filter(e => e.id !== action.payload)
      };
      break;
    case 'ADD_CAMP':
      if (state.camps.includes(action.payload)) return state;
      newState = { ...state, camps: [...state.camps, action.payload] };
      break;
    case 'RENAME_CAMP':
      newState = {
        ...state,
        camps: state.camps.map(c => c === action.payload.oldName ? action.payload.newName : c),
        animals: state.animals.map(a => a.camp === action.payload.oldName ? { ...a, camp: action.payload.newName } : a)
      };
      break;
    case 'DELETE_CAMP':
      const updatedCamps = state.camps.filter(c => c !== action.payload);
      newState = {
        ...state,
        camps: updatedCamps,
        animals: state.animals.map(a => 
          a.camp === action.payload ? { ...a, camp: updatedCamps[0] || '' } : a
        )
      };
      break;
    case 'LOAD_DATA':
      newState = {
        ...action.payload,
        events: action.payload.events || [],
        camps: action.payload.camps || ['Main Camp'],
        stats: calculateStats(action.payload.animals, action.payload.transactions, action.payload.tasks)
      };
      break;
    default:
      return state;
  }

  // Save to localStorage
  localStorage.setItem('farmData', JSON.stringify({
    animals: newState.animals,
    transactions: newState.transactions,
    tasks: newState.tasks,
    events: newState.events,
    camps: newState.camps
  }));

  return newState;
};

const initialState: FarmState = {
  animals: [],
  transactions: [],
  tasks: [],
  stats: { active: 0, sold: 0, deceased: 0, totalIncome: 0, totalExpenses: 0, balance: 0, pendingTasks: 0 },
  events: [],
  camps: ['Main Camp']
};

const FarmContext = createContext<{
  state: FarmState;
  dispatch: React.Dispatch<FarmAction>;
} | null>(null);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('farmData');
    if (savedData) {
      try {
        const farmData: FarmData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: farmData });
      } catch (error) {
        console.error('Error loading farm data:', error);
      }
    }
  }, []);

  return (
    <FarmContext.Provider value={{ state, dispatch }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};