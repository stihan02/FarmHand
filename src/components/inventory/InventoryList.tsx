import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { InventoryItem } from '../../types';
import AddEditInventoryModal from './AddEditInventoryModal';
import { v4 as uuidv4 } from 'uuid';
import LogUsageModal from './LogUsageModal';

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
    dispatch({
      type: 'ADD_INVENTORY_ITEM',
      payload: {
        ...item,
        id: uuidv4(),
        history: [{ date: new Date().toISOString(), change: item.quantity, reason: 'Initial stock' }],
      },
    });
    if (item.price && item.price > 0 && item.quantity > 0) {
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: uuidv4(),
          type: 'expense',
          description: `Inventory: ${item.name}`,
          amount: item.price * item.quantity,
          date: new Date().toISOString(),
        },
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

  return (
    <div className="p-4 pb-20 sm:pb-4">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      
      {/* Mobile card view */}
      <div className="sm:hidden space-y-4">
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No inventory items yet.</div>
        ) : (
          inventory.map(item => (
            <div 
              key={item.id} 
              className={`bg-white rounded-lg shadow p-4 border-l-4 ${isLowStock(item) ? 'border-red-500 bg-red-50' : 'border-green-500'}`}
              onClick={() => { setSelectedItem(item); setEditModalOpen(true); }}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${isLowStock(item) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {isLowStock(item) ? 'Low' : 'OK'}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Quantity:</span> {item.quantity} {item.unit}</p>
                <p><span className="font-medium">Category:</span> {categoryLabels[item.category]}</p>
                {item.price && (
                  <p><span className="font-medium">Price:</span> {item.price.toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })} per {item.unit}</p>
                )}
                {item.expiryDate && (
                  <p><span className="font-medium">Expires:</span> {new Date(item.expiryDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left">Unit</th>
              <th className="py-2 px-4 text-left">Expiry</th>
              <th className="py-2 px-4 text-left">Supplier</th>
              <th className="py-2 px-4 text-left">Price per unit</th>
              <th className="py-2 px-4 text-left">Total value</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 && (
              <tr>
                <td colSpan={10} className="py-4 text-center text-gray-400">No inventory items yet.</td>
              </tr>
            )}
            {inventory.map(item => (
              <tr key={item.id} className={isLowStock(item) ? 'bg-red-50' : ''} onClick={() => { setSelectedItem(item); setEditModalOpen(true); }} style={{ cursor: 'pointer' }}>
                <td className="py-2 px-4 font-medium">{item.name}</td>
                <td className="py-2 px-4">{categoryLabels[item.category]}</td>
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4">{item.unit}</td>
                <td className="py-2 px-4">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                <td className="py-2 px-4">{item.supplier || '-'}</td>
                <td className="py-2 px-4">{item.price ? item.price.toLocaleString(undefined, { style: 'currency', currency: 'ZAR' }) : '-'}</td>
                <td className="py-2 px-4">{item.price && item.quantity ? (item.price * item.quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' }) : '-'}</td>
                <td className="py-2 px-4">
                  {isLowStock(item) ? (
                    <span className="text-red-600 font-semibold">Low</span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </td>
                <td className="py-2 px-4 space-x-2">
                  <button className="text-blue-600 hover:underline" onClick={e => { e.stopPropagation(); setSelectedItem(item); setEditModalOpen(true); }}>Edit</button>
                  <button className="text-red-600 hover:underline" onClick={e => { e.stopPropagation(); dispatch({ type: 'REMOVE_INVENTORY_ITEM', payload: item.id }); }}>Remove</button>
                  <button className="text-yellow-600 hover:underline" onClick={e => { e.stopPropagation(); setSelectedItem(item); setUsageModalOpen(true); }}>Log Usage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700" onClick={() => setAddModalOpen(true)}>
          Add Item
        </button>
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
          item={selectedItem}
        />
      )}
    </div>
  );
};

export default InventoryList; 