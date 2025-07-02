import React from 'react';
import { Animal } from '../../types';
import { formatDate } from '../../utils/helpers';

interface AnimalAIAssistantProps {
  animal: Animal;
  allAnimals: Animal[];
}

export const AnimalAIAssistant: React.FC<AnimalAIAssistantProps> = ({ animal, allAnimals }) => {
  const suggestions: string[] = [];

  // Health: Example - overdue vaccination (assume event in history)
  const lastVaccination = animal.history
    .filter(e => e.description.toLowerCase().includes('vaccin'))
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (!lastVaccination) {
    suggestions.push('No vaccination record found. Consider scheduling a vaccination.');
  } else {
    const lastDate = new Date(lastVaccination.date);
    const now = new Date();
    const diffDays = (now.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays > 365) {
      suggestions.push('Last vaccination was over a year ago. Schedule a new vaccination.');
    }
  }

  // Breeding: Example - optimal breeding window (assume female, age > 1 year)
  if (animal.sex === 'F' && animal.status === 'Active') {
    const birthDate = new Date(animal.birthdate);
    const now = new Date();
    const ageYears = (now.getTime() - birthDate.getTime()) / (1000 * 3600 * 24 * 365.25);
    if (ageYears > 1 && !animal.history.some(e => e.description.toLowerCase().includes('bred'))) {
      suggestions.push('This female is of breeding age and has not been bred yet. Consider scheduling breeding.');
    }
  }

  // Genetics: Example - warn if close relatives are in same camp
  if (animal.campId) {
    const relatives = allAnimals.filter(a =>
      (a.motherTag === animal.motherTag || a.fatherTag === animal.fatherTag) &&
      a.tagNumber !== animal.tagNumber &&
      a.campId === animal.campId
    );
    if (relatives.length > 0) {
      suggestions.push('Potential inbreeding risk: close relatives are in the same camp.');
    }
  }

  // Genetics: Suggest genetic diversity if many animals share same parents
  if (animal.motherTag && animal.fatherTag) {
    const siblings = allAnimals.filter(a =>
      a.motherTag === animal.motherTag &&
      a.fatherTag === animal.fatherTag &&
      a.tagNumber !== animal.tagNumber
    );
    if (siblings.length > 3) {
      suggestions.push('Many siblings detected. Consider introducing new genetics for diversity.');
    }
  }

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-2">
      <h3 className="font-semibold text-emerald-700 mb-2">AI Suggestions</h3>
      {suggestions.length === 0 ? (
        <p className="text-gray-600">No actionable suggestions at this time.</p>
      ) : (
        <ul className="list-disc pl-5 space-y-1">
          {suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}; 