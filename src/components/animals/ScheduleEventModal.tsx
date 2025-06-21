import React, { useState } from 'react';
import { Event } from '../../types';

interface ScheduleEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<Event, 'id'>) => void;
  selectedTagNumbers: string[];
}

const EVENT_TYPES = [
  'Dose',
  'Castrate',
  'Vaccinate',
  'Weigh',
  'Other',
];

export const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({ open, onClose, onSubmit, selectedTagNumbers }) => {
  const [type, setType] = useState('Dose');
  const [customType, setCustomType] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventType = type === 'Other' ? customType.trim() : type;
    if (!eventType) return;
    onSubmit({
      type: eventType,
      date,
      notes,
      animalTagNumbers: selectedTagNumbers,
    });
    setType('Dose');
    setCustomType('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Schedule Event for {selectedTagNumbers.length} Animal{selectedTagNumbers.length > 1 ? 's' : ''}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Event Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-lg dark:bg-zinc-800 dark:text-gray-100"
              value={type}
              onChange={e => setType(e.target.value)}
            >
              {EVENT_TYPES.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {type === 'Other' && (
              <input
                type="text"
                className="w-full mt-2 p-2 border border-gray-300 rounded-lg dark:bg-zinc-800 dark:text-gray-100"
                placeholder="Custom event type"
                value={customType}
                onChange={e => setCustomType(e.target.value)}
                required
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-lg dark:bg-zinc-800 dark:text-gray-100"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg dark:bg-zinc-800 dark:text-gray-100"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 