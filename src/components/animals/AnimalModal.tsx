import React, { useState } from 'react';
import { Animal, HistoryEvent } from '../../types';
import { calculateAge, formatDate, formatCurrency, generateId } from '../../utils/helpers';
import { X, Calendar, DollarSign, AlertTriangle, Plus, MapPin } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface AnimalModalProps {
  animal: Animal;
  onClose: () => void;
  onUpdate: (animal: Animal) => void;
  allAnimals: Animal[];
}

export const AnimalModal: React.FC<AnimalModalProps> = ({ animal, onClose, onUpdate, allAnimals }) => {
  const { state, dispatch } = useFarm();
  const [activeTab, setActiveTab] = useState<'profile' | 'sell' | 'deceased' | 'history'>('profile');
  const [sellData, setSellData] = useState({ 
    price: '', 
    date: new Date().toISOString().split('T')[0], 
    location: '' 
  });
  const [deceasedData, setDeceasedData] = useState({ 
    reason: '', 
    date: new Date().toISOString().split('T')[0] 
  });
  const [newEvent, setNewEvent] = useState({ description: '' });
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderDesc, setReminderDesc] = useState('');
  const [reminderDate, setReminderDate] = useState('');

  // Find offspring animals
  const offspring = allAnimals.filter(a => a.motherTag === animal.tagNumber || a.fatherTag === animal.tagNumber);
  
  // Find parent animals
  const mother = allAnimals.find(a => a.tagNumber === animal.motherTag);
  const father = allAnimals.find(a => a.tagNumber === animal.fatherTag);

  const handleSell = () => {
    if (!sellData.price || !sellData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    const updatedAnimal: Animal = {
      ...animal,
      status: 'Sold' as const,
      salePrice: parseFloat(sellData.price),
      saleDate: sellData.date,
      history: [...animal.history, {
        date: new Date().toISOString().split('T')[0],
        description: `Sold for ${formatCurrency(parseFloat(sellData.price))} on ${formatDate(sellData.date)}`
      }]
    };
    
    onUpdate(updatedAnimal);
    onClose();
  };

  const handleMarkDeceased = () => {
    if (!deceasedData.reason || !deceasedData.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    const updatedAnimal: Animal = {
      ...animal,
      status: 'Deceased' as const,
      deceasedReason: deceasedData.reason,
      deceasedDate: deceasedData.date,
      history: [...animal.history, {
        date: new Date().toISOString().split('T')[0],
        description: `Deceased - ${deceasedData.reason} on ${formatDate(deceasedData.date)}`
      }]
    };
    
    onUpdate(updatedAnimal);
    onClose();
  };

  const handleAddEvent = () => {
    if (!newEvent.description) return;
    
    const updatedAnimal: Animal = {
      ...animal,
      history: [...animal.history, {
        date: new Date().toISOString().split('T')[0],
        description: newEvent.description
      }]
    };
    
    onUpdate(updatedAnimal);
    setNewEvent({ description: '' });
  };

  const handleCampChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampId = e.target.value;
    const updatedAnimal = { ...animal, campId: newCampId === 'unassigned' ? undefined : newCampId };
    onUpdate(updatedAnimal);
  };

  const typeEmojis: Record<string, string> = {
    Sheep: '🐑',
    Cattle: '🐄',
    Pig: '🐷',
    Other: '🐾'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{typeEmojis[animal.type]}</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Tag #{animal.tagNumber}</h2>
              <p className="text-gray-600 dark:text-gray-400">{animal.type} • {animal.sex === 'M' ? 'Male' : 'Female'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="border-b border-gray-200 dark:border-zinc-700">
          <nav className="flex">
            {[
              { id: 'profile', label: 'Profile', icon: Calendar },
              ...(animal.status === 'Active' ? [
                { id: 'sell', label: 'Mark Sold', icon: DollarSign },
                { id: 'deceased', label: 'Mark Deceased', icon: AlertTriangle }
              ] : []),
              { id: 'history', label: 'History', icon: Plus }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'sell' | 'deceased' | 'history')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 8rem)' }}>
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Risk alert banner */}
              {(() => {
                // Inbreeding and biosecurity risk logic
                const animalsInCamp = allAnimals.filter(a => a.campId === animal.campId);
                const parentTags = [animal.motherTag, animal.fatherTag].filter(Boolean);
                const siblingTags = [];
                animalsInCamp.forEach(a => {
                  if (a.motherTag && parentTags.includes(a.motherTag)) siblingTags.push(a.tagNumber);
                  if (a.fatherTag && parentTags.includes(a.fatherTag)) siblingTags.push(a.tagNumber);
                });
                const offspringInCamp = animalsInCamp.filter(a => animal.offspringTags.includes(a.tagNumber));
                const parentInCamp = animalsInCamp.filter(a => parentTags.includes(a.tagNumber));
                const inbreeding = (siblingTags.length > 0 || offspringInCamp.length > 0 || parentInCamp.length > 0)
                  ? `Inbreeding risk (${[
                      siblingTags.length > 0 ? 'Sibling(s)' : null,
                      offspringInCamp.length > 0 ? 'Offspring' : null,
                      parentInCamp.length > 0 ? 'Parent' : null
                    ].filter(Boolean).join(', ')})`
                  : null;
                const now = new Date();
                const recentDisease = animalsInCamp.some(a =>
                  a.health && a.health.some(h =>
                    (h.type === 'Treatment' || h.type === 'Vaccination') &&
                    (now.getTime() - new Date(h.date).getTime()) < 1000 * 60 * 60 * 24 * 30
                  )
                );
                const biosecurity = recentDisease ? 'Biosecurity risk (recent disease/treatment event)' : null;
                if (!inbreeding && !biosecurity) return null;
                return (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-lg px-3 py-2 mb-2">
                    <AlertTriangle size={18} className="text-yellow-400" />
                    <span className="font-medium">{[inbreeding, biosecurity].filter(Boolean).join(' | ')}</span>
                  </div>
                );
              })()}
              <button
                className="bg-yellow-500 text-white px-3 py-2 rounded shadow hover:bg-yellow-600 w-full mb-2"
                onClick={() => setReminderModalOpen(true)}
              >
                Set Reminder for this Animal
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold">{calculateAge(animal.birthdate)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Birth Date</p>
                  <p className="font-semibold">{formatDate(animal.birthdate)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tag Color</p>
                  <p className="font-semibold">{animal.tagColor || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Status</p>
                  <p className={`font-semibold ${
                    animal.status === 'Active' ? 'text-emerald-600' :
                    animal.status === 'Sold' ? 'text-blue-600' : 'text-red-600'
                  }`}>{animal.status}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <label htmlFor="camp-select" className="text-sm text-gray-600 dark:text-gray-300 flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    Assigned Camp
                  </label>
                  <select
                    id="camp-select"
                    value={animal.campId || 'unassigned'}
                    onChange={handleCampChange}
                    className="w-full p-2 border rounded-md bg-white dark:bg-zinc-700 dark:border-zinc-600 dark:text-white"
                  >
                    <option value="unassigned">Unassigned</option>
                    {state.camps.map(camp => (
                      <option key={camp.id} value={camp.id}>{camp.name}</option>
                    ))}
                  </select>
              </div>
              
              {(animal.motherTag || animal.fatherTag) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Parentage</h4>
                  {animal.motherTag && <p className="text-sm text-blue-800 dark:text-blue-300">Mother: Tag #{animal.motherTag}</p>}
                  {animal.fatherTag && <p className="text-sm text-blue-800 dark:text-blue-300">Father: Tag #{animal.fatherTag}</p>}
                </div>
              )}

              {offspring.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Offspring ({offspring.length})</h4>
                  <div className="space-y-2">
                    {offspring.map((child) => (
                      <div key={child.tagNumber} className="flex justify-between items-center">
                        <p className="text-sm text-purple-800 dark:text-purple-300">
                          Tag #{child.tagNumber} • {child.type} • {child.sex === 'M' ? 'Male' : 'Female'}
                        </p>
                        <p className="text-sm text-purple-600 dark:text-purple-300">{calculateAge(child.birthdate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {animal.status === 'Sold' && animal.salePrice && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">Sale Information</h4>
                  <p className="text-sm text-green-800 dark:text-green-300">Price: {formatCurrency(animal.salePrice)}</p>
                  <p className="text-sm text-green-800 dark:text-green-300">Date: {formatDate(animal.saleDate!)}</p>
                </div>
              )}

              {animal.status === 'Deceased' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 dark:text-red-200 mb-2">Deceased Information</h4>
                  <p className="text-sm text-red-800 dark:text-red-300">Reason: {animal.deceasedReason}</p>
                  <p className="text-sm text-red-800 dark:text-red-300">Date: {formatDate(animal.deceasedDate!)}</p>
                </div>
              )}

              {activeTab === 'profile' && animal.status === 'Active' && (
                <div className="flex flex-col gap-3 mb-4 md:hidden">
                  <button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg shadow-md active:bg-blue-700 transition"
                    onClick={() => {
                      if (window.confirm('Mark this animal as SOLD?')) {
                        const updatedAnimal = {
                          ...animal,
                          status: 'Sold' as const,
                          salePrice: 0,
                          saleDate: new Date().toISOString().split('T')[0],
                          history: [...animal.history, {
                            date: new Date().toISOString().split('T')[0],
                            description: `Sold (quick action)`
                          }]
                        };
                        onUpdate(updatedAnimal);
                        onClose();
                      }
                    }}
                  >Mark as Sold</button>
                  <button
                    className="w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg shadow-md active:bg-red-700 transition"
                    onClick={() => {
                      if (window.confirm('Mark this animal as DECEASED?')) {
                        const updatedAnimal = {
                          ...animal,
                          status: 'Deceased' as const,
                          deceasedReason: 'Deceased (quick action)',
                          deceasedDate: new Date().toISOString().split('T')[0],
                          history: [...animal.history, {
                            date: new Date().toISOString().split('T')[0],
                            description: `Deceased (quick action)`
                          }]
                        };
                        onUpdate(updatedAnimal);
                        onClose();
                      }
                    }}
                  >Mark as Deceased</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sell' && animal.status === 'Active' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mark as Sold</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={sellData.price}
                    onChange={(e) => setSellData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date *</label>
                  <input
                    type="date"
                    value={sellData.date}
                    onChange={(e) => setSellData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={sellData.location}
                    onChange={(e) => setSellData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Sale location"
                  />
                </div>
                <button
                  onClick={handleSell}
                  disabled={!sellData.price || !sellData.date}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Mark as Sold
                </button>
              </div>
            </div>
          )}

          {activeTab === 'deceased' && animal.status === 'Active' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Mark as Deceased</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                  <input
                    type="text"
                    value={deceasedData.reason}
                    onChange={(e) => setDeceasedData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Reason for death"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={deceasedData.date}
                    onChange={(e) => setDeceasedData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={handleMarkDeceased}
                  disabled={!deceasedData.reason || !deceasedData.date}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium"
                >
                  Mark as Deceased
                </button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Event History</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ description: e.target.value })}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Add new event..."
                  />
                  <button
                    onClick={handleAddEvent}
                    disabled={!newEvent.description}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {animal.history.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No events recorded</p>
                ) : (
                  animal.history.map((event, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <p className="text-gray-900">{event.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Set Reminder for Tag #{animal.tagNumber}</h2>
            <form onSubmit={e => {
              e.preventDefault();
              if (!reminderDesc || !reminderDate) return;
              dispatch({
                type: 'ADD_TASK',
                payload: {
                  id: Date.now().toString(),
                  description: reminderDesc,
                  dueDate: reminderDate,
                  status: 'Pending',
                  reminder: true,
                  relatedAnimalIds: [animal.id],
                }
              });
              setReminderModalOpen(false);
              setReminderDesc('');
              setReminderDate('');
            }}>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={reminderDate} onChange={e => setReminderDate(e.target.value)} required />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setReminderModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-yellow-500 text-white disabled:bg-gray-300" disabled={!reminderDesc || !reminderDate}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};