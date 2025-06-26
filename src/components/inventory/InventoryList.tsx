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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Inventory</h2>
      <div className="w-full overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Category</th>
              <th className="py-2 px-4 text-left">Quantity</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Unit</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Expiry</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Supplier</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Price per unit</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Total value</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left hidden sm:table-cell">Actions</th>
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
                <td className="py-2 px-4 hidden sm:table-cell">{categoryLabels[item.category]}</td>
                <td className="py-2 px-4">{item.quantity}</td>
                <td className="py-2 px-4 hidden sm:table-cell">{item.unit}</td>
                <td className="py-2 px-4 hidden sm:table-cell">{item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}</td>
                <td className="py-2 px-4 hidden sm:table-cell">{item.supplier || '-'}</td>
                <td className="py-2 px-4 hidden sm:table-cell">{item.price ? item.price.toLocaleString(undefined, { style: 'currency', currency: 'ZAR' }) : '-'}</td>
                <td className="py-2 px-4 hidden sm:table-cell">{item.price && item.quantity ? (item.price * item.quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' }) : '-'}</td>
                <td className="py-2 px-4">
                  {isLowStock(item) ? (
                    <span className="text-red-600 font-semibold">Low</span>
                  ) : (
                    <span className="text-green-600">OK</span>
                  )}
                </td>
                <td className="py-2 px-4 space-x-2 hidden sm:table-cell">
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