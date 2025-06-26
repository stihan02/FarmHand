import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { prompt, farmData } = req.body;
  const context = `
Farm Inventory: ${JSON.stringify(farmData.inventory)}
Animals: ${JSON.stringify(farmData.animals)}
Tasks: ${JSON.stringify(farmData.tasks)}
User: ${prompt}
Respond as a helpful farm management assistant. Give smart alerts and suggestions.
  `;
  const response = await fetch('https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: context }),
  });
  const data = await response.json();
  res.status(200).json(data);
} 