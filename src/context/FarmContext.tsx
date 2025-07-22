import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { Animal, Transaction, Task, Stats, Event, Camp, FarmData, InventoryItem, WeightRecord } from '../types';
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
import offlineManager from '../utils/offlineManager';
import type { OfflineAction } from '../types';

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
  | { type: 'DELETE_ANIMAL'; payload: string }
  | { type: 'ADD_WEIGHT_RECORD'; payload: { animalId: string; weightRecord: WeightRecord } }
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
    case 'DELETE_ANIMAL':
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
    case 'ADD_WEIGHT_RECORD':
      newState = {
        ...state,
        animals: state.animals.map(animal => 
          animal.id === action.payload.animalId
            ? { ...animal, weightRecords: [...(animal.weightRecords || []), action.payload.weightRecord] }
            : animal
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

// Helper to check online status
const isOnline = () => navigator.onLine;

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const { user } = useAuth();

  // Set userId for offlineManager sync
  useEffect(() => {
    if (user?.uid) {
      localStorage.setItem('userId', user.uid);
    }
  }, [user]);

  // On app load, if offline, load cached data
  useEffect(() => {
    if (!isOnline()) {
      (async () => {
        const animals = await offlineManager.getCachedData('animals') || [];
        const tasks = await offlineManager.getCachedData('tasks') || [];
        const camps = await offlineManager.getCachedData('camps') || [];
        const events = await offlineManager.getCachedData('events') || [];
        const inventory = await offlineManager.getCachedData('inventory') || [];
        const transactions = await offlineManager.getCachedData('transactions') || [];
        dispatch({ type: 'SET_ANIMALS', payload: animals });
        dispatch({ type: 'SET_TASKS', payload: tasks });
        dispatch({ type: 'SET_CAMPS', payload: camps });
        dispatch({ type: 'SET_EVENTS', payload: events });
        dispatch({ type: 'SET_INVENTORY', payload: inventory });
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      })();
    }
  }, []);

  // After fetching from Firestore, cache data for offline use
  useEffect(() => {
    if (isOnline()) {
      offlineManager.cacheData('animals', state.animals);
      offlineManager.cacheData('tasks', state.tasks);
      offlineManager.cacheData('camps', state.camps);
      offlineManager.cacheData('events', state.events);
      offlineManager.cacheData('inventory', state.inventory);
      offlineManager.cacheData('transactions', state.transactions);
    }
  }, [state.animals, state.tasks, state.camps, state.events, state.inventory, state.transactions]);

  // Migrate existing animals to include weightRecords property
  useEffect(() => {
    const needsMigration = state.animals.some(animal => !animal.weightRecords);
    if (needsMigration) {
      const migratedAnimals = state.animals.map(animal => ({
        ...animal,
        weightRecords: animal.weightRecords || []
      }));
      dispatch({ type: 'SET_ANIMALS', payload: migratedAnimals });
    }
  }, [state.animals]);

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
      const camps: Camp[] = snapshot.docs.map(doc => {
        const data = doc.data();
        if (typeof data.geoJson === 'string') {
          data.geoJson = JSON.parse(data.geoJson);
        }
        return { ...data, id: doc.id } as Camp;
      });
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
      if (!isAddingInventory) {
        const inventory: InventoryItem[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as InventoryItem));
        dispatch({ type: 'SET_INVENTORY', payload: inventory });
      }
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

  // Track inventory additions to prevent Firestore overwrites
  useEffect(() => {
    if (state.inventory.length > 0) {
      const lastItem = state.inventory[state.inventory.length - 1];
      if (lastItem && lastItem.history && lastItem.history.length > 0) {
        const lastHistoryItem = lastItem.history[lastItem.history.length - 1];
        if (lastHistoryItem.reason === 'Initial stock') {
          setIsAddingInventory(true);
          setTimeout(() => setIsAddingInventory(false), 2000);
        }
      }
    }
  }, [state.inventory]);

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

  // Helper to update cache after every change
  const updateCache = (state: FarmState) => {
    offlineManager.cacheData('animals', state.animals);
    offlineManager.cacheData('tasks', state.tasks);
    offlineManager.cacheData('camps', state.camps);
    offlineManager.cacheData('events', state.events);
    offlineManager.cacheData('inventory', state.inventory);
    offlineManager.cacheData('transactions', state.transactions);
  };

  // Wrap dispatch to always update cache and queue offline actions
  const wrappedDispatch = (action: FarmAction) => {
    dispatch(action);
    setTimeout(() => {
      updateCache({ ...state });
      if (!isOnline()) {
        let offlineAction: Omit<OfflineAction, 'id' | 'timestamp'> | null = null;
        switch (action.type) {
          case 'ADD_ANIMAL':
            offlineAction = { type: 'ADD', entity: 'animal', data: action.payload };
            break;
          case 'UPDATE_ANIMAL':
            offlineAction = { type: 'UPDATE', entity: 'animal', data: action.payload };
            break;
          case 'REMOVE_ANIMAL':
          case 'DELETE_ANIMAL':
            offlineAction = { type: 'DELETE', entity: 'animal', data: { id: action.payload } };
            break;
          case 'ADD_TRANSACTION':
            offlineAction = { type: 'ADD', entity: 'transaction', data: action.payload };
            break;
          case 'REMOVE_TRANSACTION':
            offlineAction = { type: 'DELETE', entity: 'transaction', data: { id: action.payload } };
            break;
          case 'ADD_TASK':
            offlineAction = { type: 'ADD', entity: 'task', data: action.payload };
            break;
          case 'UPDATE_TASK':
            offlineAction = { type: 'UPDATE', entity: 'task', data: action.payload };
            break;
          case 'REMOVE_TASK':
            offlineAction = { type: 'DELETE', entity: 'task', data: { id: action.payload } };
            break;
          case 'ADD_CAMP':
            offlineAction = { type: 'ADD', entity: 'camp', data: action.payload };
            break;
          case 'UPDATE_CAMP':
            offlineAction = { type: 'UPDATE', entity: 'camp', data: action.payload };
            break;
          case 'DELETE_CAMP':
            offlineAction = { type: 'DELETE', entity: 'camp', data: { id: action.payload } };
            break;
          case 'ADD_INVENTORY_ITEM':
            offlineAction = { type: 'ADD', entity: 'inventory', data: action.payload };
            break;
          case 'UPDATE_INVENTORY_ITEM':
            offlineAction = { type: 'UPDATE', entity: 'inventory', data: action.payload };
            break;
          case 'REMOVE_INVENTORY_ITEM':
            offlineAction = { type: 'DELETE', entity: 'inventory', data: { id: action.payload } };
            break;
          default:
            break;
        }
        if (offlineAction) {
          offlineManager.addOfflineAction(offlineAction).catch(console.error);
        }
      }
    }, 0);
  };

  return (
    <FarmContext.Provider value={{ state, dispatch: wrappedDispatch }}>
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