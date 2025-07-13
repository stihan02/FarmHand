import React, { useState } from 'react';
import { Download, Upload, FileText, BarChart3, Users, Package, DollarSign, TrendingUp, Calendar, Scale } from 'lucide-react';
import { useFarm } from '../context/FarmContext';
import { 
  exportAnimalsReport, 
  exportFinancialReport, 
  exportInventoryReport, 
  exportAllData,
  importData 
} from '../utils/helpers';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const ReportsExport: React.FC = () => {
  const { state } = useFarm();
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<string>('animals');

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

  // Calculate weight statistics
  const weightStats = state.animals.reduce((acc, animal) => {
    const weightRecords = animal.weightRecords || [];
    if (weightRecords.length > 0) {
      const latestWeight = weightRecords[weightRecords.length - 1];
      const totalGain = weightRecords.length >= 2 
        ? latestWeight.weight - weightRecords[0].weight 
        : 0;
      
      acc.totalAnimals++;
      acc.totalWeight += latestWeight.weight;
      acc.totalGain += totalGain;
      acc.averageWeight = acc.totalWeight / acc.totalAnimals;
      
      // Track by animal type
      if (!acc.byType[animal.type]) {
        acc.byType[animal.type] = { count: 0, totalWeight: 0, totalGain: 0 };
      }
      acc.byType[animal.type].count++;
      acc.byType[animal.type].totalWeight += latestWeight.weight;
      acc.byType[animal.type].totalGain += totalGain;
    }
    return acc;
  }, {
    totalAnimals: 0,
    totalWeight: 0,
    totalGain: 0,
    averageWeight: 0,
    byType: {} as Record<string, { count: number; totalWeight: number; totalGain: number }>
  });

  // Prepare weight growth data for charts
  const weightGrowthData = state.animals
    .filter(animal => (animal.weightRecords || []).length > 0)
    .map(animal => {
      const weightRecords = animal.weightRecords || [];
      const latestWeight = weightRecords[weightRecords.length - 1];
      const totalGain = weightRecords.length >= 2 
        ? latestWeight.weight - weightRecords[0].weight 
        : 0;
      
      return {
        tagNumber: animal.tagNumber,
        type: animal.type,
        latestWeight: latestWeight.weight,
        totalGain,
        recordCount: weightRecords.length,
        lastWeighDate: latestWeight.date
      };
    })
    .sort((a, b) => b.latestWeight - a.latestWeight);

  // Weight trends over time (last 30 days)
  const getWeightTrends = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyWeights: Record<string, { total: number; count: number }> = {};
    
    state.animals.forEach(animal => {
      const weightRecords = animal.weightRecords || [];
      weightRecords.forEach(record => {
        const recordDate = new Date(record.date);
        if (recordDate >= thirtyDaysAgo) {
          const dateKey = record.date;
          if (!dailyWeights[dateKey]) {
            dailyWeights[dateKey] = { total: 0, count: 0 };
          }
          dailyWeights[dateKey].total += record.weight;
          dailyWeights[dateKey].count++;
        }
      });
    });

    return Object.entries(dailyWeights)
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        averageWeight: data.total / data.count,
        totalWeight: data.total,
        animalCount: data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const exportToCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAnimals = () => {
    const data = state.animals.map(animal => ({
      'Tag Number': animal.tagNumber,
      'Type': animal.type,
      'Breed': animal.breed || '',
      'Sex': animal.sex,
      'Status': animal.status,
      'Camp': state.camps.find(c => c.id === animal.campId)?.name || '',
      'Birth Date': animal.birthdate,
      'Latest Weight': (animal.weightRecords || []).length > 0 
        ? (animal.weightRecords || [])[animal.weightRecords.length - 1].weight 
        : '',
      'Total Weight Gain': (animal.weightRecords || []).length >= 2 
        ? (animal.weightRecords || [])[animal.weightRecords.length - 1].weight - (animal.weightRecords || [])[0].weight 
        : '',
      'Weight Records': (animal.weightRecords || []).length
    }));
    exportToCSV(data, 'animals_report.csv');
  };

  const exportWeightData = () => {
    const data = state.animals
      .filter(animal => (animal.weightRecords || []).length > 0)
      .flatMap(animal => 
        (animal.weightRecords || []).map(record => ({
          'Tag Number': animal.tagNumber,
          'Type': animal.type,
          'Date': record.date,
          'Weight': record.weight,
          'Notes': record.notes || ''
        }))
      );
    exportToCSV(data, 'weight_data.csv');
  };

  const exportWeightGrowth = () => {
    exportToCSV(weightGrowthData, 'weight_growth_report.csv');
  };

  const exportFinances = () => {
    const data = state.transactions.map(transaction => ({
      'Date': transaction.date,
      'Type': transaction.type,
      'Description': transaction.description,
      'Amount': transaction.amount,
      'Location': transaction.location || ''
    }));
    exportToCSV(data, 'finances_report.csv');
  };

  const exportInventory = () => {
    const data = state.inventory.map(item => ({
      'Item': item.name,
      'Category': item.category,
      'Quantity': item.quantity,
      'Unit': item.unit,
      'Value': (item.price || 0) * item.quantity,
      'Location': ''
    }));
    exportToCSV(data, 'inventory_report.csv');
  };

  const exportCompleteData = () => {
    const data = {
      animals: state.animals,
      transactions: state.transactions,
      tasks: state.tasks,
      camps: state.camps,
      inventory: state.inventory,
      events: state.events
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'farm_data_backup.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const animalStatusData = [
    { name: 'Active', value: state.animals.filter(a => a.status === 'Active').length },
    { name: 'Sold', value: state.animals.filter(a => a.status === 'Sold').length },
    { name: 'Deceased', value: state.animals.filter(a => a.status === 'Deceased').length }
  ];

  const animalTypeData = Object.entries(
    state.animals.reduce((acc, animal) => {
      acc[animal.type] = (acc[animal.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({ name: type, value: count }));

  const financialData = state.transactions.reduce((acc, transaction) => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (transaction.type === 'income') {
      acc[month].income += transaction.amount;
    } else {
      acc[month].expense += transaction.amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const financialChartData = Object.entries(financialData).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    profit: data.income - data.expense
  }));

  const inventoryValueData = state.inventory.map(item => ({
    name: item.name,
    value: (item.price || 0) * item.quantity
  }));

  return (
    <div className="space-y-6 pb-20 sm:pb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h2>
          <p className="text-gray-600 dark:text-gray-400">Generate reports and view analytics for your farm</p>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedReport('animals')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedReport === 'animals'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Users className="h-4 w-4" />
            Animals
          </button>
          <button
            onClick={() => setSelectedReport('weight')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedReport === 'weight'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Scale className="h-4 w-4" />
            Weight Analytics
          </button>
          <button
            onClick={() => setSelectedReport('finances')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedReport === 'finances'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Finances
          </button>
          <button
            onClick={() => setSelectedReport('inventory')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
              selectedReport === 'inventory'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Inventory
          </button>
        </div>
      </div>

      {/* Animals Report */}
      {selectedReport === 'animals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Animal Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={animalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {animalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Animal Types
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={animalTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {animalTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Export Options
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={exportAnimals}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Animals Data
              </button>
              <button
                onClick={exportCompleteData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Complete Data Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weight Analytics Report */}
      {selectedReport === 'weight' && (
        <div className="space-y-6">
          {/* Weight Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                <span className="font-semibold text-emerald-600">Animals with Weight Data</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {weightStats.totalAnimals}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-600">Average Weight</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {weightStats.averageWeight.toFixed(1)} kg
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-600">Total Weight Gain</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {weightStats.totalGain.toFixed(1)} kg
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-600">Total Records</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {state.animals.reduce((total, animal) => total + (animal.weightRecords || []).length, 0)}
              </div>
            </div>
          </div>

          {/* Weight Growth Chart */}
          {weightGrowthData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Weight Growth by Animal (Top 20)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={weightGrowthData.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tagNumber" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} kg`, 
                      name === 'latestWeight' ? 'Latest Weight' : 'Total Gain'
                    ]}
                  />
                  <Bar dataKey="latestWeight" fill="#10b981" name="Latest Weight" />
                  <Bar dataKey="totalGain" fill="#3b82f6" name="Total Gain" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Weight Trends Over Time */}
          {getWeightTrends().length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Weight Trends (Last 30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={getWeightTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} kg`, 
                      name === 'averageWeight' ? 'Average Weight' : 'Total Weight'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="averageWeight" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Average Weight"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalWeight" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    name="Total Weight"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Weight Data Export
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={exportWeightData}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Weight Records
              </button>
              <button
                onClick={exportWeightGrowth}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Growth Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finances Report */}
      {selectedReport === 'finances' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Financial Performance
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={financialChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expense" />
                <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Export Options
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={exportFinances}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Financial Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Report */}
      {selectedReport === 'inventory' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              Inventory Value
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={inventoryValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Export Options
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={exportInventory}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Inventory Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 