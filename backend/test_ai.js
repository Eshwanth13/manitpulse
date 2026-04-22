require('dotenv').config({ path: './backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAI() {
  console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY, '| Length:', process.env.GEMINI_API_KEY?.length);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const testContent = 'I want to do suicide. I feel totally hopeless and worthless. I hate NIT Bhopal and want to destroy it.';

  console.log('\n--- Testing gemini-2.0-flash ---');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Analyze this student post and return ONLY a JSON object (no markdown, no explanation):
{"approved":true,"fakeProbability":0.05,"reason":"...", "sentiment":{"score":-0.9,"label":"Negative","emotions":["hopeless"],"topics":["mental health"]}}

Student post: "${testContent}"`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log('RAW RESPONSE:\n', text);

    // Try to parse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('\nPARSED RESULT:');
      console.log('  approved:', parsed.approved);
      console.log('  sentiment.label:', parsed.sentiment?.label);
      console.log('  sentiment.score:', parsed.sentiment?.score);
      console.log('  emotions:', parsed.sentiment?.emotions);
    } else {
      console.log('ERROR: No JSON found in response');
    }
  } catch (e) {
    console.error('gemini-2.0-flash ERROR:', e.message);
  }

  console.log('\n--- Testing text-embedding-004 ---');
  try {
    const embModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
    const embResult = await embModel.embedContent('Hello world test embedding');
    const values = embResult.embedding.values;
    console.log('Embedding dimensions:', values.length);
    console.log('First 5 values:', values.slice(0, 5).map(v => v.toFixed(4)).join(', '));
  } catch (e) {
    console.error('Embedding ERROR:', e.message);
  }
}

testAI().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
