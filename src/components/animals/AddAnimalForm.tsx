import React, { useState } from 'react';
import { Animal } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, X } from 'lucide-react';

interface AddAnimalFormProps {
  onAdd: (animal: Animal) => void;
  onClose: () => void;
  existingTags: string[];
  camps: { id: string; name: string }[];
}

const emptyForm = {
  type: 'Sheep' as string,
  breed: '',
    sex: '' as 'M' | 'F' | '',
    tagNumber: '',
    tagColor: '',
    birthdate: '',
    motherTag: '',
  fatherTag: '',
  campId: '',
  otherType: '',
  photoUrl: '',
};

export const AddAnimalForm: React.FC<AddAnimalFormProps> = ({ onAdd, onClose, existingTags, camps }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'type' && value !== 'Other') {
      setForm(prev => ({ ...prev, otherType: '' }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm(prev => ({ ...prev, photoUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (form.type === 'Other' && !form.otherType.trim()) {
      setError('Please specify the animal type.');
      return false;
    }
    if (!form.tagNumber.trim()) {
      setError('Tag number is required.');
      return false;
    }
    if (existingTags.includes(form.tagNumber.trim())) {
      setError('This tag number is already in use.');
      return false;
    }
    if (!form.sex) {
      setError('Please select a sex.');
      return false;
    }
    if (!form.birthdate) {
        setError('Please enter a birthdate.');
        return false;
    }
    // Check if birthdate is in the future
    if (form.birthdate && new Date(form.birthdate) > new Date()) {
      setError('Birth date cannot be in the future.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const animalType = form.type === 'Other' ? form.otherType : form.type;

    const newAnimal: Animal = {
      id: generateId(),
      type: animalType,
      breed: form.breed,
      sex: form.sex as 'M' | 'F',
      tagNumber: form.tagNumber.trim(),
      tagColor: form.tagColor,
      birthdate: form.birthdate,
      campId: form.campId,
      status: 'Active',
      motherTag: form.motherTag,
      fatherTag: form.fatherTag,
      offspringTags: [],
      genetics: { traits: {}, lineage: [], notes: '', animalTagNumbers: [] },
      health: [],
      weightRecords: [],
      history: [],
      photoUrl: form.photoUrl || undefined,
    };
    // Remove undefined fields before passing to onAdd
    function removeUndefinedFields(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(removeUndefinedFields);
      } else if (obj && typeof obj === 'object') {
        return Object.entries(obj)
          .filter(([_, v]) => v !== undefined)
          .reduce((acc, [k, v]) => {
            acc[k] = removeUndefinedFields(v);
            return acc;
          }, {} as any);
      }
      return obj;
    }
    onAdd(removeUndefinedFields(newAnimal));
    setForm(emptyForm);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Add New Animal</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1.5 rounded-md mb-2" role="alert">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
            <select
                id="type"
                name="type"
                value={form.type}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
                <option>Sheep</option>
                <option>Cattle</option>
                <option>Pig</option>
                <option>Other</option>
            </select>
              {form.type === 'Other' && (
                <input
                  type="text"
                  name="otherType"
                  value={form.otherType}
                  onChange={handleInputChange}
                  className="mt-2 block w-full pl-2 pr-3 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                  placeholder="Specify type..."
                />
              )}
          </div>

          <div>
              <label htmlFor="tagNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tag Number</label>
              <input
                type="text"
                id="tagNumber"
                name="tagNumber"
                value={form.tagNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sex</label>
            <select
                id="sex"
                name="sex"
                value={form.sex}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            >
                <option value="">Select Sex</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          <div>
              <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Birth Date</label>
            <input
                type="date"
                id="birthdate"
                name="birthdate"
                value={form.birthdate}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              />
          </div>

          <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Breed (Optional)</label>
            <input
              type="text"
                id="breed"
                name="breed"
                value={form.breed}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>

          <div>
              <label htmlFor="tagColor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tag Color (Optional)</label>
            <input
                type="text"
                id="tagColor"
                name="tagColor"
                value={form.tagColor}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              />
          </div>

          <div>
              <label htmlFor="motherTag" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mother Tag (Optional)</label>
            <input
              type="text"
                id="motherTag"
                name="motherTag"
                value={form.motherTag}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>

          <div>
              <label htmlFor="fatherTag" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Father Tag (Optional)</label>
            <input
              type="text"
                id="fatherTag"
                name="fatherTag"
                value={form.fatherTag}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
            />
          </div>

          <div>
              <label htmlFor="campId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Camp</label>
              <select
                id="campId"
                name="campId"
                value={form.campId}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-2 pr-8 py-1.5 text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              >
                <option value="">Select Camp</option>
                {camps.map(camp => (
                  <option key={camp.id} value={camp.id}>{camp.name}</option>
                ))}
              </select>
          </div>
            
        </div>

        {/* Photo upload */}
        <div>
          <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo (Optional)</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            className="mt-1 block w-full text-sm text-gray-700 dark:text-gray-300"
          />
          {form.photoUrl && (
            <img src={form.photoUrl} alt="Preview" className="mt-2 rounded max-h-32 object-contain border" />
          )}
        </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          <button
            type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
          >
            Add Animal
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};