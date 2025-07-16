import React, { useState } from 'react';
import { PawPrint, Users, Map, Package, DollarSign, Check, ArrowRight, ArrowLeft, Home, Plus, Calendar, TrendingUp } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Animal, Camp } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const onboardingSteps = [
  {
    id: 'welcome',
    title: 'Welcome to HerdWise! 🎉',
    subtitle: 'Your farm management journey starts here',
    icon: Home,
    description: 'Let\'s get your farm set up in just a few minutes. We\'ll guide you through adding your first animals and camps.'
  },
  {
    id: 'farm-info',
    title: 'Tell us about your farm',
    subtitle: 'This helps us customize your experience',
    icon: PawPrint,
    description: 'What type of farming do you do? This helps us show you the most relevant features and sample data.'
  },
  {
    id: 'add-animals',
    title: 'Add your first animals',
    subtitle: 'Start tracking your livestock',
    icon: Users,
    description: 'We\'ll add some sample animals to show you how tracking works. You can replace them with your real livestock or add more animals.'
  },
  {
    id: 'create-camps',
    title: 'Set up grazing camps',
    subtitle: 'Organize your grazing areas',
    icon: Map,
    description: 'We\'ll add example camps to show you how to organize grazing areas. You can customize them for your actual farm layout.'
  },
  {
    id: 'features',
    title: 'Discover powerful features',
    subtitle: 'See what HerdWise can do for you',
    icon: TrendingUp,
    description: 'Learn about the key features that will help you manage your farm more efficiently and profitably.'
  },
  {
    id: 'complete',
    title: 'You\'re all set! 🚀',
    subtitle: 'Your farm is ready to go',
    icon: Check,
    description: 'Your farm is set up and ready! Start exploring the features and add your real farm data when you\'re ready.'
  }
];

const farmTypes = [
  { id: 'cattle', label: 'Cattle Farming', icon: '🐄', description: 'Beef or dairy cattle operations' },
  { id: 'sheep', label: 'Sheep Farming', icon: '🐑', description: 'Wool or meat sheep operations' },
  { id: 'goats', label: 'Goat Farming', icon: '🐐', description: 'Dairy or meat goat operations' },
  { id: 'pigs', label: 'Pig Farming', icon: '🐷', description: 'Pork production' },
  { id: 'mixed', label: 'Mixed Farming', icon: '🏡', description: 'Multiple types of livestock' },
  { id: 'other', label: 'Other', icon: '🐾', description: 'Other types of livestock' }
];

const sampleAnimals = [
  { type: 'Cattle', tagNumber: 'C001', breed: 'Angus', sex: 'F' as const, status: 'Active' as const },
  { type: 'Cattle', tagNumber: 'C002', breed: 'Hereford', sex: 'M' as const, status: 'Active' as const },
  { type: 'Sheep', tagNumber: 'S001', breed: 'Merino', sex: 'F' as const, status: 'Active' as const },
  { type: 'Goat', tagNumber: 'G001', breed: 'Boer', sex: 'F' as const, status: 'Active' as const }
];

