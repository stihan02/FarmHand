import React from 'react';
import { Animal } from '../../types';
import { calculateAge, formatCurrency, formatDate } from '../../utils/helpers';
import { MoreVertical, Eye, DollarSign, X, Scale, TrendingUp, TrendingDown } from 'lucide-react';

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
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Sold: 'bg-blue-100 text-blue-800 border-blue-200',
    Deceased: 'bg-red-100 text-red-800 border-red-200'
  };

  const typeEmojis: Record<string, string> = {
    Sheep: '🐑',
    Cattle: '🐄',
    Pig: '🐷'
  };

  // Extract current weight from history
  const weightEntries = animal.history
    .filter(event => event.description.includes('Weight:'))
    .map(event => {
      const weightMatch = event.description.match(/Weight: ([\d.]+)/);
      return weightMatch ? parseFloat(weightMatch[1]) : 0;
    })
    .sort((a, b) => b - a);

  const currentWeight = weightEntries.length > 0 ? weightEntries[0] : null;
  const previousWeight = weightEntries.length > 1 ? weightEntries[1] : null;
  const weightChange = currentWeight && previousWeight ? currentWeight - previousWeight : null;

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 relative overflow-hidden">
      {/* Premium gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header with premium styling */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="text-3xl bg-gradient-to-br from-emerald-100 to-emerald-200 p-3 rounded-xl shadow-sm">
              {typeEmojis[animal.type]}
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-emerald-900 transition-colors">
                Tag #{animal.tagNumber}
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                {animal.type} • {animal.sex === 'M' ? 'Male' : 'Female'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {calculateAge(animal.birthdate)} • {animal.tagColor || 'No color'}
              </p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group-hover:bg-emerald-50"
            >
              <MoreVertical className="h-4 w-4 text-gray-500 group-hover:text-emerald-600" />
            </button>
            
            {showActions && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-10 min-w-[180px] backdrop-blur-sm">
                <button
                  onClick={() => {
                    onViewProfile(animal);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-emerald-50 flex items-center space-x-3 transition-colors"
                >
                  <Eye className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium">View Profile</span>
                </button>
                {animal.status === 'Active' && (
                  <>
                    <button
                      onClick={() => {
                        onMarkSold(animal);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center space-x-3 transition-colors"
                    >
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Mark Sold</span>
                    </button>
                    <button
                      onClick={() => {
                        onMarkDeceased(animal);
                        setShowActions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                    >
                      <X className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Mark Deceased</span>
                    </button>
                  </>
                )}
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => {
                    onRemove(animal);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 flex items-center space-x-3 transition-colors text-red-600"
                >
                  <X className="h-4 w-4" />
                  <span className="font-medium">Remove</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Premium Weight Display */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <Scale className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-800">Current Weight</p>
                <p className="text-2xl font-bold text-emerald-900">
                  {currentWeight ? `${currentWeight}kg` : 'Not recorded'}
                </p>
              </div>
            </div>
            {weightChange !== null && (
              <div className="flex items-center space-x-2">
                {weightChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : weightChange < 0 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
                <span className={`text-sm font-semibold ${
                  weightChange > 0 ? 'text-green-600' : weightChange < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Key Information Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Birth Date</p>
            <p className="font-semibold text-gray-900">{formatDate(animal.birthdate)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Age</p>
            <p className="font-semibold text-gray-900">{calculateAge(animal.birthdate)}</p>
          </div>
        </div>

        {/* Status and Actions */}
        <div className="flex justify-between items-center">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${statusColors[animal.status]}`}>
            {animal.status}
          </span>
          <div className="flex items-center space-x-2">
            {animal.history.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {animal.history.length} event{animal.history.length !== 1 ? 's' : ''}
              </span>
            )}
            {animal.salePrice && animal.salePrice > 0 && (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                {formatCurrency(animal.salePrice)}
              </span>
            )}
          </div>
        </div>

        {/* Premium hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  );
};