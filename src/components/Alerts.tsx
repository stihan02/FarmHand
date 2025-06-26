import React, { useEffect, useState } from 'react';
import { useFarm } from '../context/FarmContext';

const Alerts: React.FC = () => {
  const { state } = useFarm();
  const [alerts, setAlerts] = useState<string>('Loading smart alerts...');

  useEffect(() => {
    async function fetchAlerts() {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Review the current inventory, animals, and tasks. List any urgent alerts, low stock, expiring items, or important suggestions for the farmer.',
          farmData: {
            inventory: state.inventory,
            animals: state.animals,
            tasks: state.tasks,
          }
        }),
      });
      const data = await response.json();
      setAlerts(data[0]?.generated_text || 'No alerts.');
    }
    fetchAlerts();
  }, [state.inventory, state.animals, state.tasks]);

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded">
      <strong>AI Smart Alerts:</strong>
      <div className="mt-2 whitespace-pre-line">{alerts}</div>
    </div>
  );
};

export default Alerts; 