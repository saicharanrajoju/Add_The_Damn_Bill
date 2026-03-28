// Mock data used when the API route is unavailable (e.g. plain `npm run dev`)
const MOCK_ITEMS = [
  { name: 'Spicy Tuna Roll',    price: 14.50 },
  { name: 'Dragon Roll',        price: 16.00 },
  { name: 'Miso Soup',          price:  4.00 },
  { name: 'Edamame',            price:  6.50 },
  { name: 'Asahi Beer (Large)', price:  9.00 },
  { name: 'Green Tea Mochi',    price:  5.50 },
  { name: 'Tax',                price:  4.75 },
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Convert a File to a base64 string (no data-URL prefix). */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });
}

/**
 * Extracts line items from a receipt image.
 * In production (Vercel) the call goes through /api/extract so the
 * Gemini API key never touches the client bundle.
 * When /api/extract is unavailable (plain `npm run dev` without vercel dev)
 * it falls back to mock data so the UI remains fully testable.
 */
export async function extractReceiptItems(imageFile) {
  const base64   = await fileToBase64(imageFile);
  const mimeType = imageFile.type;

  try {
    const response = await fetch('/api/extract', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ base64, mimeType }),
    });

    // 503 = no API key configured on the server → use mock in dev
    if (response.status === 503) {
      console.warn('No GEMINI_API_KEY on server — using mock receipt data.');
      await delay(2000);
      return { items: MOCK_ITEMS };
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    return response.json();
  } catch (err) {
    // Network failure = likely running plain `npm run dev` (no /api route)
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      console.warn('API route unreachable — using mock receipt data.');
      await delay(2000);
      return { items: MOCK_ITEMS };
    }
    throw err;
  }
}
