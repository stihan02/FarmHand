import React, { useState, useRef, useEffect } from 'react';
import { Animal } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, X, Trash2, Edit2, Check, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useFarm } from '../../context/FarmContext';

interface AddAnimalFormProps {
  onAdd: (animals: Animal[]) => void;
  existingTags: string[];
}

const emptyForm = () => ({
  type: '' as string,
  breed: '',
  sex: '' as 'M' | 'F' | '',
  tagNumber: '',
  tagColor: '',
  birthdate: '',
  motherTag: '',
  fatherTag: '',
  camp: '',
});

export const AddAnimalForm: React.FC<AddAnimalFormProps> = ({ onAdd, existingTags }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [forms, setForms] = useState([emptyForm()]);
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({});
  const [batch, setBatch] = useState<typeof forms>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);
  const formRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sequentialPrefix, setSequentialPrefix] = useState('');
  const [startNumber, setStartNumber] = useState(1);
  const [numberCount, setNumberCount] = useState(1);
  const [customTypes, setCustomTypes] = useState<Record<number, string>>({});
  const { state: farmState, dispatch } = useFarm();
  const [campSelections, setCampSelections] = useState<Record<number, string>>({});
  const [addingCampIdx, setAddingCampIdx] = useState<number | null>(null);
  const [newCampName, setNewCampName] = useState('');
  const [campDropdownOpen, setCampDropdownOpen] = useState(false);
  const [renamingCamp, setRenamingCamp] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Autofocus first field of the last form
  useEffect(() => {
    if (isOpen && forms.length > 0) {
      setTimeout(() => {
        formRefs.current[forms.length - 1]?.focus();
      }, 100);
    }
  }, [forms.length, isOpen]);

  const handleInputChange = (idx: number, field: string, value: string) => {
    if (field === 'type' && value === 'Other') {
      setCustomTypes(prev => ({ ...prev, [idx]: '' }));
    } else if (field === 'type' && customTypes[idx]) {
      setCustomTypes(prev => {
        const newTypes = { ...prev };
        delete newTypes[idx];
        return newTypes;
      });
    }
    setForms(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
    if (errors[idx]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [idx]: { ...prev[idx], [field]: '' }
      }));
    }
  };

  const handleCustomTypeChange = (idx: number, value: string) => {
    setCustomTypes(prev => ({ ...prev, [idx]: value }));
  };

  const handleCampChange = (idx: number, value: string) => {
    if (value === '__add__') {
      setAddingCampIdx(idx);
      setNewCampName('');
    } else {
      setCampSelections(prev => ({ ...prev, [idx]: value }));
      if (addingCampIdx === idx) setAddingCampIdx(null);
    }
    if (errors[idx]?.camp) {
      setErrors(prev => ({
        ...prev,
        [idx]: { ...prev[idx], camp: '' }
      }));
    }
  };

  const handleAddCamp = (idx: number) => {
    if (newCampName.trim() && !farmState.camps.includes(newCampName.trim())) {
      dispatch({ type: 'ADD_CAMP', payload: newCampName.trim() });
      setCampSelections(prev => ({ ...prev, [idx]: newCampName.trim() }));
      setAddingCampIdx(null);
      setNewCampName('');
    }
  };

  const handleRenameCamp = (camp: string) => {
    if (renameValue.trim() && camp !== renameValue.trim() && !farmState.camps.includes(renameValue.trim())) {
      dispatch({ type: 'RENAME_CAMP', payload: { oldName: camp, newName: renameValue.trim() } });
      setRenamingCamp(null);
      setRenameValue('');
    }
  };

  const handleDeleteCamp = (camp: string) => {
    if (farmState.camps.length > 1) {
      dispatch({ type: 'DELETE_CAMP', payload: camp });
      setDeleteConfirm(null);
    }
  };

  const validateForm = (form: typeof forms[0], idx: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.type) newErrors.type = 'Type is required';
    if (form.type === 'Other' && !customTypes[idx]) newErrors.type = 'Custom type is required';
    if (!form.sex) newErrors.sex = 'Sex is required';
    if (!form.tagNumber) newErrors.tagNumber = 'Tag number is required';
    if (!form.birthdate) newErrors.birthdate = 'Birth date is required';
    if (!campSelections[idx]) newErrors.camp = 'Camp is required';
    if (form.tagNumber && (existingTags.includes(form.tagNumber) || batch.some((a, i) => a.tagNumber === form.tagNumber && i !== idx))) {
      newErrors.tagNumber = 'Tag number already exists';
    }
    setErrors(prev => ({ ...prev, [idx]: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleAddForm = () => {
    setForms(prev => [...prev, emptyForm()]);
  };

  const handleRemoveForm = (idx: number) => {
    setForms(prev => prev.filter((_, i) => i !== idx));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[idx];
      return newErrors;
    });
  };

  const handleAddToBatch = (idx: number) => {
    if (!validateForm(forms[idx], idx)) {
      // Scroll to first error
      setTimeout(() => {
        const el = document.querySelector(`[data-form-idx='${idx}'] .border-red-500`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    setBatch(prev => [...prev, {
      ...forms[idx],
      type: forms[idx].type === 'Other' ? customTypes[idx] || 'Other' : forms[idx].type,
      camp: campSelections[idx] || farmState.camps[0] // fallback to first camp
    }]);
    setForms([emptyForm()]);
    setErrors({});
    setCustomTypes({});
    setCampSelections({});
  };

  const handleEditBatch = (idx: number) => {
    const animal = batch[idx];
    setEditingIdx(idx);
    if (animal.type !== 'Sheep' && animal.type !== 'Cattle' && animal.type !== 'Pig') {
      setCustomTypes({ 0: animal.type });
      setForms([{ ...animal, type: 'Other' }]);
    } else {
      setForms([animal]);
    }
    setCampSelections({ 0: animal.camp });
  };

  const handleSaveEdit = () => {
    if (!validateForm(forms[0], 0)) {
      setTimeout(() => {
        const el = document.querySelector(`[data-form-idx='0'] .border-red-500`);
        if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    setBatch(prev => prev.map((a, i) => i === editingIdx ? { ...forms[0], camp: campSelections[0] || farmState.camps[0] } : a));
    setForms([emptyForm()]);
    setEditingIdx(null);
    setErrors({});
    setCampSelections({});
  };

  const handleRemoveBatch = (idx: number) => {
    setBatch(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all forms in batch and current
    let allValid = true;
    forms.forEach((form, idx) => {
      if (!validateForm(form, idx)) allValid = false;
    });
    if (forms.length && !validateForm(forms[0], 0)) allValid = false;
    if (!allValid) {
      setTimeout(() => {
        const el = document.querySelector('.border-red-500');
        if (el) (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }
    const newAnimals: Animal[] = [
      ...batch,
      ...forms.filter(form => form.type && form.sex && form.tagNumber && form.birthdate)
    ].map((form, idx) => ({
      id: generateId(),
      type: form.type === 'Other' ? customTypes[forms.indexOf(form)] || 'Other' : form.type,
      breed: form.breed,
      sex: form.sex as 'M' | 'F',
      tagNumber: form.tagNumber,
      tagColor: form.tagColor,
      birthdate: form.birthdate,
      camp: campSelections[idx] || farmState.camps[0],
      status: 'Active',
      motherTag: form.motherTag,
      fatherTag: form.fatherTag,
      offspringTags: [],
      genetics: {
        traits: {},
        lineage: [],
        notes: ''
      },
      health: [],
      history: []
    }));
    if (newAnimals.length === 0) return;
    onAdd(newAnimals);
    setIsOpen(false);
    setForms([emptyForm()]);
    setBatch([]);
    setErrors({});
    setCustomTypes({});
    setCampSelections({});
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const generateSequentialNumbers = () => {
    if (!sequentialPrefix) return;
    
    const newForms = Array.from({ length: numberCount }, (_, i) => ({
      ...emptyForm(),
      tagNumber: `${sequentialPrefix}${(startNumber + i).toString().padStart(2, '0')}`
    }));
    
    setForms(newForms);
  };

  const animalTypes = [
    { value: 'Sheep', label: 'Sheep' },
    { value: 'Cattle', label: 'Cattle' },
    { value: 'Pig', label: 'Pig' },
    { value: 'Goat', label: 'Goat' },
    { value: 'Angora', label: 'Angora' },
    { value: 'Game', label: 'Game' }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
      >
        <Plus className="h-5 w-5" />
        <span>Add Animal</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-zinc-700">
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Add New Animal</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setForms([emptyForm()]);
                  setBatch([]);
                  setErrors({});
                  setCustomTypes({});
                  setCampSelections({});
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-2 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 5rem)' }}>
              <form onSubmit={handleSubmit} className="space-y-2">
                {/* Sequential Generator - Collapsed by default */}
                <details className="bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs">
                  <summary className="p-2 font-medium text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-700">
                    Sequential Number Generator
                  </summary>
                  <div className="p-2 border-t border-gray-200 dark:border-zinc-700">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prefix</label>
                        <input
                          type="text"
                          value={sequentialPrefix}
                          onChange={(e) => setSequentialPrefix(e.target.value)}
                          placeholder="A"
                          className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Start #</label>
                        <input
                          type="number"
                          value={startNumber}
                          onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                          min="1"
                          className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Count</label>
                        <input
                          type="number"
                          value={numberCount}
                          onChange={(e) => setNumberCount(parseInt(e.target.value) || 1)}
                          min="1"
                          max="10"
                          className="w-full px-2 py-1 text-xs border rounded dark:bg-zinc-900 dark:border-zinc-700 dark:text-gray-200"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={generateSequentialNumbers}
                      className="w-full mt-2 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs transition-colors"
                    >
                      Generate
                    </button>
                  </div>
                </details>

                {batch.length > 0 && (
                  <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 p-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-700 dark:text-gray-200">Batch ({batch.length})</h4>
                      <button
                        type="button"
                        onClick={() => setBatch([])}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="space-y-1">
                      {batch.map((animal, idx) => (
                        <div key={idx} className="flex items-center text-xs bg-white dark:bg-zinc-900 rounded border border-gray-200 dark:border-zinc-700 px-1.5 py-1">
                          <span className="flex-1 truncate">
                            <span className="font-medium">{animal.type}</span> #{animal.tagNumber} • {animal.sex}
                          </span>
                          <div className="flex items-center space-x-1 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEditBatch(idx)}
                              className="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                              disabled={editingIdx !== null}
                            >
                              <Edit2 className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveBatch(idx)}
                              className="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                              disabled={editingIdx !== null}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {forms.map((form, idx) => (
                  <div key={idx} data-form-idx={idx} className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Type *
                        </label>
                        {form.type === 'Other' ? (
                          <div className="space-y-1">
                            <select
                              value={form.type}
                              onChange={(e) => handleInputChange(idx, 'type', e.target.value)}
                              className={`w-full px-2 py-1 rounded-lg border ${
                                errors[idx]?.type
                                  ? 'border-red-500 dark:border-red-500'
                                  : 'border-gray-300 dark:border-zinc-700'
                              } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                            >
                              <option value="">Select type</option>
                              <option value="Sheep">Sheep</option>
                              <option value="Cattle">Cattle</option>
                              <option value="Pig">Pig</option>
                              <option value="Other">Other...</option>
                            </select>
                            <input
                              type="text"
                              value={customTypes[idx] || ''}
                              onChange={(e) => handleCustomTypeChange(idx, e.target.value)}
                              placeholder="Enter animal type"
                              className={`w-full px-2 py-1 rounded-lg border ${
                                errors[idx]?.type
                                  ? 'border-red-500 dark:border-red-500'
                                  : 'border-gray-300 dark:border-zinc-700'
                              } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                            />
                          </div>
                        ) : (
                          <select
                            value={form.type}
                            onChange={(e) => handleInputChange(idx, 'type', e.target.value)}
                            className={`w-full px-2 py-1 rounded-lg border ${
                              errors[idx]?.type
                                ? 'border-red-500 dark:border-red-500'
                                : 'border-gray-300 dark:border-zinc-700'
                            } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                          >
                            <option value="">Select type</option>
                            <option value="Sheep">Sheep</option>
                            <option value="Cattle">Cattle</option>
                            <option value="Pig">Pig</option>
                            <option value="Other">Other...</option>
                          </select>
                        )}
                        {errors[idx]?.type && (
                          <p className="mt-0.5 text-xs text-red-500">{errors[idx].type}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Sex *
                        </label>
                        <select
                          value={form.sex}
                          onChange={(e) => handleInputChange(idx, 'sex', e.target.value)}
                          className={`w-full px-2 py-1 rounded-lg border ${
                            errors[idx]?.sex
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-zinc-700'
                          } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                        >
                          <option value="">Select sex</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                        {errors[idx]?.sex && (
                          <p className="mt-0.5 text-xs text-red-500">{errors[idx].sex}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Tag Number *
                        </label>
                        <input
                          type="text"
                          value={form.tagNumber}
                          onChange={(e) => handleInputChange(idx, 'tagNumber', e.target.value)}
                          ref={(el) => formRefs.current[idx] = el}
                          className={`w-full px-2 py-1 rounded-lg border ${
                            errors[idx]?.tagNumber
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-zinc-700'
                          } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                        />
                        {errors[idx]?.tagNumber && (
                          <p className="mt-0.5 text-xs text-red-500">{errors[idx].tagNumber}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Tag Color
                        </label>
                        <input
                          type="color"
                          value={form.tagColor}
                          onChange={(e) => handleInputChange(idx, 'tagColor', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Birth Date *
                        </label>
                        <input
                          type="date"
                          value={form.birthdate}
                          onChange={(e) => handleInputChange(idx, 'birthdate', e.target.value)}
                          className={`w-full px-2 py-1 rounded-lg border ${
                            errors[idx]?.birthdate
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-zinc-700'
                          } focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                        />
                        {errors[idx]?.birthdate && (
                          <p className="mt-0.5 text-xs text-red-500">{errors[idx].birthdate}</p>
                        )}
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Breed
                        </label>
                        <input
                          type="text"
                          value={form.breed}
                          onChange={(e) => handleInputChange(idx, 'breed', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Mother Tag
                        </label>
                        <input
                          type="text"
                          value={form.motherTag}
                          onChange={(e) => handleInputChange(idx, 'motherTag', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Father Tag
                        </label>
                        <input
                          type="text"
                          value={form.fatherTag}
                          onChange={(e) => handleInputChange(idx, 'fatherTag', e.target.value)}
                          className="w-full px-2 py-1 rounded-lg border border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-0.5">
                          Camp *
                        </label>
                        <button
                          type="button"
                          className="ml-2 text-xs text-gray-500 hover:text-emerald-600 flex items-center"
                          onClick={() => setCampDropdownOpen((open) => !open)}
                          tabIndex={-1}
                        >
                          <MoreHorizontal className="h-4 w-4 mr-1" /> Manage Camps
                        </button>
                      </div>
                      <div className="relative">
                        {campDropdownOpen && (
                          <div className="absolute right-0 z-30 mt-1 w-56 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg p-2 text-xs">
                            <div className="font-semibold mb-1 text-gray-700 dark:text-gray-200">Manage Camps</div>
                            {farmState.camps.map((camp) => (
                              <div key={camp} className="flex items-center justify-between py-1">
                                {renamingCamp === camp ? (
                                  <>
                                    <input
                                      type="text"
                                      value={renameValue}
                                      onChange={e => setRenameValue(e.target.value)}
                                      className="w-24 px-1 py-0.5 rounded border border-gray-300 dark:border-zinc-700 text-xs dark:bg-zinc-800 dark:text-gray-200"
                                    />
                                    <button
                                      className="ml-1 text-emerald-600 hover:text-emerald-800"
                                      onClick={() => handleRenameCamp(camp)}
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="ml-1 text-gray-400 hover:text-gray-600"
                                      onClick={() => { setRenamingCamp(null); setRenameValue(''); }}
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <span className="truncate max-w-[80px]">{camp}</span>
                                    <div className="flex items-center">
                                      <button
                                        className="ml-1 text-blue-500 hover:text-blue-700"
                                        onClick={() => { setRenamingCamp(camp); setRenameValue(camp); }}
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </button>
                                      <button
                                        className="ml-1 text-red-500 hover:text-red-700"
                                        onClick={() => setDeleteConfirm(camp)}
                                        disabled={farmState.camps.length === 1}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                            {deleteConfirm && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-zinc-800 border border-red-200 dark:border-red-700 rounded">
                                <div className="text-xs text-red-700 dark:text-red-300 mb-1">Delete camp '{deleteConfirm}'? Animals will be moved to the first camp.</div>
                                <div className="flex justify-end space-x-2">
                                  <button
                                    className="px-2 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                    onClick={() => handleDeleteCamp(deleteConfirm)}
                                  >
                                    Delete
                                  </button>
                                  <button
                                    className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-zinc-600"
                                    onClick={() => setDeleteConfirm(null)}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {addingCampIdx === idx ? (
                          <div className="flex space-x-1">
                            <input
                              type="text"
                              value={newCampName}
                              onChange={e => setNewCampName(e.target.value)}
                              placeholder="Enter new camp name"
                              className={`w-full px-2 py-1 rounded-lg border ${errors[idx]?.camp ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-zinc-700'} focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCamp(idx)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingCampIdx(null)}
                              className="px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <select
                            value={campSelections[idx] || ''}
                            onChange={e => handleCampChange(idx, e.target.value)}
                            className={`w-full px-2 py-1 rounded-lg border ${errors[idx]?.camp ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-zinc-700'} focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-zinc-900 dark:text-gray-200 text-xs`}
                          >
                            <option value="">Select camp</option>
                            {farmState.camps.map(camp => (
                              <option key={camp} value={camp}>{camp}</option>
                            ))}
                            <option value="__add__">+ Add new camp...</option>
                          </select>
                        )}
                      </div>
                      {errors[idx]?.camp && (
                        <p className="mt-0.5 text-xs text-red-500">{errors[idx].camp}</p>
                      )}
                    </div>

                    <div className="flex justify-between pt-1">
                      {forms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveForm(idx)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddToBatch(idx)}
                        className="ml-auto text-emerald-600 hover:text-emerald-700 text-xs"
                      >
                        Add to Batch
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={handleAddForm}
                    className="text-emerald-600 hover:text-emerald-700 text-xs"
                  >
                    + Add Another
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-xs"
                  >
                    Save All
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};