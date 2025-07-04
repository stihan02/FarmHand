import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Animal, Transaction, Task, Stats, Event, Camp, FarmData, InventoryItem } from '../types';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

interface FarmState {
  animals: Animal[];
  transactions: Transaction[];
  tasks: Task[];
  stats: Stats;
  events: Event[];
  camps: Camp[];
  inventory: InventoryItem[];
}

type FarmAction =
  | { type: 'ADD_ANIMAL'; payload: Animal }
  | { type: 'UPDATE_ANIMAL'; payload: Animal }
  | { type: 'BULK_UPDATE_ANIMALS_CAMP'; payload: { animalIds: string[], campId?: string } }
  | { type: 'REMOVE_ANIMAL'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'REMOVE_TRANSACTION'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'REMOVE_TASK'; payload: string }
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'REMOVE_EVENT'; payload: string }
  | { type: 'ADD_CAMP'; payload: Camp }
  | { type: 'UPDATE_CAMP'; payload: Camp }
  | { type: 'DELETE_CAMP'; payload: string }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'REMOVE_INVENTORY_ITEM'; payload: string }
  | { type: 'LOG_INVENTORY_USAGE'; payload: { id: string; change: number; reason: string } }
  | { type: 'SET_ANIMALS'; payload: Animal[] }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_CAMPS'; payload: Camp[] }
  | { type: 'SET_EVENTS'; payload: Event[] }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] };

const calculateStats = (animals: Animal[], transactions: Transaction[], tasks: Task[]): Stats => {
  const active = animals.filter(a => a.status === 'Active').length;
  const sold = animals.filter(a => a.status === 'Sold').length;
  const deceased = animals.filter(a => a.status === 'Deceased').length;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
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
        animals: state.animals.map(animal => {
          if (action.payload.animalIds.includes(animal.id)) {
            const prevCamp = animal.campId || 'Unassigned';
            const newCamp = action.payload.campId || 'Unassigned';
            // Only add history if the camp is actually changing
            if (prevCamp !== newCamp) {
              return {
                ...animal,
                campId: action.payload.campId,
                history: [
                  ...animal.history,
                  {
                    date: new Date().toISOString(),
                    description: `Moved from camp ${prevCamp} to ${newCamp}`
                  }
                ]
              };
            } else {
              return animal;
            }
          } else {
            return animal;
          }
        })
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
      if (state.camps.some(c => c.id === action.payload.id)) return state;
      newState = { ...state, camps: [...state.camps, action.payload] };
      break;
    case 'UPDATE_CAMP':
      newState = {
        ...state,
        camps: state.camps.map(c => c.id === action.payload.id ? action.payload : c)
      };
      console.log('Camps after UPDATE_CAMP:', newState.camps);
      break;
    case 'DELETE_CAMP':
      const updatedCamps = state.camps.filter(c => c.id !== action.payload);
      const newDefaultCampId = updatedCamps.length > 0 ? updatedCamps[0].id : undefined;
      newState = {
        ...state,
        camps: updatedCamps,
        animals: state.animals.map(a =>
          a.campId === action.payload ? { ...a, campId: newDefaultCampId } : a
        )
      };
      break;
    case 'ADD_INVENTORY_ITEM':
      newState = {
        ...state,
        inventory: [...state.inventory, action.payload],
      };
      break;
    case 'UPDATE_INVENTORY_ITEM':
      newState = {
        ...state,
        inventory: state.inventory.map(item => item.id === action.payload.id ? action.payload : item),
      };
      break;
    case 'REMOVE_INVENTORY_ITEM':
      newState = {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
      };
      break;
    case 'LOG_INVENTORY_USAGE':
      newState = {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id
            ? {
                ...item,
                quantity: item.quantity + action.payload.change,
                lastUsed: new Date().toISOString(),
                history: [
                  ...item.history,
                  {
                    date: new Date().toISOString(),
                    change: action.payload.change,
                    reason: action.payload.reason,
                  },
                ],
              }
            : item
        ),
      };
      break;
    case 'SET_ANIMALS':
      newState = {
        ...state,
        animals: action.payload,
        stats: calculateStats(action.payload, state.transactions, state.tasks),
      };
      break;
    case 'SET_TASKS':
      newState = {
        ...state,
        tasks: action.payload,
        stats: calculateStats(state.animals, state.transactions, action.payload),
      };
      break;
    case 'SET_CAMPS':
      newState = {
        ...state,
        camps: action.payload,
      };
      break;
    case 'SET_EVENTS':
      newState = {
        ...state,
        events: action.payload,
      };
      break;
    case 'SET_INVENTORY':
      newState = {
        ...state,
        inventory: action.payload,
      };
      break;
    case 'SET_TRANSACTIONS':
      newState = {
        ...state,
        transactions: action.payload,
        stats: calculateStats(state.animals, action.payload, state.tasks),
      };
      break;
    default:
      return state;
  }

  return newState;
};

