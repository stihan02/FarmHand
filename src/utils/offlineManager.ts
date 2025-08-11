import { Animal, Transaction, Task, Camp, InventoryItem } from '../types';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface OfflineAction {
  id: string;
  type: 'ADD' | 'UPDATE' | 'DELETE';
  entity: 'animal' | 'transaction' | 'task' | 'camp' | 'inventory';
  data: any;
  timestamp: number;
}

class OfflineManager {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'HerdWiseOffline';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('offlineActions')) {
          const actionStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
          actionStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('cachedData')) {
          const dataStore = db.createObjectStore('cachedData', { keyPath: 'key' });
        }
      };
    });
  }

  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.init();

    const fullAction: OfflineAction = {
      ...action,
      id: `${action.type}_${action.entity}_${Date.now()}_${Math.random()}`,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.add(fullAction);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineActions(): Promise<OfflineAction[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearOfflineActions(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cacheData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.put({ key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readonly');
      const store = transaction.objectStore('cachedData');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cachedData'], 'readwrite');
      const store = transaction.objectStore('cachedData');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Check if we're online
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Listen for online/offline events
  onOnline(callback: () => void): void {
    window.addEventListener('online', callback);
  }

  onOffline(callback: () => void): void {
    window.addEventListener('offline', callback);
  }

  // Sync offline data when connection is restored
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) return;

    const actions = await this.getOfflineActions();
    if (actions.length === 0) return;

    console.log(`Syncing ${actions.length} offline actions`);

    // Process actions in order
    for (const action of actions.sort((a, b) => a.timestamp - b.timestamp)) {
      try {
        await this.processOfflineAction(action);
      } catch (error) {
        console.error('Error processing offline action:', error);
        // Continue with other actions
      }
    }

    // Clear processed actions
    await this.clearOfflineActions();
  }

  private async processOfflineAction(action: OfflineAction): Promise<void> {
    // Temporarily disable camp syncing due to Firestore nested array issue
    if (action.entity === 'camp') {
      console.log(`[SYNC SKIPPED] Camp sync disabled: ${action.type} ${action.entity} ${action.data.id}`);
      return;
    }
    
    // Map entity to Firestore collection name
    const entityToCollection: Record<string, string> = {
      animal: 'animals',
      transaction: 'transactions',
      task: 'tasks',
      camp: 'camps',
      inventory: 'inventory',
    };
    // Assume userId is stored in localStorage (or get from auth context if available)
    const userId = localStorage.getItem('userId');
    if (!userId) throw new Error('No userId found for Firestore sync');
    const colName = entityToCollection[action.entity];
    if (!colName) throw new Error('Unknown entity type: ' + action.entity);
    const colRef = collection(db, 'users', userId, colName);
    try {
      if (action.type === 'ADD' || action.type === 'UPDATE') {
        // Remove undefined fields
        const sanitized = Object.fromEntries(Object.entries(action.data).filter(([_, v]) => v !== undefined));
        await setDoc(doc(colRef, action.data.id), sanitized);
        console.log(`[SYNC] ${action.type} ${action.entity} ${action.data.id} to Firestore`);
      } else if (action.type === 'DELETE') {
        await deleteDoc(doc(colRef, action.data.id));
        console.log(`[SYNC] DELETE ${action.entity} ${action.data.id} from Firestore`);
      }
    } catch (error) {
      console.error(`[SYNC ERROR] ${action.type} ${action.entity} ${action.data.id}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
export const offlineManager = new OfflineManager();

// Initialize when the module is loaded
offlineManager.init().catch(console.error);

// Set up online/offline listeners
offlineManager.onOnline(() => {
  console.log('Connection restored, syncing offline data...');
  offlineManager.syncOfflineData();
});

offlineManager.onOffline(() => {
  console.log('Connection lost, switching to offline mode');
});

export default offlineManager; 