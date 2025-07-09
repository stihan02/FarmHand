import React, { useState } from 'react';
import { Download, Upload, FileText, BarChart3, Users, Package, DollarSign } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { 
  exportAnimalsReport, 
  exportFinancialReport, 
  exportInventoryReport, 
  exportAllData,
  importData 
} from '../utils/helpers';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const ReportsExport: React.FC = () => {
  const { state } = useFarm();
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportMessage(null);

    try {
      const data = await importData(file);
      setImportMessage('Backup file loaded successfully! Note: This is a preview only. Import functionality will be added soon.');
    } catch (error) {
      setImportMessage('Error loading backup file. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  // Chart data preparation
  const animalStatusData = [
    { name: 'Active', value: state.animals.filter(a => a.status === 'Active').length, color: '#10b981' },
    { name: 'Sold', value: state.animals.filter(a => a.status === 'Sold').length, color: '#f59e0b' },
    { name: 'Deceased', value: state.animals.filter(a => a.status === 'Deceased').length, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const animalTypeData = state.animals.reduce((acc, animal) => {
    acc[animal.type] = (acc[animal.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const animalTypeChartData = Object.entries(animalTypeData).map(([type, count]) => ({
    name: type,
    value: count,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const financialData = state.transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) acc[month] = { income: 0, expenses: 0 };
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expenses += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  const financialChartData = Object.entries(financialData).map(([month, data]) => ({
    month,
    income: data.income,
    expenses: data.expenses,
    profit: data.income - data.expenses
  }));

  const inventoryValueData = state.inventory.map(item => ({
    name: item.name,
    value: item.quantity * (item.price || 0),
    stock: item.quantity
  }));

  const reports = [
    {
      title: 'Animals Report',
      description: 'Export all animal data with details',
      icon: Users,
      action: () => exportAnimalsReport(state.animals),
      count: state.animals.length,
      chart: (
        <div className="space-y-4">
          {animalStatusData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Animal Status Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={animalStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {animalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {animalTypeChartData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Animal Types</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={animalTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Financial Report',
      description: 'Export all transactions and financial data',
      icon: DollarSign,
      action: () => exportFinancialReport(state.transactions),
      count: state.transactions.length,
      chart: (
        <div className="space-y-4">
          {financialChartData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Monthly Financial Overview</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={financialChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded">
              <div className="text-lg font-bold text-green-600">${state.stats.totalIncome.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Income</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
              <div className="text-lg font-bold text-red-600">${state.stats.totalExpenses.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
              <div className="text-lg font-bold text-blue-600">${state.stats.balance.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Net Balance</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Inventory Report',
      description: 'Export inventory items and stock levels',
      icon: Package,
      action: () => exportInventoryReport(state.inventory),
      count: state.inventory.length,
      chart: (
        <div className="space-y-4">
          {inventoryValueData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Inventory Value by Item</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inventoryValueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
              <div className="text-lg font-bold text-purple-600">{state.inventory.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded">
              <div className="text-lg font-bold text-indigo-600">
                ${state.inventory.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Reports & Analytics
        </h2>
        
        <div className="space-y-8">
          {reports.map((report, index) => (
            <div key={index} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <report.icon className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {report.count} items
                  </span>
                  <button 
                    onClick={report.action}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded text-sm transition-colors flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </button>
                </div>
              </div>
              
              {/* Charts Section */}
              <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-4">
                {report.chart}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-zinc-700 pt-6 mt-8">
          <h3 className="font-semibold mb-4">Backup & Restore</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                Export All Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Download a complete backup of all your farm data
              </p>
              <button 
                onClick={() => exportAllData(state)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm transition-colors"
              >
                Download Backup
              </button>
            </div>

            <div className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Upload className="h-4 w-4 text-emerald-600" />
                Import Data
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                Restore data from a previous backup file
              </p>
              <label className="w-full bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 py-2 px-3 rounded text-sm transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                {isImporting ? 'Loading...' : 'Choose File'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          {importMessage && (
            <div className={`mt-4 p-3 rounded text-sm ${
              importMessage.includes('Error') 
                ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' 
                : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
            }`}>
              {importMessage}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-emerald-600" />
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{state.animals.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Animals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{state.transactions.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{state.inventory.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Inventory Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{state.camps.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Camps</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 