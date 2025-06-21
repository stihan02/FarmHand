import React, { useState } from 'react';
import { Animal, HealthRecord } from '../../types';

interface AIAssistantProps {
  animals: Animal[];
  onUpdateAnimal: (animalId: string, updates: Partial<Animal>) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ animals, onUpdateAnimal }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      // Here you would integrate with your preferred AI service (e.g., OpenAI, Claude, etc.)
      // For now, we'll just simulate a response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Example response based on query keywords
      let aiResponse = '';
      if (query.toLowerCase().includes('health')) {
        aiResponse = generateHealthRecommendations();
      } else if (query.toLowerCase().includes('genetic')) {
        aiResponse = analyzeGenetics();
      } else if (query.toLowerCase().includes('breeding')) {
        aiResponse = suggestBreedingPairs();
      } else {
        aiResponse = "I can help you with health monitoring, genetic analysis, breeding recommendations, and general farm management. Please ask a specific question about these topics.";
      }
      
      setResponse(aiResponse);
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateHealthRecommendations = () => {
    const dueForCheckup = animals.filter(animal => {
      const lastCheckup = animal.health
        .filter(record => record.type === 'Check-up')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (!lastCheckup) return true;
      
      const lastCheckupDate = new Date(lastCheckup.date);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      return lastCheckupDate < threeMonthsAgo;
    });

    if (dueForCheckup.length > 0) {
      return `The following animals are due for a health check-up:\n${dueForCheckup
        .map(animal => `- ${animal.type} #${animal.tagNumber} (Last checkup: ${
          animal.health.find(h => h.type === 'Check-up')?.date || 'Never'
        })`)
        .join('\n')}`;
    }

    return 'All animals are up to date with their health check-ups.';
  };

  const analyzeGenetics = () => {
    const breedCounts = animals.reduce((acc, animal) => {
      if (animal.breed) {
        acc[animal.breed] = (acc[animal.breed] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const analysis = [
      'Genetic Diversity Analysis:',
      ...Object.entries(breedCounts).map(([breed, count]) => 
        `- ${breed}: ${count} animals (${((count / animals.length) * 100).toFixed(1)}%)`
      )
    ];

    return analysis.join('\n');
  };

  const suggestBreedingPairs = () => {
    const females = animals.filter(a => a.sex === 'F' && a.status === 'Active');
    const males = animals.filter(a => a.sex === 'M' && a.status === 'Active');

    if (females.length === 0 || males.length === 0) {
      return 'Not enough animals of both sexes for breeding recommendations.';
    }

    // Simple breeding pair suggestions (you would want more sophisticated genetic analysis in production)
    const suggestions = females
      .slice(0, 3)
      .map(female => {
        const male = males.find(m => 
          m.type === female.type && 
          m.tagNumber !== female.fatherTag && // Avoid inbreeding
          !female.offspringTags.some(tag => m.motherTag === tag) // Avoid breeding with offspring
        );

        if (male) {
          return `Suggested pair:\n- Female: ${female.type} #${female.tagNumber}\n- Male: ${male.type} #${male.tagNumber}`;
        }
        return null;
      })
      .filter(Boolean)
      .join('\n\n');

    return suggestions || 'No suitable breeding pairs found based on current criteria.';
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-gray-200 dark:border-zinc-700 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">AI Farm Assistant</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ask me about health monitoring, genetic analysis, or breeding recommendations
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Which animals need health check-ups?"
              className="flex-1 rounded-lg border border-gray-300 dark:border-zinc-700 px-4 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-gray-100"
            />
            <button
              onClick={handleAskAI}
              disabled={loading || !query}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Thinking...' : 'Ask AI'}
            </button>
          </div>
        </div>

        {response && (
          <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 font-mono">
              {response}
            </pre>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setQuery('Show health check-ups needed');
                handleAskAI();
              }}
              className="text-sm bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg"
            >
              Health Check-ups
            </button>
            <button
              onClick={() => {
                setQuery('Analyze genetics');
                handleAskAI();
              }}
              className="text-sm bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg"
            >
              Genetic Analysis
            </button>
            <button
              onClick={() => {
                setQuery('Suggest breeding pairs');
                handleAskAI();
              }}
              className="text-sm bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-lg"
            >
              Breeding Pairs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};