const initialState: FarmState = {
  animals: [],
  transactions: [],
  tasks: [],
  stats: { active: 0, sold: 0, deceased: 0, totalIncome: 0, totalExpenses: 0, balance: 0, pendingTasks: 0 },
  events: [],
  camps: [],
  inventory: [],
};

const FarmContext = createContext<{
  state: FarmState;
  dispatch: React.Dispatch<FarmAction>;
} | null>(null);

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);
  const { user } = useAuth();

  // Firestore sync for animals, tasks, camps, events, inventory, transactions
  useEffect(() => {
    if (!user) return;
    // Listen for animals
    const animalsCol = collection(db, 'users', user.uid, 'animals');
    const unsubAnimals = onSnapshot(animalsCol, snapshot => {
      const animals: Animal[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Animal));
      dispatch({ type: 'SET_ANIMALS', payload: animals });
    });
    // Listen for tasks
    const tasksCol = collection(db, 'users', user.uid, 'tasks');
    const unsubTasks = onSnapshot(tasksCol, snapshot => {
      const tasks: Task[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
      dispatch({ type: 'SET_TASKS', payload: tasks });
    });
    // Listen for camps
    const campsCol = collection(db, 'users', user.uid, 'camps');
    const unsubCamps = onSnapshot(campsCol, snapshot => {
      const camps: Camp[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Camp));
      dispatch({ type: 'SET_CAMPS', payload: camps });
    });
    // Listen for events
    const eventsCol = collection(db, 'users', user.uid, 'events');
    const unsubEvents = onSnapshot(eventsCol, snapshot => {
      const events: Event[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Event));
      dispatch({ type: 'SET_EVENTS', payload: events });
    });
    // Listen for inventory
    const inventoryCol = collection(db, 'users', user.uid, 'inventory');
    const unsubInventory = onSnapshot(inventoryCol, snapshot => {
      const inventory: InventoryItem[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
      dispatch({ type: 'SET_INVENTORY', payload: inventory });
    });
    // Listen for transactions
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    const unsubTransactions = onSnapshot(transactionsCol, snapshot => {
      const transactions: Transaction[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
    });
    return () => {
      unsubAnimals();
      unsubTasks();
      unsubCamps();
      unsubEvents();
      unsubInventory();
      unsubTransactions();
    };
    // eslint-disable-next-line
  }, [user]);

  // Sync animal changes to Firestore
  useEffect(() => {
    if (!user) return;
    const animalsCol = collection(db, 'users', user.uid, 'animals');
    state.animals.forEach(async animal => {
      if (animal.id) {
        // Remove undefined fields
        const sanitizedAnimal = Object.fromEntries(
          Object.entries(animal).filter(([_, v]) => v !== undefined)
        );
        await setDoc(doc(animalsCol, animal.id), sanitizedAnimal);
      }
    });
  }, [state.animals, user]);

  // Sync task changes to Firestore
  useEffect(() => {
    if (!user) return;
    const tasksCol = collection(db, 'users', user.uid, 'tasks');
    state.tasks.forEach(async task => {
      if (task.id) {
        await setDoc(doc(tasksCol, task.id), task);
      }
    });
  }, [state.tasks, user]);

  // Sync camp changes to Firestore
  useEffect(() => {
    if (!user) return;
    const campsCol = collection(db, 'users', user.uid, 'camps');
    state.camps.forEach(async camp => {
      if (camp.id) {
        const sanitizedCamp = Object.fromEntries(
          Object.entries(camp).filter(([_, v]) => v !== undefined)
        );
        await setDoc(doc(campsCol, camp.id), sanitizedCamp);
      }
    });
  }, [state.camps, user]);

  // Sync event changes to Firestore
  useEffect(() => {
    if (!user) return;
    const eventsCol = collection(db, 'users', user.uid, 'events');
    state.events.forEach(async event => {
      if (event.id) {
        await setDoc(doc(eventsCol, event.id), event);
      }
    });
  }, [state.events, user]);

  // Sync inventory changes to Firestore
  useEffect(() => {
    if (!user) return;
    const inventoryCol = collection(db, 'users', user.uid, 'inventory');
    state.inventory.forEach(async item => {
      if (item.id) {
        await setDoc(doc(inventoryCol, item.id), item);
      }
    });
  }, [state.inventory, user]);

  // Sync transaction changes to Firestore
  useEffect(() => {
    if (!user) return;
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    state.transactions.forEach(async transaction => {
      if (transaction.id) {
        await setDoc(doc(transactionsCol, transaction.id), transaction);
      }
    });
  }, [state.transactions, user]);

  // Keep other data in localStorage as before
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmData', JSON.stringify({
        transactions: state.transactions,
        events: state.events,
        camps: state.camps,
        inventory: state.inventory,
      }));
    }
  }, [state.transactions, state.events, state.camps, state.inventory]);

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