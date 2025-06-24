import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Leaf } from 'lucide-react';

const API_KEY = 'YOUR_KEY_HERE';
const POLYGON_ID = 'YOUR_POLYGON_ID';

interface NdviDataPoint {
  dt: number;
  data: {
    mean: number;
  };
}

const formatXAxis = (tickItem: number) => {
  return new Date(tickItem * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const NDVIChart = () => {
  const [ndviData, setNdviData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentNdvi, setCurrentNdvi] = useState<number | null>(null);

  useEffect(() => {
    const fetchNdviData = async () => {
      const end = Math.floor(Date.now() / 1000);
      const start = end - (30 * 24 * 60 * 60); // 30 days ago

      try {
        const response = await axios.get<NdviDataPoint[]>(`http://api.agromonitoring.com/agro/1.0/ndvi/history?start=${start}&end=${end}&polyid=${POLYGON_ID}&appid=${API_KEY}`);
        
        const chartData = response.data.map(item => ({
          date: item.dt,
          ndvi: parseFloat(item.data.mean.toFixed(2))
        })).sort((a, b) => a.date - b.date);
        
        setNdviData(chartData);
        if (chartData.length > 0) {
            setCurrentNdvi(chartData[chartData.length - 1].ndvi);
        }
        
      } catch (err) {
        setError('Could not fetch NDVI data. Please check your API key and Polygon ID.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (API_KEY === 'YOUR_KEY_HERE' || POLYGON_ID === 'YOUR_POLYGON_ID') {
        setError('Please provide your Agromonitoring API key and Polygon ID.');
        setLoading(false);
        return;
    }
    fetchNdviData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">NDVI Vegetation Health</h3>
        <p className="text-gray-600 dark:text-gray-400">Loading NDVI data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">NDVI Vegetation Health</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">NDVI Vegetation Health</h3>
        {currentNdvi !== null && (
            <div className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-green-500" />
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{currentNdvi}</span>
            </div>
        )}
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={ndviData}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="date" tickFormatter={formatXAxis} />
            <YAxis domain={[0, 1]} />
            <Tooltip 
                labelFormatter={formatXAxis}
                formatter={(value: number) => [value.toFixed(2), "NDVI"]}
            />
            <Legend />
            <Line type="monotone" dataKey="ndvi" stroke="#4ade80" strokeWidth={2} dot={false} name="NDVI (mean)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}; 