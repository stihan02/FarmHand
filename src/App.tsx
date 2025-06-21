import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { FarmProvider, useFarm } from './context/FarmContext';
import { AIAssistant } from './components/ai/AIAssistant';
import { AnimalTable } from './components/animals/AnimalTable';
import { AnimalModal } from './components/animals/AnimalModal';
import { AddAnimalForm } from './components/animals/AddAnimalForm';
import { TransactionCard } from './components/finances/TransactionCard';
import { AddTransactionForm } from './components/finances/AddTransactionForm';
import { TaskCard } from './components/tasks/TaskCard';
import { AddTaskForm } from './components/tasks/AddTaskForm';
import { formatCurrency } from './utils/helpers';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckSquare, 
  Filter,
  Search,
  Bot
} from 'lucide-react';
import { Animal, Transaction, Task, Event } from './types';
import { ScheduleEventModal } from './components/animals/ScheduleEventModal';
import { v4 as uuidv4 } from 'uuid';

function AppContent() {
  const { state, dispatch } = useFarm();
  const [activeTab, setActiveTab] = useState('animals');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campFilter, setCampFilter] = useState('All');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalTags, setEventModalTags] = useState<string[]>([]);

  const addAnimals = (animals: Animal[]) => {
    animals.forEach(animal => {
      dispatch({ type: 'ADD_ANIMAL', payload: animal });
    });
  };

  const updateAnimal = (animal: Animal) => {
    dispatch({ type: 'UPDATE_ANIMAL', payload: animal });
    
    // If animal was sold, add transaction
    if (animal.status === 'Sold' && animal.salePrice) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: 'Income',
        description: `Sold ${animal.type} (Tag: ${animal.tagNumber})`,
        amount: animal.salePrice,
        date: animal.saleDate || new Date().toISOString().split('T')[0],
        location: ''
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
    }
  };

  const removeAnimal = (animal: Animal) => {
    if (confirm(`Are you sure you want to remove ${animal.type} (Tag: ${animal.tagNumber})?`)) {
      dispatch({ type: 'REMOVE_ANIMAL', payload: animal.id });
    }
  };

  const handleMarkSold = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsBulkUpdate(false);
  };
  
  const handleMarkDeceased = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsBulkUpdate(false);
  };

  const handleMoveToCamp = (animalIds: string[], camp: string) => {
    dispatch({ type: 'BULK_UPDATE_ANIMALS_CAMP', payload: { animalIds, camp } });
  };

  const addTransaction = (transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const removeTransaction = (transactionId: string) => {
    if (confirm('Are you sure you want to remove this transaction?')) {
      dispatch({ type: 'REMOVE_TRANSACTION', payload: transactionId });
    }
  };

  const addTask = (task: Task) => {
    dispatch({ type: 'ADD_TASK', payload: task });
  };

  const updateTask = (task: Task) => {
    dispatch({ type: 'UPDATE_TASK', payload: task });
  };

  const removeTask = (taskId: string) => {
    if (confirm('Are you sure you want to remove this task?')) {
      dispatch({ type: 'REMOVE_TASK', payload: taskId });
    }
  };

  const handleScheduleEvent = (tags: string[]) => {
    setEventModalTags(tags);
    setEventModalOpen(true);
  };
  
  const handleSaveEvent = (event: Omit<Event, 'id'>) => {
    dispatch({ type: 'ADD_EVENT', payload: { ...event, id: uuidv4() } });
    setEventModalOpen(false);
    setEventModalTags([]);
  };

  const filteredAnimals = state.animals.filter(animal => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      animal.tagNumber.toLowerCase().includes(term) ||
      animal.type.toLowerCase().includes(term) ||
      animal.breed?.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || animal.status === statusFilter;
    const matchesCamp = campFilter === 'All' || animal.camp === campFilter;
    return matchesTerm && matchesStatus && matchesCamp;
  });

  const filteredTransactions = state.transactions.filter(transaction =>
    searchTerm === '' ||
    transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = state.tasks.filter(task =>
    searchTerm === '' ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 hover:shadow-xl transition-shadow cursor-pointer"
          onClick={() => setActiveTab('ai')}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click to get AI help with health monitoring, genetics, and breeding
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Animals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{state.stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Farm Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(state.stats.balance)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatCurrency(state.stats.totalIncome)} in / {formatCurrency(state.stats.totalExpenses)} out
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <CheckSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{state.stats.pendingTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700 placeholder-gray-400"
          />
        </div>
        
        {activeTab === 'animals' && (
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Sold">Sold</option>
              <option value="Deceased">Deceased</option>
            </select>
            <select
              value={campFilter}
              onChange={(e) => setCampFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 dark:bg-zinc-800 dark:text-gray-100 dark:border-zinc-700"
            >
              <option value="All">All Camps</option>
              {state.camps.map(camp => (
                <option key={camp} value={camp}>{camp}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'animals' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Animals ({filteredAnimals.length})
            </h2>
            <AddAnimalForm 
              onAdd={addAnimals} 
              existingTags={state.animals.map(a => a.tagNumber)}
            />
          </div>
          
          <AnimalTable
            animals={filteredAnimals}
            onViewProfile={setSelectedAnimal}
            onMarkSold={handleMarkSold}
            onMarkDeceased={handleMarkDeceased}
            onRemove={removeAnimal}
            onMoveToCamp={handleMoveToCamp}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            campFilter={campFilter}
            onScheduleEventClick={handleScheduleEvent}
          />
        </div>
      )}

      {activeTab === 'finances' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Finances ({filteredTransactions.length})
            </h2>
            <AddTransactionForm onAdd={addTransaction} />
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No transactions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search'
                  : 'Start tracking your farm finances'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTransactions.map(transaction => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  onRemove={() => removeTransaction(transaction.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Tasks ({filteredTasks.length})
            </h2>
            <AddTaskForm onAdd={addTask} />
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search'
                  : 'Add tasks to keep track of farm activities'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={() => {
                    const updatedTask: Task = { ...task, status: task.status === 'Pending' ? 'Completed' : 'Pending' };
                    updateTask(updatedTask);
                  }}
                  onRemove={() => removeTask(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <AIAssistant
          animals={state.animals}
          onUpdateAnimal={(animalId, updates) => {
            const animal = state.animals.find(a => a.id === animalId);
            if (animal) {
              updateAnimal({ ...animal, ...updates });
            }
          }}
        />
      )}

      {/* Animal Modal */}
      {selectedAnimal && (
        <AnimalModal
          animal={selectedAnimal}
          onClose={() => setSelectedAnimal(null)}
          onUpdate={updateAnimal}
          allAnimals={state.animals}
          isBulkUpdate={isBulkUpdate}
        />
      )}

      {/* Event Modal */}
      {eventModalOpen && (
        <ScheduleEventModal
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          onSubmit={handleSaveEvent}
          selectedTagNumbers={eventModalTags}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
}

export default App;