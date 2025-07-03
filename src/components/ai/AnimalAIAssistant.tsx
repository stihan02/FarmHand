import React, { useState } from 'react';
import { Animal } from '../../types';
import { formatDate } from '../../utils/helpers';

interface AnimalAIAssistantProps {
  animal: Animal;
  allAnimals: Animal[];
}

export const AnimalAIAssistant: React.FC<AnimalAIAssistantProps> = ({ animal, allAnimals }) => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to build a rich prompt for Ollama
  const buildPrompt = () => {
    return `You are an expert livestock AI assistant. Analyze the following animal and herd data, and provide:
- Smart alerts and notifications (health, breeding, genetics, overdue tasks, etc.)
- Automated recommendations and next actions
- Data analysis and insights
- Task and reminder suggestions
- Detailed reports if relevant
- User guidance and help
- If a user question is provided, answer it in detail

Animal:
${JSON.stringify(animal, null, 2)}

Herd:
${JSON.stringify(allAnimals.slice(0, 20), null, 2)}

User question: ${question || 'None'}

Respond in clear, actionable bullet points where possible.`;
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch('/api/ollama-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: buildPrompt() })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Invalid server response');
      }
      const data = await res.json();
      let aiResponse = '';
      if (data.response) {
        aiResponse = data.response;
      } else if (Array.isArray(data) && data[0]?.generated_text) {
        aiResponse = data[0].generated_text;
      } else if (typeof data === 'string') {
        aiResponse = data;
      } else {
        aiResponse = JSON.stringify(data);
      }
      setResponse(aiResponse);
    } catch (err: any) {
      setError(err.message || 'AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-2">
      <h3 className="font-semibold text-emerald-700 mb-2">AI Assistant</h3>
      <form onSubmit={handleAsk} className="flex flex-col gap-2 mb-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          placeholder="Ask the AI anything about this animal or your herd..."
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={2}
        />
        <button
          type="submit"
          className="self-end bg-emerald-600 text-white px-4 py-1 rounded hover:bg-emerald-700 disabled:bg-gray-300"
          disabled={loading || !question.trim()}
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {response && (
        <div className="bg-white border border-emerald-100 rounded p-3 text-sm whitespace-pre-line mt-2">
          {response}
        </div>
      )}
      {!response && !loading && (
        <div className="text-gray-600 text-sm">The AI can analyze health, breeding, genetics, history, and answer your questions. Try asking for recommendations or insights!</div>
      )}
    </div>
  );
}; 