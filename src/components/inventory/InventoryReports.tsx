import React, { useState, useMemo } from 'react';
import { useFarm } from '../../context/FarmContext';
import { InventoryItem } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  BarChart3,
  Calendar,
  Filter
} from 'lucide-react';

const categoryLabels: Record<InventoryItem['category'], string> = {
  medicine: 'Medicine',
  feed: 'Feed',
  fencing: 'Fencing',
  equipment: 'Equipment',
  other: 'Other',
};

const categoryColors: Record<InventoryItem['category'], string> = {
  medicine: 'bg-red-500',
  feed: 'bg-green-500',
  fencing: 'bg-blue-500',
  equipment: 'bg-purple-500',
  other: 'bg-gray-500',
};

export const InventoryReports: React.FC = () => {
  const { state } = useFarm();
  const inventory = state.inventory;
  const [selectedCategory, setSelectedCategory] = useState<InventoryItem['category'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity' | 'status'>('name');

  const filteredInventory = useMemo(() => {
    let filtered = inventory;
    if (selectedCategory !== 'all') {
      filtered = inventory.filter(item => item.category === selectedCategory);
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          const aValue = (a.price || 0) * a.quantity;
          const bValue = (b.price || 0) * b.quantity;
          return bValue - aValue;
        case 'quantity':
          return b.quantity - a.quantity;
        case 'status':
          const aLow = a.lowStockThreshold ? a.quantity <= a.lowStockThreshold : false;
          const bLow = b.lowStockThreshold ? b.quantity <= b.lowStockThreshold : false;
          return aLow === bLow ? 0 : aLow ? -1 : 1;
        default:
          return 0;
      }
    });
  }, [inventory, selectedCategory, sortBy]);

  const analytics = useMemo(() => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    const lowStockItems = inventory.filter(item => 
      item.lowStockThreshold ? item.quantity <= item.lowStockThreshold : item.quantity <= 0
    ).length;
    const expiredItems = inventory.filter(item => 
      item.expiryDate && new Date(item.expiryDate) < new Date()
    ).length;
    
    const categoryBreakdown = inventory.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valueByCategory = inventory.reduce((acc, item) => {
      const value = (item.price || 0) * item.quantity;
      acc[item.category] = (acc[item.category] || 0) + value;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems,
      totalValue,
      lowStockItems,
      expiredItems,
      categoryBreakdown,
      valueByCategory
    };
  }, [inventory]);

  const recentActivity = useMemo(() => {
    const allHistory = inventory.flatMap(item => 
      item.history.map(entry => ({
        ...entry,
        itemName: item.name,
        category: item.category
      }))
    );
    
    return allHistory
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [inventory]);

  return (
    <div className="p-4 pb-20 sm:pb-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Reports</h2>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="value">Sort by Value</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalItems}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.expiredItems}</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Items by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[category as InventoryItem['category']]}`}></div>
                  <span className="font-medium">{categoryLabels[category as InventoryItem['category']]}</span>
                </div>
                <span className="text-gray-600">{count} items</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Value by Category</h3>
          <div className="space-y-3">
            {Object.entries(analytics.valueByCategory).map(([category, value]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${categoryColors[category as InventoryItem['category']]}`}></div>
                  <span className="font-medium">{categoryLabels[category as InventoryItem['category']]}</span>
                </div>
                <span className="text-gray-600 font-semibold">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {analytics.lowStockItems > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Low Stock Alerts
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory
              .filter(item => item.lowStockThreshold ? item.quantity <= item.lowStockThreshold : item.quantity <= 0)
              .map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-800">{item.name}</h4>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Low Stock</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Current: {item.quantity} {item.unit}
                    {item.lowStockThreshold && ` | Threshold: ${item.lowStockThreshold} ${item.unit}`}
                  </p>
                  {item.price && (
                    <p className="text-sm text-gray-600">
                      Value: {formatCurrency(item.price * item.quantity)}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Inventory Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      {item.supplier && (
                        <div className="text-sm text-gray-500">Supplier: {item.supplier}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                      {categoryLabels[item.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.price ? formatCurrency(item.price) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.price ? formatCurrency(item.price * item.quantity) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.lowStockThreshold ? (
                      item.quantity <= item.lowStockThreshold ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.lastUsed ? new Date(item.lastUsed).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.change > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.itemName} - {activity.reason}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  <span className={activity.change > 0 ? 'text-green-600' : 'text-red-600'}>
                    {activity.change > 0 ? '+' : ''}{activity.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 