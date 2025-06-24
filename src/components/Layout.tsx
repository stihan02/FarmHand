import React, { useState } from 'react';
import { Home, PawPrint, DollarSign, CheckSquare, Bot, BookUser, MapPin } from 'lucide-react';

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
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-900 flex-col sm:flex-row">
      {/* Mobile header with menu button */}
      <div className="sm:hidden flex items-center justify-between bg-white dark:bg-zinc-800 p-4 shadow-md">
        <div className="flex items-center space-x-2">
          <PawPrint className="h-7 w-7 text-emerald-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">FarmHand</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900"
        >
          <span className="sr-only">Open menu</span>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
        </button>
      </div>
      {/* Sidebar */}
      <aside
        className={`bg-white dark:bg-zinc-800 p-6 flex-shrink-0 flex flex-col shadow-lg w-64
          sm:static sm:translate-x-0 sm:w-64
          fixed top-0 left-0 h-full z-40 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0
        `}
        style={{ maxWidth: 260 }}
      >
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
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-auto">
        {children}
      </div>
    </div>
  );
};