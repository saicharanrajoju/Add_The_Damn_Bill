import { GoogleGenerativeAI } from '@google/generative-ai';

// Allow large base64 image payloads (up to 10 MB)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const PROMPT = `
You are an intelligent receipt parsing AI.
Analyze the attached receipt image and extract the purchased items, as well as any tax, tip, or fees.
Treat EVERYTHING that costs money as a line item in the "items" array.
Do NOT try to extract subtotal or total separately, just the distinct line items.

Respond ONLY with a valid JSON object matching this exact structure:
{
  "items": [
    { "name": "Spicy Tuna Roll", "price": 12.50 },
    { "name": "State Tax", "price": 2.50 }
  ]
}

Rules:
- Ensure price is a number, not a string. Include decimals.
- Include actual items, tax, and tip as their own objects in the items array.
- Exclude "Total" or "Subtotal" line items, as we will sum the parts ourselves.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // No API key → return 503 so the client can fall back to mock data in dev
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const { base64, mimeType } = req.body || {};
  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType in request body' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: PROMPT },
          { inlineData: { data: base64, mimeType } },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    });

    const raw     = result.response.text().trim();
    const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const data    = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (err) {
    console.error('Gemini API error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error from Gemini' });
  }
}
