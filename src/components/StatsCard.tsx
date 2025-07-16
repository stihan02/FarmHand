import React from 'react';
import { useFarm } from '../context/FarmContext';
import { formatCurrency } from '../utils/helpers';
import { Users, DollarSign, CheckSquare, Bot } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

interface StatsCardProps {
  onShowOnboarding?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ onShowOnboarding }) => {
  const { state } = useFarm();
  const { active, totalIncome, totalExpenses, balance, pendingTasks } = state.stats;
  const isNewUser = state.animals.length === 0 && state.camps.length === 0;

  return (
    <div className="space-y-6">
      {/* Welcome message for new users */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Welcome to HerdWise! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Let's get your farm set up. Add your first animals and camps to start tracking your operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onShowOnboarding}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  Guided Setup
                </button>
                <button
                  onClick={() => window.location.href = '#animals'}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Add Animals
                </button>
              </div>
            </div>
            <div className="text-4xl">🐄</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Animals</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{active}</p>
              {active === 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Add your first animal</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Farm Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(balance)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-words">
                {formatCurrency(totalIncome)} in / {formatCurrency(totalExpenses)} out
              </p>
              {totalIncome === 0 && totalExpenses === 0 && (
                <p className="text-xs text-blue-600 dark:text-blue-400">Start tracking finances</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <CheckSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingTasks}</p>
              {pendingTasks === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400">All caught up!</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Bot className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Camps</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{state.camps.length}</p>
              {state.camps.length === 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-400">Create grazing areas</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps for existing users */}
      {!isNewUser && (
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => window.location.href = '#animals'}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Animal</span>
            </button>
            <button
              onClick={() => window.location.href = '#finances'}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Transaction</span>
            </button>
            <button
              onClick={() => window.location.href = '#tasks'}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <CheckSquare className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add Task</span>
            </button>
            <button
              onClick={() => window.location.href = '#camps'}
              className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Bot className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Camps</span>
            </button>
          </div>
        </div>
      )}

      <WeatherWidget />
    </div>
  );
};