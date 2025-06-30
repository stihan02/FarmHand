import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';

interface AddEditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'history' | 'lastUsed'>) => void;
  initialData?: Partial<InventoryItem>;
  isEdit?: boolean;
}

const categoryOptions = [
  { value: 'medicine', label: 'Medicine' },
  { value: 'feed', label: 'Feed' },
  { value: 'fencing', label: 'Fencing' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

const AddEditInventoryModal: React.FC<AddEditInventoryModalProps> = ({ open, onClose, onSave, initialData = {}, isEdit }) => {
  const [name, setName] = useState(initialData.name || '');
  const [category, setCategory] = useState<InventoryItem['category']>(initialData.category || 'medicine');
  const [quantity, setQuantity] = useState(initialData.quantity ?? 0);
  const [unit, setUnit] = useState(initialData.unit || '');
  const [expiryDate, setExpiryDate] = useState(initialData.expiryDate || '');
  const [supplier, setSupplier] = useState(initialData.supplier || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(initialData.lowStockThreshold ?? 0);
  const [notes, setNotes] = useState(initialData.notes || '');
  const [price, setPrice] = useState(initialData.price ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName(initialData.name || '');
      setCategory(initialData.category || 'medicine');
      setQuantity(initialData.quantity ?? 0);
      setUnit(initialData.unit || '');
      setExpiryDate(initialData.expiryDate || '');
      setSupplier(initialData.supplier || '');
      setLowStockThreshold(initialData.lowStockThreshold ?? 0);
      setNotes(initialData.notes || '');
      setPrice(initialData.price ?? '');
      setError('');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!unit.trim()) {
      setError('Unit is required');
      return;
    }
    setError('');
    onSave({
      name: name.trim(),
      category,
      quantity,
      unit: unit.trim(),
      expiryDate: expiryDate || undefined,
      supplier: supplier || undefined,
      lowStockThreshold,
      notes: notes || undefined,
      price: price === '' ? undefined : Number(price),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{isEdit ? 'Edit' : 'Add'} Inventory Item</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <span className="sr-only">Close</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1.5 rounded-md mb-2" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}
        {isEdit && (
          <div className="flex flex-col gap-3 mb-4 md:hidden">
            <button
              className="w-full bg-yellow-600 text-white py-3 rounded-lg font-bold text-lg shadow-md active:bg-yellow-700 transition"
              onClick={() => {
                if (window.confirm('Mark this item as USED UP? This will set quantity to 0.')) {
                  onSave({
                    ...initialData,
                    name: initialData.name || '',
                    category: initialData.category || 'other',
                    unit: initialData.unit || '',
                    quantity: 0,
                    notes: (initialData.notes || '') + '\nUsed up (quick action)',
                  });
                  onClose();
                }
              }}
            >Mark as Used Up</button>
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md active:bg-blue-700 transition"
              onClick={() => {
                if (window.confirm('Mark this item as SOLD? This will set quantity to 0.')) {
                  onSave({
                    ...initialData,
                    name: initialData.name || '',
                    category: initialData.category || 'other',
                    unit: initialData.unit || '',
                    quantity: 0,
                    notes: (initialData.notes || '') + '\nSold (quick action)',
                  });
                  onClose();
                }
              }}
            >Mark as Sold</button>
            <button
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg shadow-md active:bg-green-700 transition"
              onClick={() => {
                const qty = prompt('How many units to restock?');
                const addQty = qty ? parseInt(qty, 10) : 0;
                if (addQty > 0) {
                  onSave({
                    ...initialData,
                    name: initialData.name || '',
                    category: initialData.category || 'other',
                    unit: initialData.unit || '',
                    quantity: (initialData.quantity || 0) + addQty,
                    notes: (initialData.notes || '') + `\nRestocked +${addQty} (quick action)`,
                  });
                  onClose();
                }
              }}
            >Restock</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select className="w-full border rounded px-3 py-2" value={category} onChange={e => setCategory(e.target.value as InventoryItem['category'])}>
                {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit *</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={unit} onChange={e => setUnit(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Supplier</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={supplier} onChange={e => setSupplier(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={lowStockThreshold} onChange={e => setLowStockThreshold(Number(e.target.value))} min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price per unit</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} min={0} step="0.01" />
            </div>
            {price !== '' && !isNaN(Number(price)) && quantity > 0 && (
              <div className="text-sm text-gray-700 mt-1">Total cost: <span className="font-semibold">{(Number(price) * quantity).toLocaleString(undefined, { style: 'currency', currency: 'ZAR' })}</span></div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea className="w-full border rounded px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="button" className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700">{isEdit ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditInventoryModal; 