import React, { useState } from 'react';
import { X, Plus, TrendingUp } from 'lucide-react';
import { Animal, WeightRecord } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightTrackingModalProps {
  animal: Animal;
  isOpen: boolean;
  onClose: () => void;
  onAddWeight: (animalId: string, weightRecord: WeightRecord) => void;
}

export const WeightTrackingModal: React.FC<WeightTrackingModalProps> = ({
  animal,
  isOpen,
  onClose,
  onAddWeight
}) => {
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newNotes, setNewNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || !newDate) return;

    const weightRecord: WeightRecord = {
      date: newDate,
      weight: parseFloat(newWeight),
      notes: newNotes || undefined
    };

    onAddWeight(animal.id, weightRecord);
    setNewWeight('');
    setNewNotes('');
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  // Prepare chart data
  const weightRecords = animal.weightRecords || [];
  const chartData = weightRecords
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: record.weight,
      notes: record.notes
    }));

  const latestWeight = weightRecords.length > 0 
    ? Math.max(...weightRecords.map(w => w.weight))
    : 0;

  const weightGain = weightRecords.length >= 2 
    ? latestWeight - Math.min(...weightRecords.map(w => w.weight))
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Weight Tracking - {animal.type} #{animal.tagNumber}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track growth patterns and weight changes
              </p>
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
          {/* Weight Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Latest Weight</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {latestWeight > 0 ? `${latestWeight} kg` : 'No data'}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">Total Gain</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {weightGain > 0 ? `+${weightGain} kg` : 'No gain'}
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-600">Records</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {weightRecords.length}
              </div>
            </div>
          </div>

          {/* Growth Chart */}
          {chartData.length > 0 && (
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Growth Chart</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} kg`, 'Weight']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Add New Weight */}
          <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Weight Record
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                    placeholder="e.g., 450.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-zinc-700 dark:text-white"
                  placeholder="e.g., After feeding, before sale, etc."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Add Weight Record
                </button>
              </div>
            </form>
          </div>

          {/* Weight History */}
          {weightRecords.length > 0 && (
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
              <h3 className="font-semibold mb-4">Weight History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {weightRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700">
                      <div>
                        <div className="font-semibold">{record.weight} kg</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(record.date).toLocaleDateString()}
                        </div>
                        {record.notes && (
                          <div className="text-sm text-gray-500 dark:text-gray-500 italic">
                            {record.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 