import React, { useState } from 'react';
import { PawPrint, Users, Map, Package, DollarSign, Check, ArrowRight, ArrowLeft, Home, Calendar, BarChart3, Play } from 'lucide-react';
import { useFarm } from '../context/FarmContext';

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
    description: 'Let\'s show you what HerdWise can do for your farm with a comprehensive demonstration.'
  },
  {
    id: 'preview',
    title: 'See HerdWise in Action',
    subtitle: 'Complete farm management demonstration',
    icon: Play,
    description: 'We\'ll set up a realistic farm with animals, camps, finances, tasks, and inventory to show you everything HerdWise can do.'
  },
  {
    id: 'complete',
    title: 'Your Demo Farm is Ready! 🚀',
    subtitle: 'Start exploring HerdWise',
    icon: Check,
    description: 'Your comprehensive farm demonstration is set up! Explore all features and see how HerdWise can transform your farm management.'
  }
];



export const Onboarding: React.FC<OnboardingProps> = ({ isOpen, onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { dispatch } = useFarm();

  const currentStepData = onboardingSteps[currentStep];

  const handleNext = async () => {
    if (currentStep === onboardingSteps.length - 1) {
      await handleComplete();
      return;
    }

    // Just move to next step - no data setup
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleComplete = async () => {
    onComplete();
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
                Your complete farm management solution. We'll show you everything HerdWise can do with a comprehensive demonstration.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 See complete animal tracking, financial management, task scheduling, inventory control, and advanced analytics in action!
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

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">See HerdWise in Action</h3>
              <p className="text-gray-600">We'll set up a complete demonstration farm to show you all features</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                  <h4 className="font-semibold text-blue-900">Animal Management</h4>
                </div>
                <p className="text-sm text-blue-800">
                  4 demo animals with complete health records, weight tracking, and breeding management
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Map className="h-6 w-6 text-green-600" />
                  <h4 className="font-semibold text-green-900">Camp Management</h4>
                </div>
                <p className="text-sm text-green-800">
                  4 demo camps with rotation schedules, capacity planning, and grazing strategies
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Financial Tracking</h4>
                </div>
                <p className="text-sm text-yellow-800">
                  6 demo transactions showing realistic farm income and expenses
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar className="h-6 w-6 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">Task Management</h4>
                </div>
                <p className="text-sm text-purple-800">
                  6 demo tasks with priorities, due dates, and categories
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Package className="h-6 w-6 text-orange-600" />
                  <h4 className="font-semibold text-orange-900">Inventory Control</h4>
                </div>
                <p className="text-sm text-orange-800">
                  6 demo inventory items with reorder levels and cost tracking
                </p>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                  <h4 className="font-semibold text-indigo-900">Analytics & Reports</h4>
                </div>
                <p className="text-sm text-indigo-800">
                  Complete analytics dashboard with charts, trends, and insights
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-800 font-medium text-center">
                🎯 Click "Next" to start exploring HerdWise with your own farm data!
              </p>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>
                          <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">You're All Set! 🚀</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Welcome to HerdWise! You're ready to start managing your farm with our comprehensive tools.
                </p>
                <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-800 font-medium">
                    💡 Start by adding your first animal, camp, or transaction. Use the quick actions on your dashboard to get started quickly!
                  </p>
                </div>
              </div>
            <div className="flex justify-center space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-emerald-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <PawPrint className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">HerdWise Setup</span>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep + 1} of {onboardingSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / onboardingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

                          <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-emerald-600 text-white hover:from-blue-700 hover:to-emerald-700 transform hover:scale-105 shadow-lg"
              >
                {currentStep === onboardingSteps.length - 1 ? (
                  <>
                    <span>Get Started</span>
                    <Check className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 