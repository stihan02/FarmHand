import React, { useState } from 'react';
import { useFarm } from '../../context/FarmContext';
import { Animal, Camp } from '../../types';
import { AnimalModal } from './AnimalModal';
import { AlertTriangle } from 'lucide-react';

// Helper to calculate age from birthdate
function getAge(birthdate: string): number {
  const birth = new Date(birthdate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper to check inbreeding risk (parents in same camp)
function isInbreedingRisk(animal: Animal, allAnimals: Animal[], camps: Camp[]): boolean {
  if (!animal.campId) return false;
  const mother = allAnimals.find(a => a.tagNumber === animal.motherTag);
  const father = allAnimals.find(a => a.tagNumber === animal.fatherTag);
  return !!(
    (mother && mother.campId === animal.campId) ||
    (father && father.campId === animal.campId)
  );
}

// Helper to check if animal is overdue for movement (in same camp > 90 days)
function isOverdueForMovement(animal: Animal): boolean {
  if (!animal.history || !animal.campId) return false;
  // Find last camp move event
  const moveEvent = [...animal.history].reverse().find(e => e.description.includes('Moved from camp'));
  if (!moveEvent) return false;
  const lastMoveDate = new Date(moveEvent.date);
  const now = new Date();
  const diffDays = (now.getTime() - lastMoveDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays > 90;
}

const AnimalSwipe: React.FC = () => {
  const { state, dispatch } = useFarm();
  const { animals, camps } = state;
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  // Handler to update animal in state
  const handleUpdateAnimal = (updated: Animal) => {
    dispatch({ type: 'UPDATE_ANIMAL', payload: updated });
  };

  // Helper to get camp name by id
  const getCampName = (campId: string | undefined) => {
    if (!campId) return 'Unassigned';
    const camp = camps.find((c: Camp) => c.id === campId);
    return camp ? camp.name : 'Unknown';
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-green-600 text-white px-4 py-3 font-bold text-xl flex items-center sticky top-0 z-10" style={{letterSpacing: '0.5px'}}>
        <span className="mr-2">Animals</span>
        <span className="ml-auto text-xs font-normal opacity-80">{animals.length} total</span>
      </div>
      <ul className="divide-y divide-gray-100">
        {animals.map((animal: Animal) => {
          const inbreeding = isInbreedingRisk(animal, animals, camps);
          const overdue = isOverdueForMovement(animal);
          return (
            <li
              key={animal.id}
              className="flex items-center px-4 py-3 hover:bg-green-50 cursor-pointer transition group relative"
              onClick={() => setSelectedAnimal(animal)}
            >
              {/* WhatsApp-style avatar with tag color and emoji */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mr-4 border-2 border-gray-200 group-hover:border-green-400 transition"
                style={{ backgroundColor: animal.tagColor || '#e5e7eb' }}
              >
                <span className="text-2xl">
                  {animal.type === 'Sheep' ? '🐑' : animal.type === 'Cattle' ? '🐄' : animal.type === 'Pig' ? '🐷' : '🐾'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 text-base">{animal.tagNumber}</span>
                  {/* Alert icons */}
                  <span className="ml-2 flex items-center space-x-1">
                    {inbreeding && (
                      <span title="Inbreeding risk: parent in same camp">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      </span>
                    )}
                    {overdue && (
                      <span title="Overdue for movement (90+ days in camp)">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </span>
                    )}
                  </span>
                </div>
                <div className="text-sm text-gray-600 truncate">
                  {getCampName(animal.campId)} &bull; {animal.sex} &bull; {getAge(animal.birthdate)} yrs
                </div>
              </div>
              {/* Quick action buttons (appear on hover or always on mobile) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                <button
                  className="bg-green-100 hover:bg-green-200 text-green-700 rounded-full px-2 py-1 text-xs font-semibold shadow"
                  onClick={e => { e.stopPropagation(); /* TODO: Move handler */ }}
                >Move</button>
                <button
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full px-2 py-1 text-xs font-semibold shadow"
                  onClick={e => { e.stopPropagation(); /* TODO: Edit handler */ }}
                >Edit</button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs font-semibold shadow"
                  onClick={e => { e.stopPropagation(); /* TODO: History handler */ }}
                >History</button>
              </div>
            </li>
          );
        })}
      </ul>
      {selectedAnimal && (
        <AnimalModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onUpdate={handleUpdateAnimal}
          allAnimals={animals}
        />
      )}
    </div>
  );
};

export default AnimalSwipe; 