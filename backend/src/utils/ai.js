const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const axios = require('axios');

// Initialise the clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const TEXT_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

const EMBED_MODELS = [
  'text-embedding-004',
  'embedding-001',
];

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function isApiKeyConfigured() {
  const provider = process.env.AI_PROVIDER || 'gemini';
  if (provider === 'openrouter') return !!process.env.OPENROUTER_API_KEY;
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && key !== 'your-gemini-api-key-here' && key.length > 10);
}

function extractJSON(text) {
  try {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) return JSON.parse(codeBlock[1].trim());
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return JSON.parse(text);
  } catch (e) {
    console.error('[AI] JSON Extraction failed. Raw text:', text.substring(0, 100));
    throw new Error('Invalid AI response format');
  }
}

// ─── Get Embedding ────────────────────────────────────────────────────────────
async function getEmbedding(text) {
  if (!isApiKeyConfigured()) return [];
  const provider = process.env.AI_PROVIDER || 'gemini';
  
  // Embeddings currently use direct Gemini as they are free and stable
  for (const modelName of EMBED_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.embedContent(text);
      if (result.embedding?.values) return result.embedding.values;
    } catch (err) {
      // Quietly skip if not available
    }
  }
  return [];
}
async function moderateAndAnalyze(content, isSuspectedDuplicate = false) {
  const safeDefault = {
    approved: true,
    fakeProbability: 0.05,
    reason: 'AI fallthrough (Check API Key)',
    sentiment: { score: 0.01, label: 'Neutral', emotions: ['neutral'], topics: [] },
  };

  if (!isApiKeyConfigured()) return safeDefault;

  const prompt = `Analyze this student post for a university feedback platform (CampusVani, MANIT Bhopal):
"${content}"

IsSuspectedDuplicate: ${isSuspectedDuplicate}

Instructions: Return ONLY a JSON object.
Format:
{
  "approved": boolean,
  "fakeProbability": number (0.0 to 1.0),
  "reason": "brief reason for decision",
  "sentiment": {
    "score": number (-1.0 to 1.0),
    "label": "Positive" | "Negative" | "Neutral" | "Mixed",
    "emotions": ["joy", "anger", "frustration", "hope", etc.],
    "topics": ["Hostel", "Placement", "Academics", "Security", etc.]
  }
}

Guidelines:
- If toxicity/abuse: approved = false.
- Extreme despair: score = -1.0, approved = true.
- FakeProbability: Increase (0.8-1.0) if content is factually impossible (e.g., "sun rises on west"), gibberish, spam, or nonsense.
- Topics: 1-3 keywords.`;

  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'openrouter') {
    try {
      const modelId = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct';
      console.log(`[AI] Submitting to OpenRouter (${modelId})...`);
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1000
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:5000',
          'X-Title': 'CampusVani'
        }
      });

      const parsed = extractJSON(response.data.choices[0].message.content);
      console.log(`[AI] OpenRouter SUCCESS! Fake Prob: ${parsed.fakeProbability}`);
      
      return {
        approved: parsed.approved !== false,
        fakeProbability: Number(parsed.fakeProbability) || (isSuspectedDuplicate ? 0.9 : 0.05),
        reason: parsed.reason || 'Verified',
        sentiment: {
          score: Number(parsed.sentiment?.score) ?? 0.01,
          label: parsed.sentiment?.label || 'Neutral',
          emotions: Array.isArray(parsed.sentiment?.emotions) ? parsed.sentiment.emotions : [],
          topics: Array.isArray(parsed.sentiment?.topics) ? parsed.sentiment.topics : [],
        }
      };
    } catch (err) {
      console.error(`[AI] OpenRouter failed: ${err.response?.data?.error?.message || err.message}`);
      console.log('[AI] Attempting fallback to Gemini Direct...');
    }
  }

  // Fallback to Gemini Direct (if OpenRouter failed OR if provider is 'gemini')
  for (const modelName of TEXT_MODELS) {
      try {
        console.log(`[AI] Submitting to Gemini: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);
        
        if (!result.response) continue;
        
        const text = result.response.text().trim();
        const parsed = extractJSON(text);

        console.log(`[AI] Gemini SUCCESS! Fake Prob: ${parsed.fakeProbability}`);
        
        return {
          approved: parsed.approved !== false,
          fakeProbability: Number(parsed.fakeProbability) || (isSuspectedDuplicate ? 0.9 : 0.05),
          reason: parsed.reason || 'Verified',
          sentiment: {
            score: Number(parsed.sentiment?.score) ?? 0.01,
            label: parsed.sentiment?.label || 'Neutral',
            emotions: Array.isArray(parsed.sentiment?.emotions) ? parsed.sentiment.emotions : [],
            topics: Array.isArray(parsed.sentiment?.topics) ? parsed.sentiment.topics : [],
          }
        };
      } catch (err) {
        console.error(`[AI] Gemini attempt with ${modelName} failed: ${err.message}`);
      }
    }


  console.warn(`[AI] ALL MODELS FAILED. Using safeDefault.`);
  return safeDefault;
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
  const dot = vecA.reduce((s, a, i) => s + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((s, a) => s + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((s, b) => s + b * b, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

async function generatePersonalTips(posts) {
  if (!isApiKeyConfigured() || !posts || posts.length === 0) return ['Your voice matters.'];
  
  const snippets = posts.slice(0, 5).map(p => p.content).join('\n---\n');
  const prompt = `Based on these recent thoughts shared by a MANIT student:
${snippets}

Provide 3 short, helpful AI-generated tips or reflections. 
Keep them very concise (max 12 words each).
Avoid generic advice; tailor it to their vibe.
Return ONLY a JSON array of strings: ["Tip 1", "Tip 2", "Tip 3"]`;

  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'openrouter') {
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500
      }, {
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
      });
      return extractJSON(response.data.choices[0].message.content);
    } catch (err) {
      console.error(`[AI] OpenRouter tips failed:`, err.message);
    }
  } else {
    for (const modelName of TEXT_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);
        return extractJSON(result.response.text());
      } catch (err) {
        console.error(`[AI] Gemini tips failed for ${modelName}:`, err.message);
      }
    }
  }
  return ['Your voice matters.', 'Thank you for sharing your feedback.', 'CampusVani is here to amplify student concerns.'];
}

async function generateWeeklyReportContent(data) {
  if (!isApiKeyConfigured()) throw new Error('AI Unavailable');

  const prompt = `Generate a high-level sentiment report summary for MANIT Bhopal administration.
Data Highlights:
${JSON.stringify(data, null, 2)}

Instructions: Return ONLY a JSON object with these EXACT keys:
{
  "summary": "2-3 sentences overall mood",
  "concerns": ["list", "of", "top", "concerns"],
  "trendAnalysis": "briefly explain shift in mood",
  "recommendations": ["step 1", "step 2", "step 3"]
}
Tone: Professional, urgent if sentiment is low, and data-driven.`;

  const provider = process.env.AI_PROVIDER || 'gemini';

  if (provider === 'openrouter') {
    try {
      const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
        model: process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1500
      }, {
        headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
      });
      return extractJSON(response.data.choices[0].message.content);
    } catch (err) {
      console.error(`[AI] OpenRouter report failed:`, err.message);
    }
  } else {
    for (const modelName of TEXT_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);
        return extractJSON(result.response.text());
      } catch (err) {
        console.error(`[AI] Gemini report failed for ${modelName}:`, err.message);
      }
    }
  }
  throw new Error('AI failed to generate report content.');
}

module.exports = { getEmbedding, cosineSimilarity, moderateAndAnalyze, generatePersonalTips, generateWeeklyReportContent, isApiKeyConfigured };

