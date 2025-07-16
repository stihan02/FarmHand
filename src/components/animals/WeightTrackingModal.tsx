import React, { useState } from 'react';
import { Animal } from '../../types';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { X, Plus, TrendingUp, TrendingDown, Scale, BarChart3, Calendar, FileText } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

interface WeightTrackingModalProps {
  animal: Animal;
  onClose: () => void;
  onUpdate: (animal: Animal) => void;
}

export const WeightTrackingModal: React.FC<WeightTrackingModalProps> = ({
  animal,
  onClose,
  onUpdate
}) => {
  const [newWeight, setNewWeight] = useState('');
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightNotes, setWeightNotes] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Extract weight entries from animal history
  const weightEntries: WeightEntry[] = animal.history
    .filter(event => event.description.includes('Weight:'))
    .map(event => {
      const weightMatch = event.description.match(/Weight: ([\d.]+)/);
      const notesMatch = event.description.match(/Notes: (.+)/);
      return {
        id: event.date,
        date: event.date,
        weight: weightMatch ? parseFloat(weightMatch[1]) : 0,
        notes: notesMatch ? notesMatch[1] : undefined
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddWeight = () => {
    if (!newWeight || !weightDate) return;

    const weight = parseFloat(newWeight);
    const description = `Weight: ${weight}kg${weightNotes ? ` | Notes: ${weightNotes}` : ''}`;

    const updatedAnimal: Animal = {
      ...animal,
      history: [...animal.history, {
        date: weightDate,
        description
      }]
    };

    onUpdate(updatedAnimal);
    setNewWeight('');
    setWeightDate(new Date().toISOString().split('T')[0]);
    setWeightNotes('');
    setShowAddForm(false);
  };

  const calculateWeightGain = () => {
    if (weightEntries.length < 2) return null;
    
    const sortedEntries = [...weightEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    const firstWeight = sortedEntries[0].weight;
    const lastWeight = sortedEntries[sortedEntries.length - 1].weight;
    const gain = lastWeight - firstWeight;
    const percentage = ((gain / firstWeight) * 100).toFixed(1);
    
    return { gain, percentage, isPositive: gain > 0 };
  };

  const weightGain = calculateWeightGain();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-8">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <Scale className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Weight Analytics</h2>
                <p className="text-emerald-100 font-medium">Tag #{animal.tagNumber} • {animal.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 8rem)' }}>
          {/* Premium Analytics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-emerald-600 p-2 rounded-xl">
                  <Scale className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Current Weight</span>
              </div>
              <p className="text-3xl font-bold text-emerald-900">
                {weightEntries.length > 0 ? `${weightEntries[0].weight}kg` : '—'}
              </p>
              {weightEntries.length > 0 && (
                <p className="text-sm text-emerald-700 mt-1">Latest measurement</p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Gain</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {weightGain ? (
                  <span className={`flex items-center space-x-2 ${weightGain.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {weightGain.isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                    <span>{weightGain.gain > 0 ? '+' : ''}{weightGain.gain.toFixed(1)}kg</span>
                  </span>
                ) : '—'}
              </p>
              {weightGain && (
                <p className="text-sm text-blue-700 mt-1">
                  {weightGain.percentage}% change
                </p>
              )}
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-purple-600 p-2 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Entries</span>
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {weightEntries.length}
              </p>
              <p className="text-sm text-purple-700 mt-1">Measurements recorded</p>
            </div>
          </div>

          {/* Premium Add Weight Section */}
          <div className="mb-8">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
              >
                <Plus className="h-6 w-6" />
                <span>Add New Weight Entry</span>
              </button>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-6 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 p-2 rounded-xl">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">New Weight Entry</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-lg font-medium"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Date *</label>
                    <input
                      type="date"
                      value={weightDate}
                      onChange={(e) => setWeightDate(e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-lg font-medium"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Notes (optional)</label>
                  <input
                    type="text"
                    value={weightNotes}
                    onChange={(e) => setWeightNotes(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    placeholder="e.g., After feeding, Before transport, Health check"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddWeight}
                    disabled={!newWeight || !weightDate}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
                  >
                    Add Entry
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewWeight('');
                      setWeightNotes('');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Premium Weight History */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-600 p-2 rounded-xl">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Weight History</h3>
            </div>
            
            {weightEntries.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                <Scale className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-semibold text-gray-600 mb-2">No weight entries recorded yet</p>
                <p className="text-gray-500 mb-6">Start tracking your animal's growth journey</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Add First Weight Entry
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {weightEntries.map((entry, index) => {
                  const previousEntry = weightEntries[index + 1];
                  const change = previousEntry ? entry.weight - previousEntry.weight : null;
                  
                  return (
                    <div key={entry.id} className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-2xl font-bold text-gray-900 group-hover:text-emerald-900 transition-colors">
                              {entry.weight}kg
                            </span>
                            {change !== null && (
                              <span className={`text-sm font-semibold flex items-center space-x-2 px-3 py-1 rounded-full ${
                                change > 0 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : change < 0 
                                  ? 'bg-red-100 text-red-700 border border-red-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {change > 0 ? <TrendingUp className="h-4 w-4" /> : change < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                                <span>{change > 0 ? '+' : ''}{change.toFixed(1)}kg</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{formatDate(entry.date)}</span>
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 mt-2 italic bg-gray-50 p-3 rounded-lg border-l-4 border-emerald-500">
                              "{entry.notes}"
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 