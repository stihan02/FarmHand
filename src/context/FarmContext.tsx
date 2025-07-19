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

export const FarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(farmReducer, initialState);
  const [isAddingInventory, setIsAddingInventory] = useState(false);

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
  const { user } = useAuth();

  // Firestore sync for animals, tasks, camps, events, inventory, transactions
  useEffect(() => {
    if (!user) return;
    // Listen for animals
    const animalsCol = collection(db, 'users', user.uid, 'animals');
    const unsubAnimals = onSnapshot(animalsCol, snapshot => {
      const animals: Animal[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Animal));
      console.log('Firestore animal listener received:', animals.length, 'animals');
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

  // Sync transaction changes to Firestore
  useEffect(() => {
    if (!user) return;
    const transactionsCol = collection(db, 'users', user.uid, 'transactions');
    
    // Get current transactions from Firestore to compare with local state
    getDocs(transactionsCol).then(snapshot => {
      const firestoreTransactionIds = snapshot.docs.map(doc => doc.id);
      const localTransactionIds = state.transactions.map(t => t.id);
      
      // Find transactions that exist in Firestore but not in local state (deleted)
      const deletedTransactionIds = firestoreTransactionIds.filter(id => !localTransactionIds.includes(id));
      
      // Delete transactions from Firestore that were removed locally
      deletedTransactionIds.forEach(async transactionId => {
        try {
          await deleteDoc(doc(transactionsCol, transactionId));
        } catch (error) {
          console.error('Error deleting transaction from Firestore:', error);
        }
      });
    });
    
    // Sync existing transactions
    state.transactions.forEach(async transaction => {
      if (transaction.id) {
        try {
          await setDoc(doc(transactionsCol, transaction.id), transaction);
        } catch (error) {
          console.error('Error syncing transaction to Firestore:', error);
        }
      }
    });
  }, [state.transactions, user]);

  // Sync task changes to Firestore
  useEffect(() => {
    if (!user) return;
    const tasksCol = collection(db, 'users', user.uid, 'tasks');
    
    // Get current tasks from Firestore to compare with local state
    getDocs(tasksCol).then(snapshot => {
      const firestoreTaskIds = snapshot.docs.map(doc => doc.id);
      const localTaskIds = state.tasks.map(t => t.id);
      
      // Find tasks that exist in Firestore but not in local state (deleted)
      const deletedTaskIds = firestoreTaskIds.filter(id => !localTaskIds.includes(id));
      
      // Delete tasks from Firestore that were removed locally
      deletedTaskIds.forEach(async taskId => {
        try {
          await deleteDoc(doc(tasksCol, taskId));
        } catch (error) {
          console.error('Error deleting task from Firestore:', error);
        }
      });
    });
    
    // Sync existing tasks
    state.tasks.forEach(async task => {
      if (task.id) {
        try {
          await setDoc(doc(tasksCol, task.id), task);
        } catch (error) {
          console.error('Error syncing task to Firestore:', error);
        }
      }
    });
  }, [state.tasks, user]);

  // Sync animal changes to Firestore
  useEffect(() => {
    if (!user) return;
    const animalsCol = collection(db, 'users', user.uid, 'animals');
    
    console.log('Animal sync effect triggered. Current animals:', state.animals.length);
    
    // Get current animals from Firestore to compare with local state
    getDocs(animalsCol).then(snapshot => {
      const firestoreAnimalIds = snapshot.docs.map(doc => doc.id);
      const localAnimalIds = state.animals.map(a => a.id);
      
      console.log('Firestore animal IDs:', firestoreAnimalIds);
      console.log('Local animal IDs:', localAnimalIds);
      
      // Find animals that exist in Firestore but not in local state (deleted)
      const deletedAnimalIds = firestoreAnimalIds.filter(id => !localAnimalIds.includes(id));
      
      console.log('Animals to delete from Firestore:', deletedAnimalIds);
      
      // Delete animals from Firestore that were removed locally
      deletedAnimalIds.forEach(async animalId => {
        try {
          await deleteDoc(doc(animalsCol, animalId));
          console.log('Deleted animal from Firestore:', animalId);
        } catch (error) {
          console.error('Error deleting animal from Firestore:', error);
        }
      });
    });
    
    // Sync existing animals
    const syncPromises = state.animals.map(async animal => {
      if (animal.id) {
        try {
          // Remove undefined fields
          const sanitizedAnimal = Object.fromEntries(
            Object.entries(animal).filter(([_, v]) => v !== undefined)
          );
          console.log('Syncing animal to Firestore:', animal.id);
          await setDoc(doc(animalsCol, animal.id), sanitizedAnimal);
          console.log('Successfully synced animal:', animal.id);
        } catch (error) {
          console.error(`Error syncing animal ${animal.id} to Firestore:`, error);
          // Could add retry logic here or user notification
        }
      }
    });
    
    // Wait for all sync operations to complete
    Promise.allSettled(syncPromises).then(results => {
      const failed = results.filter(result => result.status === 'rejected');
      if (failed.length > 0) {
        console.warn(`${failed.length} animal sync operations failed`);
      }
    });
  }, [state.animals, user]);

  // Sync camp changes to Firestore
  useEffect(() => {
    if (!user) return;
    const campsCol = collection(db, 'users', user.uid, 'camps');
    
    // Get current camps from Firestore to compare with local state
    getDocs(campsCol).then(snapshot => {
      const firestoreCampIds = snapshot.docs.map(doc => doc.id);
      const localCampIds = state.camps.map(c => c.id);
      
      // Find camps that exist in Firestore but not in local state (deleted)
      const deletedCampIds = firestoreCampIds.filter(id => !localCampIds.includes(id));
      
      // Delete camps from Firestore that were removed locally
      deletedCampIds.forEach(async campId => {
        try {
          await deleteDoc(doc(campsCol, campId));
        } catch (error) {
          console.error('Error deleting camp from Firestore:', error);
        }
      });
    });
    
    // Sync existing camps
    state.camps.forEach(async camp => {
      if (camp.id) {
        try {
          const sanitizedCamp = Object.fromEntries(
            Object.entries(camp).filter(([_, v]) => v !== undefined)
          );
          if (sanitizedCamp.geoJson) {
            console.log('Type of geoJson before save:', typeof sanitizedCamp.geoJson, sanitizedCamp.geoJson);
            sanitizedCamp.geoJson = JSON.stringify(sanitizedCamp.geoJson);
          }
          console.log('Saving camp to Firestore:', sanitizedCamp); // Debug log
          await setDoc(doc(campsCol, camp.id), sanitizedCamp);
        } catch (error) {
          console.error('Error syncing camp to Firestore:', error);
        }
      }
    });
  }, [state.camps, user]);

  // Sync event changes to Firestore
  useEffect(() => {
    if (!user) return;
    const eventsCol = collection(db, 'users', user.uid, 'events');
    state.events.forEach(async event => {
      if (event.id) {
        try {
          await setDoc(doc(eventsCol, event.id), event);
        } catch (error) {
          console.error('Error syncing event to Firestore:', error);
        }
      }
    });
  }, [state.events, user]);

  // Sync inventory changes to Firestore
  useEffect(() => {
    if (!user) return;
    const inventoryCol = collection(db, 'users', user.uid, 'inventory');
    
    // Get current inventory from Firestore to compare with local state
    getDocs(inventoryCol).then(snapshot => {
      const firestoreInventoryIds = snapshot.docs.map(doc => doc.id);
      const localInventoryIds = state.inventory.map(item => item.id);
      
      // Find inventory items that exist in Firestore but not in local state (deleted)
      const deletedInventoryIds = firestoreInventoryIds.filter(id => !localInventoryIds.includes(id));
      
      // Delete inventory items from Firestore that were removed locally
      deletedInventoryIds.forEach(async itemId => {
        try {
          await deleteDoc(doc(inventoryCol, itemId));
        } catch (error) {
          console.error('Error deleting inventory item from Firestore:', error);
        }
      });
    });
    
    // Sync existing inventory items
    state.inventory.forEach(async item => {
      if (item.id) {
        try {
          await setDoc(doc(inventoryCol, item.id), item);
        } catch (error) {
          console.error('Error syncing inventory item to Firestore:', error);
        }
      }
    });
  }, [state.inventory, user]);

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