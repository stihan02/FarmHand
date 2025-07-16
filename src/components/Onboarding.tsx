import React, { useState } from 'react';
import { PawPrint, Users, Map, Package, DollarSign, Check, ArrowRight, ArrowLeft, Home, Plus, Calendar, TrendingUp, Activity, FileText, Settings, BarChart3 } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { Animal, Camp, Transaction, Task } from '../types';
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
    subtitle: 'Your complete farm management solution',
    icon: Home,
    description: 'Let\'s set up a comprehensive demonstration of everything HerdWise can do for your farm. You\'ll see real examples of all features in action.'
  },
  {
    id: 'farm-info',
    title: 'Tell us about your farm',
    subtitle: 'This helps us customize your demonstration',
    icon: PawPrint,
    description: 'What type of farming do you do? We\'ll create a realistic demonstration based on your farm type.'
  },
  {
    id: 'add-animals',
    title: 'Comprehensive Animal Management',
    subtitle: 'See complete animal tracking in action',
    icon: Users,
    description: 'We\'ll add diverse animals with full records including health history, weight tracking, breeding records, and more.'
  },
  {
    id: 'create-camps',
    title: 'Advanced Camp Management',
    subtitle: 'Complete grazing area organization',
    icon: Map,
    description: 'Set up realistic camps with different grazing strategies, rotation schedules, and area management.'
  },
  {
    id: 'add-finances',
    title: 'Financial Management',
    subtitle: 'Complete income and expense tracking',
    icon: DollarSign,
    description: 'See how to track all farm finances including sales, purchases, operational costs, and profit analysis.'
  },
  {
    id: 'add-tasks',
    title: 'Task & Schedule Management',
    subtitle: 'Organize your daily farm operations',
    icon: Calendar,
    description: 'Set up realistic farm tasks, schedules, and reminders to keep your operations running smoothly.'
  },
  {
    id: 'add-inventory',
    title: 'Inventory Management',
    subtitle: 'Track feed, medicine, and supplies',
    icon: Package,
    description: 'Manage your farm inventory including feed stocks, veterinary supplies, and equipment tracking.'
  },
  {
    id: 'features',
    title: 'Advanced Features Overview',
    subtitle: 'Discover powerful farm management tools',
    icon: TrendingUp,
    description: 'Learn about advanced features like analytics, reporting, health tracking, breeding management, and more.'
  },
  {
    id: 'complete',
    title: 'Your Farm is Ready! 🚀',
    subtitle: 'Start managing like a pro',
    icon: Check,
    description: 'Your comprehensive farm demonstration is set up! Explore all features and see how HerdWise can transform your farm management.'
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

// Comprehensive animal examples with full records
const comprehensiveAnimals = [
  {
    type: 'Cattle',
    tagNumber: 'C001',
    breed: 'Angus',
    sex: 'F' as const,
    status: 'Active' as const,
    age: 3,
    weight: 650,
    health: [
      { date: '2024-01-15', type: 'Vaccination', description: 'Annual vaccination', cost: 45 },
      { date: '2024-03-20', type: 'Treatment', description: 'Deworming treatment', cost: 25 }
    ],
    weightRecords: [
      { date: '2024-01-01', weight: 580 },
      { date: '2024-03-01', weight: 620 },
      { date: '2024-06-01', weight: 650 }
    ],
    breeding: { lastBreeding: '2024-02-15', expectedCalving: '2024-11-15', bullUsed: 'B001' }
  },
  {
    type: 'Cattle',
    tagNumber: 'C002',
    breed: 'Hereford',
    sex: 'M' as const,
    status: 'Active' as const,
    age: 2,
    weight: 750,
    health: [
      { date: '2024-02-10', type: 'Vaccination', description: 'Brucellosis vaccination', cost: 35 }
    ],
    weightRecords: [
      { date: '2024-01-01', weight: 680 },
      { date: '2024-04-01', weight: 720 },
      { date: '2024-07-01', weight: 750 }
    ]
  },
  {
    type: 'Sheep',
    tagNumber: 'S001',
    breed: 'Merino',
    sex: 'F' as const,
    status: 'Active' as const,
    age: 2,
    weight: 65,
    health: [
      { date: '2024-01-20', type: 'Vaccination', description: 'Clostridial vaccination', cost: 15 }
    ],
    weightRecords: [
      { date: '2024-01-01', weight: 58 },
      { date: '2024-05-01', weight: 62 },
      { date: '2024-08-01', weight: 65 }
    ],
    breeding: { lastBreeding: '2024-04-15', expectedLambing: '2024-09-15', ramUsed: 'S002' }
  },
  {
    type: 'Goat',
    tagNumber: 'G001',
    breed: 'Boer',
    sex: 'F' as const,
    status: 'Active' as const,
    age: 1,
    weight: 45,
    health: [
      { date: '2024-02-05', type: 'Vaccination', description: 'CDT vaccination', cost: 12 }
    ],
    weightRecords: [
      { date: '2024-01-01', weight: 38 },
      { date: '2024-06-01', weight: 42 },
      { date: '2024-09-01', weight: 45 }
    ]
  }
];

// Comprehensive camp examples
const comprehensiveCamps = [
  { 
    name: 'North Pasture', 
    area: '50 acres',
    type: 'Rotational Grazing',
    capacity: 25,
    currentStock: 18,
    lastRotation: '2024-08-01',
    nextRotation: '2024-08-15'
  },
  { 
    name: 'South Field', 
    area: '30 acres',
    type: 'Hay Production',
    capacity: 0,
    currentStock: 0,
    lastRotation: '2024-06-15',
    nextRotation: '2024-09-01'
  },
  { 
    name: 'East Meadow', 
    area: '40 acres',
    type: 'Rotational Grazing',
    capacity: 20,
    currentStock: 12,
    lastRotation: '2024-07-15',
    nextRotation: '2024-08-01'
  },
  { 
    name: 'West Paddock', 
    area: '25 acres',
    type: 'Breeding Area',
    capacity: 15,
    currentStock: 8,
    lastRotation: '2024-08-01',
    nextRotation: '2024-08-30'
  }
];

// Comprehensive financial examples
const comprehensiveTransactions = [
  { type: 'Income', category: 'Livestock Sales', amount: 2500, description: 'Sale of 3 steers', date: '2024-07-15' },
  { type: 'Income', category: 'Wool Sales', amount: 800, description: 'Annual wool clip', date: '2024-06-01' },
  { type: 'Expense', category: 'Feed', amount: -450, description: 'Hay purchase', date: '2024-07-10' },
  { type: 'Expense', category: 'Veterinary', amount: -180, description: 'Vaccinations and treatments', date: '2024-07-05' },
  { type: 'Expense', category: 'Equipment', amount: -1200, description: 'New fencing materials', date: '2024-06-20' },
  { type: 'Income', category: 'Other', amount: 300, description: 'Equipment rental', date: '2024-07-01' }
];

// Comprehensive task examples
const comprehensiveTasks = [
  { title: 'Rotate cattle to North Pasture', priority: 'High', dueDate: '2024-08-15', category: 'Grazing Management' },
  { title: 'Schedule veterinarian for herd health check', priority: 'Medium', dueDate: '2024-08-20', category: 'Health Management' },
  { title: 'Order winter feed supplies', priority: 'High', dueDate: '2024-08-25', category: 'Feed Management' },
  { title: 'Prepare breeding records for fall breeding', priority: 'Medium', dueDate: '2024-08-30', category: 'Breeding Management' },
  { title: 'Check and repair fencing', priority: 'Low', dueDate: '2024-09-05', category: 'Maintenance' },
  { title: 'Update weight records for all animals', priority: 'Medium', dueDate: '2024-08-10', category: 'Record Keeping' }
];

// Comprehensive inventory examples
const comprehensiveInventory = [
  { item: 'Hay Bales', quantity: 150, unit: 'bales', cost: 8, category: 'Feed' },
  { item: 'Grain Mix', quantity: 500, unit: 'kg', cost: 0.8, category: 'Feed' },
  { item: 'CDT Vaccine', quantity: 50, unit: 'doses', cost: 12, category: 'Veterinary' },
  { item: 'Dewormer', quantity: 30, unit: 'treatments', cost: 25, category: 'Veterinary' },
  { item: 'Fencing Wire', quantity: 200, unit: 'meters', cost: 2.5, category: 'Equipment' },
  { item: 'Mineral Blocks', quantity: 20, unit: 'blocks', cost: 15, category: 'Feed' }
];

export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete, onSkip }) => {
  const { state, dispatch } = useFarm();
  const [currentStep, setCurrentStep] = useState(0);
  const [farmType, setFarmType] = useState('');
  const [selectedAnimals, setSelectedAnimals] = useState<string[]>([]);
  const [selectedCamps, setSelectedCamps] = useState<string[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<string[]>([]);
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
      await addComprehensiveAnimals();
    }
    
    if (currentStepData.id === 'create-camps' && selectedCamps.length > 0) {
      await addComprehensiveCamps();
    }

    if (currentStepData.id === 'add-finances' && selectedTransactions.length > 0) {
      await addComprehensiveTransactions();
    }

    if (currentStepData.id === 'add-tasks' && selectedTasks.length > 0) {
      await addComprehensiveTasks();
    }

    if (currentStepData.id === 'add-inventory' && selectedInventory.length > 0) {
      await addComprehensiveInventory();
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    // Save onboarding completion to localStorage with user-specific key
    const userId = localStorage.getItem('currentUserId') || 'default';
    localStorage.setItem(`onboardingCompleted_${userId}`, 'true');
    localStorage.setItem(`onboardingCompletedDate_${userId}`, new Date().toISOString());
    
    // Add any remaining selected items
    if (selectedAnimals.length > 0) {
      await addComprehensiveAnimals();
    }
    if (selectedCamps.length > 0) {
      await addComprehensiveCamps();
    }
    if (selectedTransactions.length > 0) {
      await addComprehensiveTransactions();
    }
    if (selectedTasks.length > 0) {
      await addComprehensiveTasks();
    }
    if (selectedInventory.length > 0) {
      await addComprehensiveInventory();
    }
    
    setIsLoading(false);
    onComplete();
  };

  const addComprehensiveAnimals = async () => {
    const animalsToAdd = comprehensiveAnimals.filter((_, index) => selectedAnimals.includes(index.toString()));
    
    animalsToAdd.forEach(animal => {
      // Generate a realistic birthdate based on age
      const birthdate = new Date();
      birthdate.setFullYear(birthdate.getFullYear() - animal.age);
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
        health: animal.health.map(h => ({
          date: h.date,
          type: h.type,
          description: h.description,
          cost: h.cost,
          notes: ''
        })),
        weightRecords: animal.weightRecords.map(w => ({
          date: w.date,
          weight: w.weight,
          notes: ''
        })),
        history: [{
          date: new Date().toISOString().split('T')[0],
          description: 'Added as comprehensive demonstration animal'
        }]
      };
      dispatch({ type: 'ADD_ANIMAL', payload: newAnimal });
    });
  };

  const addComprehensiveCamps = async () => {
    const campsToAdd = comprehensiveCamps.filter((_, index) => selectedCamps.includes(index.toString()));
    
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

  const addComprehensiveTransactions = async () => {
    const transactionsToAdd = comprehensiveTransactions.filter((_, index) => selectedTransactions.includes(index.toString()));
    
    transactionsToAdd.forEach(transaction => {
      const newTransaction: Transaction = {
        id: uuidv4(),
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        notes: 'Added as demonstration transaction'
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    });
  };

  const addComprehensiveTasks = async () => {
    const tasksToAdd = comprehensiveTasks.filter((_, index) => selectedTasks.includes(index.toString()));
    
    tasksToAdd.forEach(task => {
      const newTask: Task = {
        id: uuidv4(),
        title: task.title,
        description: `Demonstration task: ${task.title}`,
        priority: task.priority,
        status: 'Pending',
        dueDate: task.dueDate,
        category: task.category,
        assignedTo: 'Farm Manager',
        notes: 'Added as demonstration task'
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    });
  };

  const addComprehensiveInventory = async () => {
    const inventoryToAdd = comprehensiveInventory.filter((_, index) => selectedInventory.includes(index.toString()));
    
    inventoryToAdd.forEach(item => {
      dispatch({ 
        type: 'ADD_INVENTORY_ITEM', 
        payload: {
          id: uuidv4(),
          name: item.item,
          quantity: item.quantity,
          unit: item.unit,
          cost: item.cost,
          category: item.category,
          notes: 'Added as demonstration inventory item'
        }
      });
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
                Your complete farm management solution. We'll set up a comprehensive demonstration 
                showing you everything HerdWise can do for your farm.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 This demonstration will show you complete animal tracking, financial management, 
                  task scheduling, inventory control, and advanced analytics - everything you need for professional farm management!
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
              <p className="text-gray-600">This helps us customize your comprehensive demonstration</p>
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
              <h3 className="text-2xl font-bold text-gray-900">Comprehensive Animal Management</h3>
              <p className="text-gray-600">See complete animal tracking with health records, weight history, and breeding management</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 These animals include full health records, weight tracking, breeding history, and detailed management data
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comprehensiveAnimals.map((animal, index) => (
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded mr-2">DEMO</span>
                        {animal.type} #{animal.tagNumber}
                      </div>
                      <div className="text-2xl">
                        {animal.type === 'Cattle' ? '🐄' : animal.type === 'Sheep' ? '🐑' : '🐐'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{animal.breed} • {animal.sex} • {animal.age} years</div>
                    <div className="text-xs text-gray-500">
                      Weight: {animal.weight}kg • Health: {animal.health.length} records • Weight: {animal.weightRecords.length} records
                      {animal.breeding && ' • Breeding: Active'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="text-center">
              <button
                onClick={() => setSelectedAnimals(comprehensiveAnimals.map((_, i) => i.toString()))}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Select all demonstration animals
              </button>
            </div>
          </div>
        );

      case 'create-camps':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Advanced Camp Management</h3>
              <p className="text-gray-600">Complete grazing area organization with rotation schedules and capacity management</p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium">
                  💡 These camps include rotation schedules, capacity planning, and different grazing strategies
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comprehensiveCamps.map((camp, index) => (
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
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded mr-2">DEMO</span>
                      {camp.name}
                    </div>
                    <div className="text-sm text-gray-600">{camp.area} • {camp.type}</div>
                    <div className="text-xs text-gray-500">
                      Capacity: {camp.capacity} • Current: {camp.currentStock} • Next rotation: {camp.nextRotation}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'add-finances':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Complete Financial Management</h3>
              <p className="text-gray-600">Track all income, expenses, and analyze your farm's financial performance</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 font-medium">
                  💡 These transactions show realistic farm income and expenses with proper categorization
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comprehensiveTransactions.map((transaction, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSelection = selectedTransactions.includes(index.toString())
                      ? selectedTransactions.filter(i => i !== index.toString())
                      : [...selectedTransactions, index.toString()];
                    setSelectedTransactions(newSelection);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTransactions.includes(index.toString())
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded mr-2">DEMO</span>
                        {transaction.category}
                      </div>
                      <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{transaction.date}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'add-tasks':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Task & Schedule Management</h3>
              <p className="text-gray-600">Organize your daily farm operations with priority-based task management</p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-800 font-medium">
                  💡 These tasks cover all aspects of farm management with realistic priorities and deadlines
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comprehensiveTasks.map((task, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSelection = selectedTasks.includes(index.toString())
                      ? selectedTasks.filter(i => i !== index.toString())
                      : [...selectedTasks, index.toString()];
                    setSelectedTasks(newSelection);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedTasks.includes(index.toString())
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-900">
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded mr-2">DEMO</span>
                      {task.title}
                    </div>
                    <div className="text-sm text-gray-600">{task.category}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Priority: {task.priority}</span>
                      <span>Due: {task.dueDate}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'add-inventory':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">Inventory Management</h3>
              <p className="text-gray-600">Track feed, medicine, supplies, and equipment with automatic cost tracking</p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-800 font-medium">
                  💡 This inventory includes feed, veterinary supplies, and equipment with realistic quantities and costs
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {comprehensiveInventory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSelection = selectedInventory.includes(index.toString())
                      ? selectedInventory.filter(i => i !== index.toString())
                      : [...selectedInventory, index.toString()];
                    setSelectedInventory(newSelection);
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedInventory.includes(index.toString())
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-900">
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded mr-2">DEMO</span>
                        {item.item}
                      </div>
                      <div className="text-sm font-medium text-gray-600">${item.cost}/{item.unit}</div>
                    </div>
                    <div className="text-sm text-gray-600">{item.quantity} {item.unit}</div>
                    <div className="text-xs text-gray-500">{item.category}</div>
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
              <h3 className="text-2xl font-bold text-gray-900">Advanced Features Overview</h3>
              <p className="text-gray-600">Discover powerful tools that make HerdWise the complete farm management solution</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Complete Animal Tracking</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Individual animal records with health history, weight tracking, breeding management, and genetic lineage.
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Map className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-gray-900">Advanced Camp Management</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Grazing rotation schedules, capacity planning, and geographic camp organization with mapping.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                  <h4 className="font-semibold text-gray-900">Financial Analytics</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Complete income/expense tracking, profit analysis, and financial reporting with charts.
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="w-6 h-6 text-orange-600" />
                  <h4 className="font-semibold text-gray-900">Task Management</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Priority-based task scheduling, reminders, and operational planning for daily farm activities.
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="w-6 h-6 text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Inventory Control</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Feed, medicine, and supply tracking with automatic cost calculation and low stock alerts.
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                  <h4 className="font-semibold text-gray-900">Advanced Analytics</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Performance metrics, trend analysis, and data-driven insights for informed decision making.
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
              <h3 className="text-2xl font-bold text-gray-900">Your Farm is Ready! 🚀</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your comprehensive farm demonstration is set up! You now have access to all HerdWise features 
                with realistic data showing exactly how the app can transform your farm management.
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
              <h4 className="font-semibold text-gray-900 mb-3">What you can now explore:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Complete animal records with health & weight tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Advanced camp management with rotation schedules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Financial tracking with income/expense analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Task management with priority scheduling</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Inventory control with cost tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Advanced analytics and reporting</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 font-medium">
                💡 Pro tip: Use the "Quick Actions" on your dashboard to add new animals, transactions, and tasks in just one click!
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
                <span className="text-xl font-bold text-gray-900">HerdWise Complete Setup</span>
                <div className="text-xs text-blue-600 font-medium">COMPREHENSIVE DEMONSTRATION</div>
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