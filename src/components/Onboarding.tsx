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
    title: 'Welcome to HerdWise!',
    subtitle: 'Let\'s get your farm set up in just a few minutes',
    icon: Home,
    description: 'We\'ll help you add your animals, set up camps, and get started with tracking your farm operations.'
  },
  {
    id: 'farm-info',
    title: 'Tell us about your farm',
    subtitle: 'This helps us customize your experience',
    icon: PawPrint,
    description: 'What type of farming do you do? This helps us show you the most relevant features.'
  },
  {
    id: 'add-animals',
    title: 'Add your first animals',
    subtitle: 'Let\'s start tracking your livestock',
    icon: Users,
    description: 'Add a few animals to see how easy it is to track them. You can add more later.'
  },
  {
    id: 'create-camps',
    title: 'Set up your grazing camps',
    subtitle: 'Organize your land for better management',
    icon: Map,
    description: 'Create camps to track where your animals are grazing and manage rotations.'
  },
  {
    id: 'features',
    title: 'Discover key features',
    subtitle: 'See what HerdWise can do for you',
    icon: TrendingUp,
    description: 'Learn about the powerful features that will help you manage your farm more efficiently.'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    subtitle: 'Your farm is ready to go',
    icon: Check,
    description: 'Start exploring HerdWise and see how it can transform your farm management.'
  }
];

const farmTypes = [
  { id: 'cattle', label: 'Cattle Farming', icon: '🐄', description: 'Beef or dairy cattle operations' },
  { id: 'sheep', label: 'Sheep Farming', icon: '🐑', description: 'Wool or meat sheep operations' },
  { id: 'goats', label: 'Goat Farming', icon: '🐐', description: 'Dairy or meat goat operations' },
  { id: 'pigs', label: 'Pig Farming', icon: '🐷', description: 'Pork production' },
  { id: 'poultry', label: 'Poultry Farming', icon: '🐔', description: 'Chicken, turkey, or other birds' },
  { id: 'mixed', label: 'Mixed Farming', icon: '🏡', description: 'Multiple types of livestock' },
  { id: 'other', label: 'Other', icon: '🐾', description: 'Other types of livestock' }
];

const sampleAnimals = [
  { type: 'Cattle', tagNumber: 'C001', breed: 'Angus', sex: 'Female', status: 'Active' },
  { type: 'Cattle', tagNumber: 'C002', breed: 'Hereford', sex: 'Male', status: 'Active' },
  { type: 'Sheep', tagNumber: 'S001', breed: 'Merino', sex: 'Female', status: 'Active' },
  { type: 'Goat', tagNumber: 'G001', breed: 'Boer', sex: 'Female', status: 'Active' }
];

const sampleCamps = [
  { name: 'North Pasture', description: 'Main grazing area', area: '50 acres' },
  { name: 'South Field', description: 'Secondary grazing area', area: '30 acres' },
  { name: 'Hay Field', description: 'For hay production', area: '20 acres' }
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
    
    // Save onboarding completion to localStorage
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('onboardingCompletedDate', new Date().toISOString());
    
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
      const newAnimal: Animal = {
        id: uuidv4(),
        tagNumber: animal.tagNumber,
        type: animal.type,
        breed: animal.breed,
        sex: animal.sex,
        status: animal.status,
        birthdate: '',
        campId: '',
        weightRecords: [],
        events: []
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
        description: camp.description,
        area: camp.area,
        coordinates: [],
        animalIds: []
      };
      dispatch({ type: 'ADD_CAMP', payload: newCamp });
    });
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <PawPrint className="w-12 h-12 text-blue-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Welcome to HerdWise!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Let's get your farm set up in just a few minutes. We'll help you add your animals, 
                set up camps, and get started with tracking your farm operations.
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
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
              <h3 className="text-2xl font-bold text-gray-900">Add some sample animals</h3>
              <p className="text-gray-600">Select a few to see how easy tracking is. You can add your real animals later.</p>
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
                      <div className="font-semibold text-gray-900">{animal.type} #{animal.tagNumber}</div>
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
                Select all
              </button>
            </div>
          </div>
        );

      case 'create-camps':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Set up your grazing camps</h3>
              <p className="text-gray-600">Create camps to organize your land and track grazing rotations.</p>
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
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">{camp.name}</div>
                    <div className="text-sm text-gray-600">{camp.description}</div>
                    <div className="text-sm text-gray-500">{camp.area}</div>
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
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-green-600" />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">You're all set!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your farm is ready to go. Start exploring HerdWise and see how it can transform your farm management.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">What's next?</h4>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Add your real animals and camps</li>
                <li>• Set up your first tasks and reminders</li>
                <li>• Track your first weight records</li>
                <li>• Explore the analytics dashboard</li>
              </ul>
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
              <span className="text-xl font-bold text-gray-900">HerdWise Setup</span>
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