import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('AI endpoint hit');
    const { prompt, farmData } = req.body;
    console.log('Received prompt:', prompt);
    console.log('Received farmData:', farmData);

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      console.error('Missing Hugging Face API key');
      return res.status(500).json({ error: 'Missing Hugging Face API key' });
    }

    const context = `
Farm Inventory: ${JSON.stringify(farmData?.inventory)}
Animals: ${JSON.stringify(farmData?.animals)}
Tasks: ${JSON.stringify(farmData?.tasks)}
User: ${prompt}
Respond as a helpful farm management assistant. Give smart alerts and suggestions.
    `;
    console.log('Sending context to Hugging Face:', context);

    const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: context }),
    });
    console.log('Hugging Face response status:', response.status);
    const data = await response.json();
    console.log('Hugging Face response data:', data);

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Unknown error' });
  }
} "// trigger vercel redeploy" 
