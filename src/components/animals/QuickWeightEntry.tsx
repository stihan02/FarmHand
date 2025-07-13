import React, { useState } from 'react';
import { Animal, WeightRecord } from '../../types';
import { Plus, X, Scale } from 'lucide-react';

interface QuickWeightEntryProps {
  animals: Animal[];
  onAddWeight: (animalId: string, weightRecord: WeightRecord) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickWeightEntry: React.FC<QuickWeightEntryProps> = ({
  animals,
  onAddWeight,
  isOpen,
  onClose
}) => {
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterCamp, setFilterCamp] = useState('All');

  const activeAnimals = animals.filter(animal => animal.status === 'Active');
  
  const filteredAnimals = activeAnimals.filter(animal => {
    const matchesType = filterType === 'All' || animal.type === filterType;
    const matchesCamp = filterCamp === 'All' || animal.campId === filterCamp;
    return matchesType && matchesCamp;
  });

  const handleAnimalToggle = (animalId: string) => {
    setSelectedAnimals(prev => 
      prev.includes(animalId) 
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnimals.length === filteredAnimals.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(filteredAnimals.map(a => a.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || selectedAnimals.length === 0) return;

    const weightRecord: WeightRecord = {
      date,
      weight: parseFloat(weight),
      notes: notes || undefined
    };

    selectedAnimals.forEach(animalId => {
      onAddWeight(animalId, weightRecord);
    });

    // Reset form
    setWeight('');
    setNotes('');
    setSelectedAnimals([]);
    onClose();
  };

  const animalTypes = [...new Set(activeAnimals.map(a => a.type))];
  const camps = [...new Set(activeAnimals.map(a => a.campId).filter(Boolean))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-emerald-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Quick Weight Entry
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add weight records for multiple animals at once
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Weight Entry Form */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Weight Information
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                    placeholder="e.g., 450.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                    placeholder="e.g., Morning feed, Weekly weigh-in"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Select Animals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                >
                  <option value="All">All Types</option>
                  {animalTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Filter by Camp</label>
                <select
                  value={filterCamp}
                  onChange={(e) => setFilterCamp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                >
                  <option value="All">All Camps</option>
                  {camps.map(campId => (
                    <option key={campId} value={campId}>{campId}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  {selectedAnimals.length === filteredAnimals.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedAnimals.length} of {filteredAnimals.length} selected
                </span>
              </div>
            </div>

            {/* Animal List */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {filteredAnimals.map(animal => (
                <div
                  key={animal.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnimals.includes(animal.id)
                      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700'
                      : 'bg-white border-gray-200 dark:bg-zinc-800 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700'
                  }`}
                  onClick={() => handleAnimalToggle(animal.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedAnimals.includes(animal.id)}
                      readOnly
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:bg-zinc-800 dark:border-zinc-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        #{animal.tagNumber} - {animal.type}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {animal.sex === 'M' ? 'Male' : 'Female'} • {animal.campId || 'No Camp'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {(animal.weightRecords || []).length > 0 
                      ? `${animal.weightRecords[animal.weightRecords.length - 1].weight} kg`
                      : 'No weight data'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!weight || selectedAnimals.length === 0}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Weight to {selectedAnimals.length} Animal{selectedAnimals.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 