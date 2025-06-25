import React, { useState } from 'react';
import { Home, PawPrint, DollarSign, CheckSquare, Bot, BookUser, MapPin } from 'lucide-react';
import AnimalSwipe from './animals/AnimalSwipe';

type ActiveTab = 'dashboard' | 'animals' | 'finances' | 'tasks' | 'stud' | 'camps';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAiAssistant?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onOpenAiAssistant }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'animals' as ActiveTab, label: 'Animals', icon: PawPrint },
    { id: 'finances' as ActiveTab, label: 'Finances', icon: DollarSign },
    { id: 'tasks' as ActiveTab, label: 'Tasks', icon: CheckSquare },
    { id: 'camps' as ActiveTab, label: 'Camps', icon: MapPin },
    { id: 'stud' as ActiveTab, label: 'Stud Registration', icon: BookUser },
  ];

  return (
    <div className="relative h-screen bg-gray-100 dark:bg-zinc-900">
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
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">FarmHand</span>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FarmHand</h1>
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
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="mt-auto w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
            >
              <Bot className="mr-2 h-5 w-5" />
              AI Assistant
            </button>
          )}
        </aside>
      </div>
      {/* Sidebar for desktop */}
      <aside className="hidden sm:flex w-64 bg-white dark:bg-zinc-800 p-6 flex-shrink-0 flex-col shadow-lg h-full fixed sm:static z-30">
        <div className="flex items-center space-x-3 mb-10">
          <PawPrint className="h-8 w-8 text-emerald-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FarmHand</h1>
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
        {onOpenAiAssistant && (
          <button
            onClick={onOpenAiAssistant}
            className="mt-auto w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
          >
            <Bot className="mr-2 h-5 w-5" />
            AI Assistant
          </button>
        )}
      </aside>
      {/* Main content */}
      <div className="sm:ml-64 h-full pb-16">
        {/* <AnimalSwipe /> */}
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