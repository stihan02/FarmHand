import React, { useState } from 'react';
import { Animal, HistoryEvent } from '../../types';
import { calculateAge, formatDate, formatCurrency, generateId } from '../../utils/helpers';
import { X, Calendar, DollarSign, AlertTriangle, Plus, MapPin, Scale, BarChart3, FileText } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { WeightTrackingModal } from './WeightTrackingModal';
import { useToast } from '../ToastContext';

interface AnimalModalProps {
  animal: Animal;
  onClose: () => void;
  onUpdate: (animal: Animal) => void;
  allAnimals: Animal[];
}

export const AnimalModal: React.FC<AnimalModalProps> = ({ animal, onClose, onUpdate, allAnimals }) => {
  const { state, dispatch } = useFarm();
  const [activeTab, setActiveTab] = useState<'overview' | 'weight' | 'reports' | 'sell' | 'deceased' | 'history'>('overview');
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
  const [photoUploading, setPhotoUploading] = useState(false);
  const [editingGrazing, setEditingGrazing] = useState(false);
  const [grazingDate, setGrazingDate] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const { showToast } = useToast();

  // Find offspring animals
  const offspring = allAnimals.filter(a => a.motherTag === animal.tagNumber || a.fatherTag === animal.tagNumber);
  
  // Find parent animals
  const mother = allAnimals.find(a => a.tagNumber === animal.motherTag);
  const father = allAnimals.find(a => a.tagNumber === animal.fatherTag);

  // Get current weight from weightRecords
  const weightRecords = animal.weightRecords || [];
  const currentWeight = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : null;

  const handleSell = () => {
    if (!sellData.price || !sellData.date) {
      showToast({ type: 'error', message: 'Please fill in all required fields' });
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
    showToast({ type: 'success', message: 'Animal marked as sold!' });
    onClose();
  };

  const handleMarkDeceased = () => {
    if (!deceasedData.reason || !deceasedData.date) {
      showToast({ type: 'error', message: 'Please fill in all required fields' });
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
    showToast({ type: 'success', message: 'Animal marked as deceased.' });
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
    showToast({ type: 'success', message: 'Event added to animal history.' });
    setNewEvent({ description: '' });
  };

  const handleCampChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCampId = e.target.value;
    const updatedAnimal = { ...animal, campId: newCampId === 'unassigned' ? undefined : newCampId };
    onUpdate(updatedAnimal);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const updatedAnimal = { ...animal, photoUrl: event.target?.result as string };
      onUpdate(updatedAnimal);
      setPhotoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const typeEmojis: Record<string, string> = {
    Sheep: '🐑',
    Cattle: '🐄',
    Pig: '🐷',
    Other: '🐾'
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
          {/* Premium Header */}
          <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-8">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <div className="text-2xl">{typeEmojis[animal.type]}</div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Tag #{animal.tagNumber}</h2>
                  <p className="text-emerald-100 font-medium">{animal.type} • {animal.sex === 'M' ? 'Male' : 'Female'}</p>
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

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-zinc-700">
            <nav className="flex overflow-x-auto whitespace-nowrap w-full">
              {[
                { id: 'overview', label: 'Overview', icon: Calendar },
                { id: 'weight', label: 'Weight', icon: Scale },
                { id: 'reports', label: 'Reports', icon: BarChart3 },
                ...(animal.status === 'Active' ? [
                  { id: 'sell', label: 'Mark Sold', icon: DollarSign },
                  { id: 'deceased', label: 'Mark Deceased', icon: AlertTriangle }
                ] : []),
                { id: 'history', label: 'History', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
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

          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 8rem)' }}>
            {/* Content goes here - keeping existing content structure */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Animal Photo */}
                {animal.photoUrl && (
                  <div className="flex flex-col items-center">
                    <img src={animal.photoUrl} alt="Animal" className="rounded-lg max-h-40 object-contain border" />
                    <button
                      className="mt-2 text-xs text-red-500 hover:underline"
                      onClick={() => onUpdate({ ...animal, photoUrl: undefined })}
                      type="button"
                    >Remove Photo</button>
                  </div>
                )}
                
                {/* Photo upload */}
                <div>
                  <label htmlFor="animal-photo-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {animal.photoUrl ? 'Change Photo' : 'Add Photo'}
                  </label>
                  <input
                    id="animal-photo-upload"
                    name="animal-photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    disabled={photoUploading}
                  />
                  {photoUploading && <div className="text-xs text-gray-400 mt-1">Uploading...</div>}
                </div>

                {/* Key Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Age</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{calculateAge(animal.birthdate)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Birth Date</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{formatDate(animal.birthdate)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tag Color</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{animal.tagColor || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className={`font-semibold ${
                      animal.status === 'Active' ? 'text-emerald-600' :
                      animal.status === 'Sold' ? 'text-blue-600' : 'text-red-600'
                    }`}>{animal.status}</p>
                  </div>
                </div>
                
                {/* Camp Assignment */}
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

                {/* Weight Management - Small and Secondary */}
                <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Scale className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Weight</p>
                        <p className="font-medium text-gray-900">
                          {currentWeight ? `${currentWeight}kg` : 'Not recorded'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowWeightModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      Manage Weight
                    </button>
                  </div>
                </div>

                {/* Primary Actions - Most Important Daily Tasks */}
                {animal.status === 'Active' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('sell')}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                      >
                        <DollarSign className="h-6 w-6" />
                        <span className="text-lg">Mark Sold</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('deceased')}
                        className="bg-red-600 hover:bg-red-700 text-white py-4 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                      >
                        <AlertTriangle className="h-6 w-6" />
                        <span className="text-lg">Mark Deceased</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Secondary Information - Collapsible or Less Prominent */}
                <details className="group">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    Additional Details
                  </summary>
                  <div className="mt-3 space-y-3">
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
                  </div>
                </details>
              </div>
            )}

            {activeTab === 'weight' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Weight Management</h3>
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Weight</span>
                  </button>
                </div>
                
                {currentWeight ? (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg">
                    <p className="text-sm text-emerald-800 dark:text-emerald-200">Current Weight</p>
                    <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{currentWeight}kg</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Scale className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No weight recorded yet</p>
                    <button
                      onClick={() => setShowWeightModal(true)}
                      className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Add First Weight
                    </button>
                  </div>
                )}

                {/* Weight History */}
                {weightRecords.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">Weight History</h4>
                    <div className="space-y-2">
                      {weightRecords.slice().reverse().map((record, index) => (
                        <div key={index} className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-gray-100">{record.weight}kg</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(record.date)}</p>
                            </div>
                            {record.notes && (
                              <p className="text-sm text-gray-600 dark:text-gray-300">{record.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Reports & Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowWeightModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-left"
                  >
                    <BarChart3 className="h-6 w-6 mb-2" />
                    <h4 className="font-semibold">Weight Reports</h4>
                    <p className="text-sm opacity-90">View growth trends and analytics</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-left"
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <h4 className="font-semibold">Event History</h4>
                    <p className="text-sm opacity-90">Complete activity timeline</p>
                  </button>
                </div>
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
      </div>

      {/* Weight Tracking Modal */}
      {showWeightModal && (
        <WeightTrackingModal
          animal={animal}
          onClose={() => setShowWeightModal(false)}
          onUpdate={onUpdate}
        />
      )}

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
    </>
  );
};