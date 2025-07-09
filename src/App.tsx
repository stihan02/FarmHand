import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { FarmProvider, useFarm } from './context/FarmContext';
import { AnimalTable } from './components/animals/AnimalTable';
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
import { Animal, Transaction, Task, Event, Camp } from './types';
import { ScheduleEventModal } from './components/animals/ScheduleEventModal';
import { v4 as uuidv4 } from 'uuid';
import { StatsCard } from './components/StatsCard';
import { CampManagement } from './components/camps/CampManagement';
import InventoryList from './components/inventory/InventoryList';
import { AnimalModal } from './components/animals/AnimalModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthForm } from './components/Auth/AuthForm';
import { FeedbackButton } from './components/FeedbackButton';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Analytics } from '@vercel/analytics/react';
import { LandingPage } from './components/LandingPage';

type ActiveTab = 'dashboard' | 'animals' | 'finances' | 'tasks' | 'camps' | 'inventory';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!user) {
    return <LandingPage />;
  }

  return (
    <FarmProvider>
      <FeedbackButton />
      <FarmAppContent />
    </FarmProvider>
  );
}

function FarmAppContent() {
  const { state, dispatch } = useFarm();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [campFilter, setCampFilter] = useState('All');
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventModalTags, setEventModalTags] = useState<string[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isAddAnimalModalOpen, setAddAnimalModalOpen] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderDesc, setReminderDesc] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [reminderAnimal, setReminderAnimal] = useState('');

  const addAnimal = (animal: Animal) => {
    dispatch({ type: 'ADD_ANIMAL', payload: animal });
  };

  const addAnimals = (animals: Animal[]) => {
    animals.forEach(animal => {
      dispatch({ type: 'ADD_ANIMAL', payload: animal });
    });
  };

  const updateAnimal = (animalId: string, updates: Partial<Animal>) => {
    const animal = state.animals.find(a => a.id === animalId);
    if (animal) {
      const updatedAnimal = { ...animal, ...updates };
      dispatch({ type: 'UPDATE_ANIMAL', payload: updatedAnimal });
      
      if (updatedAnimal.status === 'Sold' && updatedAnimal.salePrice) {
      const transaction: Transaction = {
        id: Date.now().toString(),
          type: 'income',
          description: `Sold ${updatedAnimal.type} (Tag: ${updatedAnimal.tagNumber})`,
          amount: updatedAnimal.salePrice,
          date: updatedAnimal.saleDate || new Date().toISOString().split('T')[0],
        location: ''
      };
      dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
      }
    }
  };

  const removeAnimal = (animal: Animal) => {
    if (confirm(`Are you sure you want to remove ${animal.type} (Tag: ${animal.tagNumber})?`)) {
      dispatch({ type: 'REMOVE_ANIMAL', payload: animal.id });
    }
  };

  const handleMoveToCamp = (animalIds: string[], campId: string) => {
    dispatch({ type: 'BULK_UPDATE_ANIMALS_CAMP', payload: { animalIds, campId } });
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

  const addCamp = (camp: Camp) => {
    dispatch({ type: 'ADD_CAMP', payload: camp });
  };

  const updateCamp = (camp: Camp) => {
    dispatch({ type: 'UPDATE_CAMP', payload: camp });
  };

  const deleteCamp = (campId: string) => {
    if (confirm('Are you sure you want to delete this camp? All animals in this camp will be unassigned.')) {
      dispatch({ type: 'DELETE_CAMP', payload: campId });
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
    const matchesCamp = campFilter === 'All' || animal.campId === campFilter;
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
    <Layout 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <main className="flex-1 p-2 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto overflow-x-auto w-full">
        {activeTab === 'dashboard' && (
          <>
            <StatsCard />
            <AnalyticsDashboard />
          </>
        )}
        {activeTab === 'animals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Animals ({filteredAnimals.length})
              </h2>
                <button 
                  onClick={() => setAddAnimalModalOpen(true)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700"
                >
                  Add Animal
                </button>
              </div>
              <AnimalTable
                animals={filteredAnimals}
              onMarkSold={animal => setSelectedAnimal(animal)}
              onMarkDeceased={animal => setSelectedAnimal(animal)}
                onRemove={removeAnimal}
                onMoveToCamp={handleMoveToCamp}
                searchTerm={searchTerm}
                statusFilter={statusFilter}
                campFilter={campFilter}
                onScheduleEventClick={handleScheduleEvent}
              />
            </div>
          )}
          {activeTab === 'camps' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Camp Management</h2>
              <CampManagement
                camps={state.camps}
                onAddCamp={addCamp}
                onUpdateCamp={updateCamp}
                onDeleteCamp={deleteCamp}
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
              <div className="flex gap-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-2 rounded shadow hover:bg-yellow-600"
                  onClick={() => setReminderModalOpen(true)}
                >
                  Set Reminder
                </button>
              <AddTaskForm onAdd={addTask} />
              </div>
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
          {activeTab === 'inventory' && (
            <InventoryList />
          )}
      </main>

      {/* Event Modal */}
      {eventModalOpen && (
        <ScheduleEventModal
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          onSubmit={handleSaveEvent}
          selectedTagNumbers={eventModalTags}
        />
      )}

      {isAddAnimalModalOpen && (
        <AddAnimalForm 
          onAdd={animal => { addAnimal(animal); setAddAnimalModalOpen(false); }}
          onClose={() => setAddAnimalModalOpen(false)}
          existingTags={state.animals.map(a => a.tagNumber)}
          camps={state.camps.map(c => ({ id: c.id, name: c.name }))}
        />
      )}

      {/* Reminder Modal */}
      {reminderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Set Reminder</h2>
            <form onSubmit={e => {
              e.preventDefault();
              if (!reminderDesc || !reminderDate) return;
              dispatch({
                type: 'ADD_TASK',
                payload: {
                  id: Date.now().toString(),
                  description: reminderDesc,
                  dueDate: reminderDate,
                  status: 'Pending',
                  reminder: true,
                  relatedAnimalIds: reminderAnimal ? [reminderAnimal] : undefined,
                }
              });
              setReminderModalOpen(false);
              setReminderDesc('');
              setReminderDate('');
              setReminderAnimal('');
            }}>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <input type="text" className="w-full border rounded px-3 py-2" value={reminderDesc} onChange={e => setReminderDesc(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Due Date</label>
                <input type="date" className="w-full border rounded px-3 py-2" value={reminderDate} onChange={e => setReminderDate(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Animal (optional)</label>
                <select className="w-full border rounded px-3 py-2" value={reminderAnimal} onChange={e => setReminderAnimal(e.target.value)}>
                  <option value="">-- None --</option>
                  {state.animals.map(a => (
                    <option key={a.id} value={a.id}>{a.type} #{a.tagNumber}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setReminderModalOpen(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 rounded bg-yellow-500 text-white disabled:bg-gray-300" disabled={!reminderDesc || !reminderDate}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

// ErrorBoundary component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // You can log errorInfo here if needed
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 16 }}>Something went wrong: {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
        <Analytics />
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;