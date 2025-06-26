import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';

interface LogUsageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (change: number, reason: string) => void;
  item: InventoryItem;
}

const LogUsageModal: React.FC<LogUsageModalProps> = ({ open, onClose, onSave, item }) => {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setAmount('');
      setReason('');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0 || numAmount > item.quantity) {
      setError('Enter a valid amount (1 to ' + item.quantity + ')');
      return;
    }
    setError('');
    onSave(-numAmount, reason.trim());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl w-full max-w-sm">
        <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Log Usage for {item.name}</h2>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1.5 rounded mb-2 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm font-medium mb-1">Amount used</label>
            <input type="number" className="w-full border rounded px-3 py-2" value={amount} min={1} max={item.quantity} onChange={e => setAmount(e.target.value)} />
            <div className="text-xs text-gray-500 mt-1">Available: {item.quantity} {item.unit}</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={reason} onChange={e => setReason(e.target.value)} />
          </div>
          <div className="flex justify-end pt-2">
            <button type="button" className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">Log Usage</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogUsageModal; 