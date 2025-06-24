import React from 'react';
import { Home, PawPrint, DollarSign, CheckSquare, Bot, BookUser, MapPin } from 'lucide-react';

type ActiveTab = 'dashboard' | 'animals' | 'finances' | 'tasks' | 'stud' | 'camps';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAiAssistant?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onOpenAiAssistant }) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: Home },
    { id: 'animals' as ActiveTab, label: 'Animals', icon: PawPrint },
    { id: 'finances' as ActiveTab, label: 'Finances', icon: DollarSign },
    { id: 'tasks' as ActiveTab, label: 'Tasks', icon: CheckSquare },
    { id: 'camps' as ActiveTab, label: 'Camps', icon: MapPin },
    { id: 'stud' as ActiveTab, label: 'Stud Registration', icon: BookUser },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-zinc-900">
      <aside className="w-64 bg-white dark:bg-zinc-800 p-6 flex-shrink-0 flex flex-col shadow-lg">
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
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};