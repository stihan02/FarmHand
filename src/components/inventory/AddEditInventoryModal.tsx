import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';

const categoryOptions = [
  { value: 'medicine', label: 'Medicine' },
  { value: 'feed', label: 'Feed' },
  { value: 'fencing', label: 'Fencing' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'other', label: 'Other' },
];

interface AddEditInventoryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'history' | 'lastUsed'>) => void;
  isEdit: boolean;
  initialData?: Partial<InventoryItem>;
}

const emptyForm = {
  name: '',
  category: 'medicine',
  quantity: 0,
  unit: '',
  expiryDate: '',
  supplier: '',
  lowStockThreshold: 0,
  price: 0,
  notes: '',
};

const AddEditInventoryModal: React.FC<AddEditInventoryModalProps> = ({ open, onClose, onSave, isEdit, initialData }) => {
  const [form, setForm] = useState({ ...emptyForm, ...initialData });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({ ...emptyForm, ...initialData });
      setError(null);
    }
  }, [open, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'quantity' || name === 'lowStockThreshold' || name === 'price' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!form.category) {
      setError('Category is required.');
      return;
    }
    if (!form.unit.trim()) {
      setError('Unit is required.');
      return;
    }
    setError(null);
    onSave({
      name: form.name,
      category: form.category as InventoryItem['category'],
      quantity: form.quantity,
      unit: form.unit,
      expiryDate: form.expiryDate || undefined,
      supplier: form.supplier,
      lowStockThreshold: form.lowStockThreshold,
      price: form.price,
      notes: form.notes,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{isEdit ? 'Edit' : 'Add'} Inventory Item</h2>
        {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
              {categoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit *</label>
            <input type="text" name="unit" value={form.unit} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expiry Date</label>
            <input type="date" name="expiryDate" value={form.expiryDate || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Supplier</label>
            <input type="text" name="supplier" value={form.supplier} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
            <input type="number" name="lowStockThreshold" value={form.lowStockThreshold} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price per unit</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} step="0.01" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2} />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">{isEdit ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditInventoryModal; 