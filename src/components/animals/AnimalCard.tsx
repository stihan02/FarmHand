import React from 'react';
import { Animal } from '../../types';
import { calculateAge, formatCurrency, formatDate } from '../../utils/helpers';
import { MoreVertical, Eye, DollarSign, X } from 'lucide-react';

interface AnimalCardProps {
  animal: Animal;
  onViewProfile: (animal: Animal) => void;
  onMarkSold: (animal: Animal) => void;
  onMarkDeceased: (animal: Animal) => void;
  onRemove: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({
  animal,
  onViewProfile,
  onMarkSold,
  onMarkDeceased,
  onRemove
}) => {
  const [showActions, setShowActions] = React.useState(false);

  const statusColors = {
    Active: 'bg-emerald-100 text-emerald-800',
    Sold: 'bg-blue-100 text-blue-800',
    Deceased: 'bg-red-100 text-red-800'
  };

  const typeEmojis = {
    Sheep: '🐑',
    Cattle: '🐄',
    Pig: '🐷'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 relative">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{typeEmojis[animal.type]}</div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Tag #{animal.tagNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {animal.type} • {animal.sex === 'M' ? 'Male' : 'Female'}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-500" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 min-w-[160px]">
              <button
                onClick={() => {
                  onViewProfile(animal);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>View Profile</span>
              </button>
              {animal.status === 'Active' && (
                <>
                  <button
                    onClick={() => {
                      onMarkSold(animal);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>Mark Sold</span>
                  </button>
                  <button
                    onClick={() => {
                      onMarkDeceased(animal);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Mark Deceased</span>
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  onRemove(animal);
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600"
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Color:</span>
          <span className="font-medium">{animal.tagColor || 'Not specified'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Age:</span>
          <span className="font-medium">{calculateAge(animal.birthdate)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Birth Date:</span>
          <span className="font-medium">{formatDate(animal.birthdate)}</span>
        </div>
        {animal.salePrice && animal.salePrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sale Price:</span>
            <span className="font-medium text-green-600">{formatCurrency(animal.salePrice)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[animal.status]}`}>
          {animal.status}
        </span>
        {animal.history.length > 0 && (
          <span className="text-xs text-gray-500">
            {animal.history.length} event{animal.history.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};