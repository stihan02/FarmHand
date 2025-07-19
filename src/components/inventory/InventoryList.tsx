import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { InventoryItem } from '../../types';
import AddEditInventoryModal from './AddEditInventoryModal';
import { v4 as uuidv4 } from 'uuid';
import LogUsageModal from './LogUsageModal';
import { Plus, Edit, Trash2, Package, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const categoryLabels: Record<InventoryItem['category'], string> = {
  medicine: 'Medicine',
  feed: 'Feed',
  fencing: 'Fencing',
  equipment: 'Equipment',
  other: 'Other',
};

function isLowStock(item: InventoryItem): boolean {
  if (typeof item.lowStockThreshold === 'number') {
    return item.quantity <= item.lowStockThreshold;
  }
  return item.quantity <= 0;
}

const InventoryList: React.FC = () => {
  const { state, dispatch } = useFarm();
  const inventory = state.inventory;
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const handleAddSave = (item: Omit<InventoryItem, 'id' | 'history' | 'lastUsed'>) => {
    const inventoryItem = {
      ...item,
      id: uuidv4(),
      history: [{ date: new Date().toISOString(), change: item.quantity, reason: 'Initial stock' }],
    };
    
    dispatch({
      type: 'ADD_INVENTORY_ITEM',
      payload: inventoryItem,
    });
    
    if (item.price && item.price > 0 && item.quantity > 0) {
      const transaction = {
        id: uuidv4(),
        type: 'expense' as const,
        description: `Inventory: ${item.name}`,
        amount: item.price * item.quantity,
        date: new Date().toISOString(),
      };
      
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: transaction,
      });
    }
    setAddModalOpen(false);
  };

  const handleEditSave = (item: Omit<InventoryItem, 'id' | 'history' | 'lastUsed'>) => {
    if (!selectedItem) return;
    dispatch({
      type: 'UPDATE_INVENTORY_ITEM',
      payload: {
        ...selectedItem,
        ...item,
      },
    });
    setEditModalOpen(false);
    setSelectedItem(null);
  };

  const handleLogUsage = (id: string, change: number, reason: string) => {
    dispatch({
      type: 'LOG_INVENTORY_USAGE',
      payload: { id, change, reason },
    });
    setUsageModalOpen(false);
    setSelectedItem(null);
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_INVENTORY_ITEM', payload: itemId });
  };

  const handleQuickUsage = (item: InventoryItem, amount: number) => {
    dispatch({
      type: 'LOG_INVENTORY_USAGE',
      payload: { id: item.id, change: -amount, reason: 'Quick usage' },
    });
  };

  return (
    <div className="p-4 pb-20 sm:pb-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory Management</h2>
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center gap-2 transition-colors"
          onClick={() => setAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
      
      {/* Mobile card view */}
      <div className="sm:hidden space-y-4">
        {inventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No inventory items yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start tracking your farm supplies</p>
          </div>
        ) : (
          inventory.map(item => (
            <div 
              key={item.id} 
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 p-4 ${
                isLowStock(item) ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{categoryLabels[item.category]}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLowStock(item) && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    isLowStock(item) ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {isLowStock(item) ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                <p><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</p>
                {item.price && (
                  <p><span className="font-medium">Value:</span> {(item.price * item.quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })}</p>
                )}
                {item.expiryDate && (
                  <p><span className="font-medium">Expires:</span> {new Date(item.expiryDate).toLocaleDateString()}</p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-3">
                {[1, 5, 10].map(amount => (
                  <button
                    key={amount}
                    onClick={() => handleQuickUsage(item, amount)}
                    disabled={amount > item.quantity}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                  >
                    Use {amount}
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  onClick={() => { setSelectedItem(item); setUsageModalOpen(true); }}
                >
                  <TrendingDown className="w-4 h-4 inline mr-1" />
                  Manage
                </button>
                <button 
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  onClick={() => { setSelectedItem(item); setEditModalOpen(true); }}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Name</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Category</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Quantity</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Unit</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Value</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Status</th>
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Package className="mx-auto h-8 w-8 mb-2" />
                  <p>No inventory items yet</p>
                </td>
              </tr>
            )}
            {inventory.map(item => (
              <tr key={item.id} className={`border-t border-gray-200 dark:border-gray-700 ${
                isLowStock(item) ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}>
                <td className="py-3 px-4">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                    {item.supplier && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{item.supplier}</div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{categoryLabels[item.category]}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.quantity}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{item.unit}</td>
                <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                  {item.price && item.quantity ? (item.price * item.quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' }) : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {isLowStock(item) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      isLowStock(item) ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    }`}>
                      {isLowStock(item) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {/* Quick Usage Buttons */}
                    <div className="flex gap-1">
                      {[1, 5, 10].map(amount => (
                        <button
                          key={amount}
                          onClick={() => handleQuickUsage(item, amount)}
                          disabled={amount > item.quantity}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700"
                          title={`Use ${amount} ${item.unit}`}
                        >
                          {amount}
                        </button>
                      ))}
                    </div>
                    
                    {/* Main Action Buttons */}
                    <button 
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded dark:text-blue-400 dark:hover:bg-blue-900/20"
                      onClick={() => { setSelectedItem(item); setUsageModalOpen(true); }}
                      title="Manage inventory"
                    >
                      <TrendingDown className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded dark:text-gray-400 dark:hover:bg-gray-700"
                      onClick={() => { setSelectedItem(item); setEditModalOpen(true); }}
                      title="Edit item"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-red-600 hover:bg-red-100 rounded dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddEditInventoryModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleAddSave}
        isEdit={false}
      />
      <AddEditInventoryModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedItem(null); }}
        onSave={handleEditSave}
        initialData={selectedItem || {}}
        isEdit={true}
      />
      {selectedItem && (
        <LogUsageModal
          open={usageModalOpen}
          onClose={() => { setUsageModalOpen(false); setSelectedItem(null); }}
          onSave={(change, reason) => handleLogUsage(selectedItem.id, change, reason)}
          onRemove={handleRemoveItem}
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default InventoryList; 