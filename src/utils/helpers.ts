import { useEffect, useState } from 'react';

export const calculateAge = (birthdate: string): string => {
  try {
    const birth = new Date(birthdate);
    const now = new Date();
    const ageInDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(ageInDays / 365);
    const months = Math.floor((ageInDays % 365) / 30);
    
    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m`;
    } else {
      return `${ageInDays}d`;
    }
  } catch {
    return 'Unknown';
  }
};

export const formatCurrency = (amount: number): string => {
  return `R${amount.toFixed(2)}`;
};

export const formatDate = (date: string): string => {
  try {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return date;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

/**
 * Calls the Hugging Face Inference API (google/flan-t5-base) with a prompt and returns the result.
 * NOTE: Your Hugging Face token must have 'Inference API' permission, not just 'Read'.
 * @param prompt The user question or prompt string.
 * @returns The model's response as a string.
 */
export async function askHuggingFaceFlanT5(prompt: string): Promise<string> {
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN;
  if (!HF_TOKEN) {
    return 'Hugging Face API token is missing. Please set VITE_HF_TOKEN in your .env file.';
  }
  // Use a different public model for testing
  const endpoint = 'https://api-inference.huggingface.co/models/bigscience/bloom-560m';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    const text = await response.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Not JSON, treat as plain text error
      return `Hugging Face API error: ${text}. This may mean the model is unavailable, the endpoint is incorrect, or your token is invalid or missing 'Inference API' permission. [Raw response: ${text}]`;
    }
    if (!response.ok) {
      if (data.error && data.error.includes('loading')) {
        return 'The model is loading on Hugging Face. Please wait a few seconds and try again.';
      }
      return `Hugging Face API error: ${data.error || response.statusText} [Status: ${response.status}]`;
    }
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    if (typeof data === 'object' && data.generated_text) {
      return data.generated_text.trim();
    }
    if (data.error && data.error.includes('loading')) {
      return 'The model is loading on Hugging Face. Please wait a few seconds and try again.';
    }
    throw new Error('Unexpected Hugging Face API response: ' + JSON.stringify(data));
  } catch (err: any) {
    return `Error: ${err.message || 'Failed to contact Hugging Face API.'}`;
  }
}

export function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}