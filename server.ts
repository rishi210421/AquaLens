import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiAvailable: !!aiClient,
    environment: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  if (password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters' });
  }

  const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  const user = {
    id: `usr_${Date.now()}`,
    email,
    name,
    role: email.toLowerCase().includes('admin') ? 'Catchment Administrator' : 'Stream Field Analyst',
    token: `aq_token_${Buffer.from(email + ':' + Date.now()).toString('base64')}`,
  };

  return res.json({ success: true, user });
});

app.post('/api/auth/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No active session' });
  }
  return res.json({ valid: true });
});

// AI Summarization endpoint (Strictly grounded in structured analytics)
app.post('/api/ai/summarize', async (req, res) => {
  const { siteName, streamName, city, period, overallScore, deltas, confidence, keyFactors } = req.body;

  if (!aiClient) {
    // Graceful fallback response if no key configured
    return res.json({
      summary: null,
      source: 'deterministic-fallback-required',
      reason: 'No Gemini API key available on server. Use deterministic rule engine.',
    });
  }

  try {
    const prompt = `You are the AquaLens Environmental Intelligence Engine for OneAquaHealth (Data-to-Insight).
Summarize the following verified stream health telemetry for the site in 2 to 3 concise, scientific sentences.

Site: ${siteName || 'Unknown Site'} (${streamName || 'Urban Stream'}, ${city || 'Urban Region'})
Period: ${period || 'Last 30 Days'}
Composite Stream Health Indicator: ${overallScore}/100
Confidence: ${confidence || 'Medium'}
Period Changes:
- Water Quality: ${deltas?.waterQuality ?? 0 > 0 ? '+' : ''}${deltas?.waterQuality ?? 0}%
- Biodiversity: ${deltas?.biodiversity ?? 0 > 0 ? '+' : ''}${deltas?.biodiversity ?? 0}%
- Habitat Condition: ${deltas?.habitat ?? 0 > 0 ? '+' : ''}${deltas?.habitat ?? 0}%
- Citizen Pollution Signal: ${deltas?.pollution ?? 0 > 0 ? '+' : ''}${deltas?.pollution ?? 0}%
Key Contributing Factors: ${(keyFactors || []).join('; ') || 'Standard seasonal baseline'}

MANDATORY RULES:
1. Ground your response ONLY in the numbers and facts provided above. Do not hallucinate external events, chemicals, or diseases.
2. Never make human medical diagnoses or claims like "this water will make people sick".
3. Use careful One Health evidence framing (e.g., "These environmental conditions may be relevant to ecosystem and community well-being; continued monitoring is recommended").
4. Explicitly state the data confidence level (${confidence}).
5. Keep it strictly under 75 words.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const summaryText = response.text?.trim() || '';
    return res.json({
      summary: summaryText,
      source: 'gemini-3.8-flash',
      confidence,
    });
  } catch (error: any) {
    console.error('Gemini summarization error:', error);
    return res.status(500).json({
      error: 'AI summarization failed',
      details: error.message,
    });
  }
});

// AI Q&A Endpoint for Ask AquaLens
app.post('/api/ai/ask', async (req, res) => {
  const { question, datasetContext } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  if (!aiClient) {
    return res.json({
      answer: null,
      source: 'deterministic-fallback-required',
    });
  }

  try {
    const prompt = `You are AquaLens Assistant, an environmental analytics expert for urban streams and the OneAquaHealth initiative.
Answer the user's question using ONLY the provided structured dataset context.

Dataset Context:
${JSON.stringify(datasetContext || {}, null, 2)}

User Question: "${question}"

RULES:
- Answer in 2-4 direct, informative sentences.
- Cite specific sites, indicators, and scores from the context.
- Mention data confidence and completeness where relevant.
- Do NOT make medical or disease claims. Connect stream health to One Health concepts using evidence-based phrasing.
- If the question cannot be answered by the context, state what is missing and suggest exploring the Map or Sites view.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({
      answer: response.text?.trim() || '',
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Gemini Q&A error:', error);
    return res.status(500).json({
      error: 'AI query failed',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AquaLens server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