const sampleCamps = [
  { name: 'North Pasture', area: '50 acres' },
  { name: 'South Field', area: '30 acres' },
  { name: 'Hay Field', area: '20 acres' }
];

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete, onSkip }) => {
  const { state, dispatch } = useFarm();
  const [currentStep, setCurrentStep] = useState(0);
  const [farmType, setFarmType] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [selectedCamps, setSelectedCamps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const currentStepData = onboardingSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const handleNext = async () => {
    if (isLastStep) {
      await handleComplete();
      return;
    }

    // Handle step-specific actions
    if (currentStepData.id === 'add-animals' && selectedAnimals.length > 0) {
      await addSampleAnimals();
    }
    
    if (currentStepData.id === 'create-camps' && selectedCamps.length > 0) {
      await addSampleCamps();
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Save onboarding completion to localStorage with user-specific key
    // We'll get the user ID from the parent component
    const userId = localStorage.getItem('currentUserId') || 'default';
    localStorage.setItem(`onboardingCompleted_${userId}`, 'true');
    localStorage.setItem(`onboardingCompletedDate_${userId}`, new Date().toISOString());
    
    // Add any remaining selected items
    if (selectedAnimals.length > 0) {
      await addSampleAnimals();
    }
    if (selectedCamps.length > 0) {
      await addSampleCamps();
    }
    
    setIsLoading(false);
    onComplete();
  };

  const addSampleAnimals = async () => {
    const animalsToAdd = sampleAnimals.filter((_, index) => selectedAnimals.includes(index.toString()));
    
    animalsToAdd.forEach(animal => {
      // Generate a realistic birthdate (1-3 years ago)
      const yearsAgo = Math.floor(Math.random() * 3) + 1;
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - yearsAgo);
      birthdate.setMonth(Math.floor(Math.random() * 12));
      birthdate.setDate(Math.floor(Math.random() * 28) + 1);
      
      const newAnimal: Animal = {
        id: uuidv4(),
        tagNumber: animal.tagNumber,
        type: animal.type,
        breed: animal.breed,
        sex: animal.sex,
        status: animal.status,
        birthdate: birthdate.toISOString().split('T')[0],
        tagColor: 'White',
        campId: '',
        position: undefined,
        offspringTags: [],
        genetics: {
          traits: {},
          lineage: [],
          notes: '',
          animalTagNumbers: []
        },
        health: [],
        weightRecords: [],
        history: [{
          date: new Date().toISOString().split('T')[0],
          description: 'Added as sample animal during onboarding'
        }]
      };
      dispatch({ type: 'ADD_ANIMAL', payload: newAnimal });
    });
  };

  const addSampleCamps = async () => {
    const campsToAdd = sampleCamps.filter((_, index) => selectedCamps.includes(index.toString()));
    
    campsToAdd.forEach(camp => {
      const newCamp: Camp = {
        id: uuidv4(),
        name: camp.name,
        geoJson: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [0, 0]
          }
        },
        animals: []
      };
      dispatch({ type: 'ADD_CAMP', payload: newCamp });
    });
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <PawPrint className="w-12 h-12 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Welcome to HerdWise! 🎉</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your farm management journey starts here. We'll guide you through setting up your farm 
                with sample data so you can see how everything works.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 We'll add sample animals and camps to demonstrate the features. You can replace them with your real farm data anytime!
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        );

      case 'farm-info':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">What type of farming do you do?</h3>
              <p className="text-gray-600">This helps us customize your experience</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {farmTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFarmType(type.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    farmType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-900">{type.label}</div>
                      <div className="text-sm text-gray-600">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'add-animals':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Add sample animals (for demonstration)</h3>
              <p className="text-gray-600">These are EXAMPLE animals to show you how the app works. You can add your real animals later.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">💡 Demo Mode: These are sample animals to help you explore the features</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleAnimals.map((animal, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSelection = selectedAnimals.includes(index.toString())
                      ? selectedAnimals.filter(i => i !== index.toString())
                      : [...selectedAnimals, index.toString()];
                    setSelectedAnimals(newSelection);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnimals.includes(index.toString())
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">SAMPLE</span>
                        {animal.type} #{animal.tagNumber}
                      </div>
                      <div className="text-sm text-gray-600">{animal.breed} • {animal.sex}</div>
                    </div>
                    <div className="text-2xl">
                      {animal.type === 'Cattle' ? '🐄' : animal.type === 'Sheep' ? '🐑' : '🐐'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setSelectedAnimals(sampleAnimals.map((_, i) => i.toString()))}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Select all samples
              </button>
            </div>
          </div>
        );

      case 'create-camps':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Set up sample grazing camps (for demonstration)</h3>
              <p className="text-gray-600">These are EXAMPLE camps to show you how camp management works. You can add your real camps later.</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">💡 Demo Mode: These are sample camps to help you explore the features</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sampleCamps.map((camp, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSelection = selectedCamps.includes(index.toString())
                      ? selectedCamps.filter(i => i !== index.toString())
                      : [...selectedCamps, index.toString()];
                    setSelectedCamps(newSelection);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedCamps.includes(index.toString())
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">SAMPLE</span>
                      {camp.name}
                    </div>
                    <div className="text-sm text-gray-600">{camp.area}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Discover key features</h3>
              <p className="text-gray-600">Here's what makes HerdWise powerful for farm management</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Animal Tracking</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Track individual animals with detailed records, weight history, and health events.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Map className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Camp Management</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Organize grazing areas and track animal movements between camps.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="w-6 h-6 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900">Inventory & Finances</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Track feed, medicine, and farm expenses with simple tools.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Analytics & Reports</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Get insights into your farm performance with detailed reports and charts.
                </p>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">You're all set! 🚀</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your farm is ready to go! We've added sample animals and camps so you can explore all the features. 
                Start managing your farm like a pro!
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3">What's next?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Add your real livestock</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Set up your grazing camps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Create tasks and reminders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Track weight and health</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                💡 Pro tip: Use the "Quick Actions" on your dashboard to add animals, transactions, and tasks in just one click!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <PawPrint className="w-8 h-8 text-blue-600" />
              <div>
                <span className="text-xl font-bold text-gray-900">HerdWise Setup</span>
                <div className="text-xs text-blue-600 font-medium">DEMO MODE - Sample Data</div>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={isFirstStep}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading || (currentStepData.id === 'farm-info' && !farmType)}
              className={`flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg transition-colors ${
                isLoading || (currentStepData.id === 'farm-info' && !farmType)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700'
              }`}
            >
              <span>{isLastStep ? 'Get Started' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 