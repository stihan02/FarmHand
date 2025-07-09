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

  const reports = [
    {
      title: 'Animals Report',
      description: 'Export all animal data with details',
      icon: Users,
      action: () => exportAnimalsReport(state.animals),
      count: state.animals.length
    },
    {
      title: 'Financial Report',
      description: 'Export all transactions and financial data',
      icon: DollarSign,
      action: () => exportFinancialReport(state.transactions),
      count: state.transactions.length
    },
    {
      title: 'Inventory Report',
      description: 'Export inventory items and stock levels',
      icon: Package,
      action: () => exportInventoryReport(state.inventory),
      count: state.inventory.length
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Reports & Export
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {reports.map((report, index) => (
            <div 
              key={index}
              className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={report.action}
            >
              <div className="flex items-center justify-between mb-2">
                <report.icon className="h-5 w-5 text-emerald-600" />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {report.count} items
                </span>
              </div>
              <h3 className="font-semibold mb-1">{report.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {report.description}
              </p>
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded text-sm transition-colors flex items-center justify-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-zinc-700 pt-6">
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