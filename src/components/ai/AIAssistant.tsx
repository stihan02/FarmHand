import React, { useState } from 'react';
import { Animal, HealthRecord } from '../../types';
import { useFarm } from '../../context/FarmContext';

interface AIAssistantProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ open: controlledOpen, setOpen: setControlledOpen }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const { state } = useFarm();

  const handleAsk = async () => {
    setLoading(true);
    setResponse('');
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: question,
          farmData: {
            animals: state.animals,
            inventory: state.inventory,
            tasks: state.tasks,
          },
        }),
      });
      const data = await response.json();
      const result = data[0]?.generated_text || 'Sorry, I could not answer.';
      setResponse(result);
    } catch (err: any) {
      setResponse('Sorry, there was an error contacting the AI service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 3000,
          background: '#2d7d46',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          fontSize: 28,
          boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          cursor: 'pointer',
          display: setControlledOpen ? 'none' : 'block',
        }}
        title="Ask AI Assistant"
      >
        🤖
      </button>
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 28,
          width: 370,
          background: 'white',
          borderRadius: 12,
          boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
          zIndex: 3001,
          padding: 24,
          fontFamily: 'Inter, Arial, sans-serif',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <strong style={{ fontSize: 20 }}>AI Assistant</strong>
            <button onClick={() => setOpen(false)} style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>×</button>
          </div>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask about inbreeding, biosecurity, grazing, etc..."
            style={{ width: '100%', minHeight: 60, border: '1px solid #ccc', borderRadius: 6, padding: 8, fontSize: 15, marginBottom: 10 }}
          />
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            style={{ background: '#2d7d46', color: 'white', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15 }}
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
          {response && (
            <div style={{ marginTop: 18, background: '#f6f6f6', borderRadius: 6, padding: 12, color: '#333', fontSize: 15 }}>
              {response}
            </div>
          )}
        </div>
      )}
    </>
  );
};