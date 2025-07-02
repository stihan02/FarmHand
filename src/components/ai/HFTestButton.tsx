import React, { useState } from 'react';

export const HFTestButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/hf-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Suggest animal health actions for a sheep with a cough.' })
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError('Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-4 p-4 border rounded">
      <button
        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
        onClick={handleTest}
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Hugging Face Proxy'}
      </button>
      {result && (
        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">{result}</pre>
      )}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}; 