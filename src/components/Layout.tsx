import React, { useState } from 'react';
import { Sprout, Download, Sun, Moon, Bot } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { exportToCSV, calculateAge, formatCurrency, formatDate } from '../utils/helpers';
import { AIAssistant } from './ai/AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  const { state } = useFarm();
  const [isDark, setIsDark] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const handleExport = () => {
    const exportData = state.animals.map(animal => ({
      'Tag Number': animal.tagNumber,
      'Type': animal.type,
      'Sex': animal.sex === 'M' ? 'Male' : 'Female',
      'Tag Color': animal.tagColor || 'Not specified',
      'Birth Date': formatDate(animal.birthdate),
      'Age': calculateAge(animal.birthdate),
      'Status': animal.status,
      'Sale Price': animal.salePrice ? formatCurrency(animal.salePrice) : '',
      'Sale Date': animal.saleDate ? formatDate(animal.saleDate) : '',
      'Deceased Reason': animal.deceasedReason || '',
      'Deceased Date': animal.deceasedDate ? formatDate(animal.deceasedDate) : '',
      'Mother Tag': animal.motherTag || '',
      'Father Tag': animal.fatherTag || '',
      'Events': animal.history.length
    }));

    exportToCSV(exportData, `farm-animals-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const tabs = [
    { id: 'animals', label: 'Animals', count: state.animals.length },
    { id: 'finances', label: 'Finances', count: state.transactions.length },
    { id: 'tasks', label: 'Tasks', count: state.stats.pendingTasks }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 dark:text-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg dark:bg-emerald-900">
                <Sprout className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Farm Hand</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Modern Farm Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAI(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-200"
              >
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </button>
              <button
                onClick={handleExport}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={toggleTheme}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-200"
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-zinc-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-200' 
                      : 'bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-gray-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-zinc-900 dark:text-gray-100">
        {children}
      </main>

      <AIAssistant isOpen={showAI} onClose={() => setShowAI(false)} />
    </div>
  );
};