import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { Minus, Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '../ToastContext';

interface LogUsageModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (change: number, reason: string) => void;
  onRemove?: (itemId: string) => void;
  item: InventoryItem;
}

const LogUsageModal: React.FC<LogUsageModalProps> = ({ open, onClose, onSave, onRemove, item }) => {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [actionType, setActionType] = useState<'usage' | 'add' | 'remove'>('usage');
  const { showToast } = useToast();

  const commonReasons = [
    'Daily feeding',
    'Animal treatment',
    'Equipment maintenance',
    'Fence repair',
    'Emergency use',
    'Restocking',
    'Damaged/Expired',
    'Theft/Loss',
    'Other'
  ];

  useEffect(() => {
    if (open) {
      setAmount('');
      setReason('');
      setError('');
      setActionType('usage');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a valid amount greater than 0');
      return;
    }

    if (actionType === 'usage' && numAmount > item.quantity) {
      setError(`Cannot use more than available (${item.quantity} ${item.unit})`);
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setError('');
    
    // Calculate the change based on action type
    let change = 0;
    switch (actionType) {
      case 'usage':
        change = -numAmount;
        break;
      case 'add':
        change = numAmount;
        break;
      case 'remove':
        change = -numAmount;
        break;
    }
    
    try {
      onSave(change, reason.trim());
      showToast({ type: 'success', message: 'Usage logged.' });
      onClose();
    } catch (err) {
      showToast({ type: 'error', message: 'Failed to log usage.' });
    }
  };

  const handleQuickUsage = (quickAmount: number, quickReason: string) => {
    if (quickAmount > item.quantity) {
      setError(`Cannot use more than available (${item.quantity} ${item.unit})`);
      return;
    }
    onSave(-quickAmount, quickReason);
  };

  const handleRemoveItem = () => {
    if (onRemove && confirm(`Are you sure you want to completely remove "${item.name}" from inventory?`)) {
      onRemove(item.id);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Manage {item.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Item Info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 dark:text-white">{item.name}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              item.quantity <= (item.lowStockThreshold || 0) 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {item.quantity <= (item.lowStockThreshold || 0) ? 'Low Stock' : 'In Stock'}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <p><span className="font-medium">Current:</span> {item.quantity} {item.unit}</p>
            <p><span className="font-medium">Category:</span> {item.category}</p>
            {item.price && (
              <p><span className="font-medium">Value:</span> {(item.price * item.quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Action Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Action Type</label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActionType('usage')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                actionType === 'usage'
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Minus className="w-4 h-4 inline mr-1" />
              Use
            </button>
            <button
              type="button"
              onClick={() => setActionType('add')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                actionType === 'add'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add
            </button>
            <button
              type="button"
              onClick={() => setActionType('remove')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                actionType === 'remove'
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              <Trash2 className="w-4 h-4 inline mr-1" />
              Remove
            </button>
          </div>
        </div>

        {/* Quick Actions for Usage */}
        {actionType === 'usage' && item.quantity > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Quick Actions</label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 5, 10, 25].map(quickAmount => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => handleQuickUsage(quickAmount, 'Quick usage')}
                  disabled={quickAmount > item.quantity}
                  className="py-2 px-3 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use {quickAmount} {item.unit}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {actionType === 'usage' ? 'Amount to use' : actionType === 'add' ? 'Amount to add' : 'Amount to remove'}
            </label>
            <input 
              type="number" 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              value={amount} 
              min={1} 
              max={actionType === 'usage' ? item.quantity : undefined}
              onChange={e => setAmount(e.target.value)}
              placeholder={`Enter amount in ${item.unit}`}
            />
            {actionType === 'usage' && (
              <div className="text-xs text-gray-500 mt-1">Available: {item.quantity} {item.unit}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reason</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={reason}
              onChange={e => setReason(e.target.value)}
            >
              <option value="">Select a reason...</option>
              {commonReasons.map(reasonOption => (
                <option key={reasonOption} value={reasonOption}>{reasonOption}</option>
              ))}
            </select>
            {reason === 'Other' && (
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
                placeholder="Specify reason..."
                onChange={e => setReason(e.target.value)}
              />
            )}
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex space-x-2">
              <button 
                type="button" 
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500" 
                onClick={onClose}
              >
                Cancel
              </button>
              {onRemove && (
                <button 
                  type="button" 
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md shadow-sm hover:bg-red-50 dark:bg-gray-600 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-900" 
                  onClick={handleRemoveItem}
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Remove Item
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm ${
                actionType === 'usage' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : actionType === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionType === 'usage' ? 'Log Usage' : actionType === 'add' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogUsageModal; 