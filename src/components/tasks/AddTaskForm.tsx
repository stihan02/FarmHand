import React, { useState } from 'react';
import { Task } from '../../types';
import { generateId } from '../../utils/helpers';
import { Plus, X } from 'lucide-react';
import { useToast } from '../ToastContext';

interface AddTaskFormProps {
  onAdd: (task: Task) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    dueDate: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast({ type: 'error', message: 'Please fill in all required fields.' });
      return;
    }

    const newTask: Task = {
      id: generateId(),
      description: formData.description,
      dueDate: formData.dueDate,
      status: 'Pending'
    };

    onAdd(newTask);
    showToast({ type: 'success', message: 'Task added.' });
    setIsOpen(false);
    setFormData({
      description: '',
      dueDate: ''
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors font-medium"
      >
        <Plus className="h-5 w-5" />
        <span>Add Task</span>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg text-gray-900">Add New Task</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter task description"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date *
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Add Task
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};