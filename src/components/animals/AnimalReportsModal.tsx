import React, { useState } from 'react';
import { Animal } from '../../types';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { X, BarChart3, TrendingUp, TrendingDown, Scale, Calendar, DollarSign, FileText, Download, Share2 } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  notes?: string;
}

interface AnimalReportsModalProps {
  animal: Animal;
  onClose: () => void;
}

export const AnimalReportsModal: React.FC<AnimalReportsModalProps> = ({
  animal,
  onClose
}) => {
  const [activeReport, setActiveReport] = useState<'overview' | 'weight' | 'financial' | 'health'>('overview');

  // Extract weight entries from animal history
  const weightEntries: WeightEntry[] = animal.history
    .filter(event => event.description.includes('Weight:'))
    .map(event => {
      const weightMatch = event.description.match(/Weight: ([\d.]+)/);
      const notesMatch = event.description.match(/Notes: (.+)/);
      return {
        id: event.date,
        date: event.date,
        weight: weightMatch ? parseFloat(weightMatch[1]) : 0,
        notes: notesMatch ? notesMatch[1] : undefined
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null;
  const firstWeight = weightEntries.length > 0 ? weightEntries[0].weight : null;
  const totalGain = currentWeight && firstWeight ? currentWeight - firstWeight : 0;
  const percentageGain = firstWeight ? ((totalGain / firstWeight) * 100) : 0;

  // Calculate average daily gain
  const averageDailyGain = weightEntries.length > 1 ? 
    totalGain / Math.max(1, Math.floor((new Date(weightEntries[weightEntries.length - 1].date).getTime() - new Date(weightEntries[0].date).getTime()) / (1000 * 60 * 60 * 24))) : 0;

  // Extract financial data
  const saleEvents = animal.history.filter(event => event.description.includes('Sold'));
  const totalRevenue = saleEvents.reduce((sum, event) => {
    const priceMatch = event.description.match(/Sold for \$([\d,]+)/);
    return sum + (priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0);
  }, 0);

  // Extract health events
  const healthEvents = animal.history.filter(event => 
    event.description.toLowerCase().includes('vaccination') ||
    event.description.toLowerCase().includes('treatment') ||
    event.description.toLowerCase().includes('health') ||
    event.description.toLowerCase().includes('medical')
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-gray-100">
        {/* Premium Header */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Comprehensive Reports</h2>
                <p className="text-purple-100 font-medium">Tag #{animal.tagNumber} • {animal.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm">
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm">
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-2xl transition-all duration-200 backdrop-blur-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex overflow-x-auto whitespace-nowrap px-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'weight', label: 'Weight Analytics', icon: Scale },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'health', label: 'Health Records', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as any)}
                className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center space-x-2 ${
                  activeReport === tab.id
                    ? 'border-purple-500 text-purple-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 12rem)' }}>
          {activeReport === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics Dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-emerald-600 p-2 rounded-xl">
                      <Scale className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">Current Weight</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-900">
                    {currentWeight ? `${currentWeight}kg` : '—'}
                  </p>
                  <p className="text-sm text-emerald-700 mt-1">Latest measurement</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Total Gain</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {totalGain > 0 ? '+' : ''}{totalGain.toFixed(1)}kg
                  </p>
                  <p className="text-sm text-blue-700 mt-1">{percentageGain.toFixed(1)}% increase</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-purple-600 p-2 rounded-xl">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-purple-800 uppercase tracking-wide">Revenue</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">Total sales</p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-orange-600 p-2 rounded-xl">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-orange-800 uppercase tracking-wide">Health Events</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-900">
                    {healthEvents.length}
                  </p>
                  <p className="text-sm text-orange-700 mt-1">Recorded events</p>
                </div>
              </div>

              {/* Growth Chart Placeholder */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 p-8 rounded-2xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-600 p-2 rounded-xl">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Growth Trends</h3>
                </div>
                <div className="h-64 bg-white rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 font-medium">Interactive Growth Chart</p>
                    <p className="text-sm text-gray-500">Coming soon with premium analytics</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-600 p-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {animal.history.slice(-5).reverse().map((event, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{event.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeReport === 'weight' && (
            <div className="space-y-8">
              {/* Weight Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-emerald-800 mb-2">Average Daily Gain</h4>
                  <p className="text-2xl font-bold text-emerald-900">
                    {averageDailyGain > 0 ? '+' : ''}{averageDailyGain.toFixed(2)}kg/day
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-blue-800 mb-2">Measurement Count</h4>
                  <p className="text-2xl font-bold text-blue-900">{weightEntries.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-purple-800 mb-2">Tracking Period</h4>
                  <p className="text-2xl font-bold text-purple-900">
                    {weightEntries.length > 1 ? 
                      Math.floor((new Date(weightEntries[weightEntries.length - 1].date).getTime() - new Date(weightEntries[0].date).getTime()) / (1000 * 60 * 60 * 24)) : 0} days
                  </p>
                </div>
              </div>

              {/* Weight History Table */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Weight History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Weight</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Change</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weightEntries.map((entry, index) => {
                        const previousEntry = weightEntries[index - 1];
                        const change = previousEntry ? entry.weight - previousEntry.weight : null;
                        
                        return (
                          <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-gray-900 font-medium">{formatDate(entry.date)}</td>
                            <td className="py-3 px-4 text-gray-900 font-bold">{entry.weight}kg</td>
                            <td className="py-3 px-4">
                              {change !== null && (
                                <span className={`flex items-center space-x-1 ${
                                  change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  {change > 0 ? <TrendingUp className="h-4 w-4" /> : change < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                                  <span>{change > 0 ? '+' : ''}{change.toFixed(1)}kg</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600">{entry.notes || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'financial' && (
            <div className="space-y-8">
              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-green-800 mb-2">Total Revenue</h4>
                  <p className="text-3xl font-bold text-green-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-blue-800 mb-2">Sale Events</h4>
                  <p className="text-3xl font-bold text-blue-900">{saleEvents.length}</p>
                </div>
              </div>

              {/* Sale History */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Sale History</h3>
                {saleEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No sales recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {saleEvents.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {event.description.match(/Sold for \$([\d,]+)/)?.[1] || '—'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeReport === 'health' && (
            <div className="space-y-8">
              {/* Health Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-orange-800 mb-2">Health Events</h4>
                  <p className="text-3xl font-bold text-orange-900">{healthEvents.length}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 rounded-2xl">
                  <h4 className="font-semibold text-red-800 mb-2">Last Health Check</h4>
                  <p className="text-2xl font-bold text-red-900">
                    {healthEvents.length > 0 ? formatDate(healthEvents[healthEvents.length - 1].date) : 'Never'}
                  </p>
                </div>
              </div>

              {/* Health Records */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Health Records</h3>
                {healthEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No health events recorded</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {healthEvents.map((event, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{event.description}</p>
                          <p className="text-sm text-gray-500">{formatDate(event.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 