import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Cloud, CloudRain, Wind } from 'lucide-react';

const API_KEY = '827f3f3a85684f82a31115408252206';

// A placeholder for the actual API response type
interface WeatherData {
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        daily_chance_of_rain: number;
        maxwind_kph: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }[];
  };
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  if (condition.toLowerCase().includes('rain')) return <CloudRain className="h-10 w-10 text-blue-400" />;
  if (condition.toLowerCase().includes('cloud') || condition.toLowerCase().includes('overcast')) return <Cloud className="h-10 w-10 text-gray-400" />;
  return <Sun className="h-10 w-10 text-yellow-400" />;
};

export const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (latitude: number, longitude: number) => {
      try {
        const response = await axios.get<WeatherData>(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=3`);
        setWeather(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Could not fetch weather data.');
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        // Fallback to a default location if user denies permission
        console.warn(`Geolocation error: ${err.message}. Falling back to default location.`);
        fetchWeather(51.5074, -0.1278); // London coordinates
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Weather Forecast</h3>
        <p className="text-gray-600 dark:text-gray-400">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Weather Forecast</h3>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">3-Day Weather Forecast</h3>
      <div className="grid grid-cols-3 gap-4">
        {weather?.forecast.forecastday.map((day, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-gray-50 dark:bg-zinc-700">
            <p className="font-bold text-gray-800 dark:text-gray-200">
              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            <WeatherIcon condition={day.day.condition.text} />
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{Math.round(day.day.maxtemp_c)}°C</p>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <CloudRain className="h-4 w-4" />
              <span>{day.day.daily_chance_of_rain}%</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Wind className="h-4 w-4" />
              <span>{Math.round(day.day.maxwind_kph)} kph</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 