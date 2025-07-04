import React, { useState } from 'react';
import { Home, PawPrint, DollarSign, CheckSquare, MapPin, Bell } from 'lucide-react';
import AnimalSwipe from './animals/AnimalSwipe';
import { useFarm } from '../context/FarmContext';
import { useAuth } from '../context/AuthContext';

type ActiveTab = 'dashboard' | 'animals' | 'finances' | 'tasks' | 'camps' | 'inventory';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state } = useFarm();
  const { user, signOut } = useAuth();
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'animals' as ActiveTab, label: 'Animals', icon: PawPrint },
    { id: 'finances' as ActiveTab, label: 'Finances', icon: DollarSign },
    { id: 'tasks' as ActiveTab, label: 'Tasks', icon: CheckSquare },
    { id: 'camps' as ActiveTab, label: 'Camps', icon: MapPin },
    { id: 'inventory' as ActiveTab, label: 'Inventory', icon: CheckSquare },
  ];

  // Count due/overdue reminders
  const now = new Date();
  const dueReminders = state.tasks.filter(
    t => t.reminder && t.status !== 'Completed' && new Date(t.dueDate) <= now
  );

  return (
    <div className="relative h-screen bg-gray-100 dark:bg-zinc-900">
      {/* Desktop header with bell icon */}
      <div className="hidden sm:flex items-center justify-between bg-white dark:bg-zinc-800 p-4 shadow-md">
        <div className="flex items-center space-x-2">
          <PawPrint className="h-7 w-7 text-emerald-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">HerdWise</span>
        </div>
        <div className="flex items-center gap-4">
        <button onClick={() => setActiveTab('tasks')} className="relative ml-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700">
          <Bell className="h-6 w-6 text-yellow-500" />
          {dueReminders.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
              {dueReminders.length}
            </span>
          )}
        </button>
          {user && (
            <button onClick={signOut} className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">Sign Out</button>
          )}
        </div>
      </div>
      {/* Mobile header with hamburger menu */}
      <div className="sm:hidden flex items-center justify-between bg-white dark:bg-zinc-800 p-4 shadow-md">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
        >
          <span className="sr-only">Open menu</span>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
        <div className="flex items-center space-x-2">
          <PawPrint className="h-7 w-7 text-emerald-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">HerdWise</span>
        </div>
      </div>
      {/* Sidebar drawer for mobile */}
      <div
        className={`fixed inset-0 z-50 transition-transform duration-300 sm:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!sidebarOpen}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        {/* Drawer */}
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-white dark:bg-zinc-800 p-6 flex flex-col shadow-lg transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            aria-label="Close sidebar"
          >
            ×
          </button>
          <div className="flex items-center space-x-3 mb-10">
            <PawPrint className="h-8 w-8 text-emerald-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HerdWise</h1>
          </div>
          <div className="space-y-3">
            {navItems.map(item => (
                <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                  }`}
                >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                </button>
              ))}
          </div>
          {user && (
            <button onClick={signOut} className="mt-8 w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition">Sign Out</button>
          )}
        </aside>
      </div>
      {/* Desktop flex layout */}
      <div className="hidden sm:flex h-full">
        <aside className="w-64 bg-white dark:bg-zinc-800 p-6 flex-shrink-0 flex-col shadow-lg h-full z-30">
        <div className="flex items-center space-x-3 mb-10">
          <PawPrint className="h-8 w-8 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">HerdWise</h1>
        </div>
        <div className="space-y-3">
          {navItems.map(item => (
              <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                }`}
              >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              </button>
            ))}
        </div>
      </aside>
        <main className="flex-1 h-full overflow-y-auto pb-16">
          {children}
        </main>
      </div>
      {/* Main content for mobile (below sidebar) */}
      <div className="sm:hidden">
        {children}
      </div>
      {/* Bottom tab bar for mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 flex justify-around items-center h-16 shadow-lg">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full px-1 py-2 focus:outline-none ${activeTab === item.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-300'}`}
          >
            <item.icon className={`h-6 w-6 mb-1 ${activeTab === item.id ? 'scale-110' : ''}`} />
            <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};