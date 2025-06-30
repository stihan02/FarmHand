import React, { useEffect, useState } from 'react';
import { useFarm } from '../context/FarmContext';

const Alerts: React.FC = () => {
  const { state } = useFarm();
  const [alerts, setAlerts] = useState<string>('Loading smart alerts...');

  useEffect(() => {
    async function fetchAlerts() {
      // Remove: const response = await fetch('/api/ai-api', {
      // Remove: const data = await response.json();
      // Remove: <strong>AI Smart Alerts:</strong>
      setAlerts('No alerts.');
    }
    fetchAlerts();
  }, [state.inventory, state.animals, state.tasks]);

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 my-4 rounded">
      {/* Remove: <strong>AI Smart Alerts:</strong> */}
      <div className="mt-2 whitespace-pre-line">{alerts}</div>
    </div>
  );
};

export default Alerts; 