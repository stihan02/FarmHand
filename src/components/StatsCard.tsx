import React from 'react';
import { useFarm } from '../context/FarmContext';
import { formatCurrency } from '../utils/helpers';
import { Users, DollarSign, CheckSquare, Bot } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';

export const StatsCard = () => {
  const { state } = useFarm();
  const { active, totalIncome, totalExpenses, balance, pendingTasks } = state.stats;

  return (
    <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white dark:bg-zinc-800 p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 min-w-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Animals</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{active}</p>
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
          </div>
        </div>
      </div>
      </div>
      <WeatherWidget />
    </div>
  );
};