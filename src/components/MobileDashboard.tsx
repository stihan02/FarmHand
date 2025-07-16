import React from 'react';
import { useFarm } from '../context/FarmContext';
import { StatsCard } from './StatsCard';
import { TouchFriendlyButton } from './TouchFriendlyButton';
import { MobileCard } from './MobileCard';
import { 
  Plus, 
  PawPrint, 
  DollarSign, 
  CheckSquare, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Users
} from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

interface MobileDashboardProps {
  onNavigate: (tab: 'dashboard' | 'animals' | 'finances' | 'tasks' | 'camps' | 'inventory' | 'reports') => void;
  onAddAnimal: () => void;
  onAddTransaction: () => void;
  onAddTask: () => void;
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({
  onNavigate,
  onAddAnimal,
  onAddTransaction,
  onAddTask,
}) => {
  const { state } = useFarm();

  // Calculate quick stats
  const totalAnimals = state.animals.length;
  const activeAnimals = state.animals.filter(a => a.status === 'Active').length;
  const totalValue = state.animals.reduce((sum, animal) => sum + (animal.salePrice || 0), 0);
  const pendingTasks = state.tasks.filter(t => t.status !== 'Completed').length;
  const overdueTasks = state.tasks.filter(t => 
    t.status !== 'Completed' && new Date(t.dueDate) < new Date()
  ).length;

  // Recent activities (using id as proxy for creation time)
  const recentAnimals = state.animals
    .sort((a, b) => parseInt(b.id) - parseInt(a.id))
    .slice(0, 3);

  const recentTransactions = state.transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to HerdWise
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your farm efficiently
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <MobileCard variant="elevated" onClick={() => onNavigate('animals')} className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <PawPrint className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalAnimals}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Animals</p>
          {activeAnimals > 0 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400">Active: {activeAnimals}</p>
          )}
        </MobileCard>
        
        <MobileCard variant="elevated" onClick={() => onNavigate('finances')} className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <DollarSign className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
          {totalValue > 0 && (
            <p className="text-xs text-blue-600 dark:text-blue-400">Estimated</p>
          )}
        </MobileCard>
        
        <MobileCard variant="elevated" onClick={() => onNavigate('tasks')} className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <CheckSquare className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingTasks}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
          {overdueTasks > 0 && (
            <p className="text-xs text-red-600 dark:text-red-400">{overdueTasks} overdue</p>
          )}
        </MobileCard>
        
        <MobileCard variant="elevated" onClick={() => onNavigate('camps')} className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{state.camps.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Camps</p>
          {state.camps.length > 0 && (
            <p className="text-xs text-purple-600 dark:text-purple-400">Active</p>
          )}
        </MobileCard>
      </div>

      {/* Quick Actions */}
      <MobileCard variant="elevated" className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <TouchFriendlyButton
            onClick={onAddAnimal}
            variant="primary"
            size="md"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Animal</span>
          </TouchFriendlyButton>
          
          <TouchFriendlyButton
            onClick={onAddTransaction}
            variant="secondary"
            size="md"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <DollarSign className="h-5 w-5" />
            <span>Add Transaction</span>
          </TouchFriendlyButton>
          
          <TouchFriendlyButton
            onClick={onAddTask}
            variant="secondary"
            size="md"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <CheckSquare className="h-5 w-5" />
            <span>Add Task</span>
          </TouchFriendlyButton>
          
          <TouchFriendlyButton
            onClick={() => onNavigate('reports')}
            variant="ghost"
            size="md"
            fullWidth
            className="flex items-center justify-center space-x-2"
          >
            <TrendingUp className="h-5 w-5" />
            <span>View Reports</span>
          </TouchFriendlyButton>
        </div>
      </MobileCard>

      {/* Recent Animals */}
      {recentAnimals.length > 0 && (
        <MobileCard variant="default" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Animals
            </h2>
            <TouchFriendlyButton
              onClick={() => onNavigate('animals')}
              variant="ghost"
              size="sm"
            >
              View All
            </TouchFriendlyButton>
          </div>
          <div className="space-y-3">
            {recentAnimals.map((animal) => (
              <div
                key={animal.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                    <PawPrint className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {animal.tagNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {animal.type} • {animal.breed}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {animal.status}
                  </p>
                  {animal.salePrice && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(animal.salePrice)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MobileCard>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <MobileCard variant="default" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Transactions
            </h2>
            <TouchFriendlyButton
              onClick={() => onNavigate('finances')}
              variant="ghost"
              size="sm"
            >
              View All
            </TouchFriendlyButton>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </MobileCard>
      )}

      {/* Alerts */}
      {overdueTasks > 0 && (
        <MobileCard variant="outlined" className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                Attention Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {overdueTasks} overdue tasks
              </p>
            </div>
          </div>
        </MobileCard>
      )}

      {/* Empty State */}
      {totalAnimals === 0 && state.transactions.length === 0 && state.tasks.length === 0 && (
        <MobileCard variant="default" className="text-center py-8">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mx-auto">
              <PawPrint className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Welcome to HerdWise!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Start by adding your first animal to get started.
              </p>
            </div>
            <TouchFriendlyButton
              onClick={onAddAnimal}
              variant="primary"
              size="lg"
              className="mx-auto"
            >
              Add Your First Animal
            </TouchFriendlyButton>
          </div>
        </MobileCard>
      )}
    </div>
  );
}; 