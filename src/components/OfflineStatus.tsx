import React, { useEffect, useState } from 'react';
import offlineManager from '../utils/offlineManager';

const OfflineStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let syncingTimeout: NodeJS.Timeout;
    const checkPending = async () => {
      const actions = await offlineManager.getOfflineActions();
      setPending(actions.length > 0);
      if (isOnline && actions.length > 0) {
        setSyncing(true);
        // Wait for sync to finish
        offlineManager.syncOfflineData().then(() => {
          setSyncing(false);
          setPending(false);
        });
      } else {
        setSyncing(false);
      }
    };
    checkPending();
    // Optionally poll for changes
    syncingTimeout = setInterval(checkPending, 3000);
    return () => clearInterval(syncingTimeout);
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center bg-white border border-red-200 rounded-full px-3 py-1 shadow text-xs text-red-600 font-semibold gap-2">
        <span className="h-2 w-2 bg-red-500 rounded-full inline-block animate-pulse" />
        Offline
      </div>
    );
  }
  if (syncing) {
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center bg-white border border-emerald-200 rounded-full px-3 py-1 shadow text-xs text-emerald-600 font-semibold gap-2">
        <svg className="animate-spin h-3 w-3 text-emerald-500" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
        Syncing...
      </div>
    );
  }
  if (pending) {
    return (
      <div className="fixed top-3 right-3 z-50 flex items-center bg-white border border-yellow-200 rounded-full px-3 py-1 shadow text-xs text-yellow-600 font-semibold gap-2">
        <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block animate-pulse" />
        Pending Sync
      </div>
    );
  }
  return null;
};

export default OfflineStatus; 