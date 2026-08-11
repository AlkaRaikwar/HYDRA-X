/**
 * IBM Granite via watsonx.ai — with transparent DEMO MODE fallback.
 * Set WATSONX_API_KEY, PROJECT_ID, WATSONX_AI_URL in .env to use real IBM Granite.
 * Without those variables the service returns clearly-labelled demo responses.
 */

const axios = require('axios');

const WATSONX_AI_URL = process.env.WATSONX_AI_URL || 'https://us-south.ml.cloud.ibm.com';
const PROJECT_ID = process.env.PROJECT_ID;
const WATSONX_API_KEY = process.env.WATSONX_API_KEY;
// IBM Granite 3.3 8B (lightweight, multilingual)
const MODEL_ID = process.env.GRANITE_MODEL_ID || 'ibm/granite-3-3-8b-instruct';

let cachedToken = null;
let tokenExpiry = 0;

async function getIAMToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const resp = await axios.post(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: WATSONX_API_KEY
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  cachedToken = resp.data.access_token;
  tokenExpiry = Date.now() + (resp.data.expires_in - 60) * 1000;
  return cachedToken;
}

async function callGranite(systemPrompt, userMessage) {
  if (!WATSONX_API_KEY || !PROJECT_ID) {
    return null; // trigger demo mode in callers
  }
  try {
    const token = await getIAMToken();
    const url = `${WATSONX_AI_URL}/ml/v1/text/chat?version=2024-05-31`;
    const payload = {
      model_id: MODEL_ID,
      project_id: PROJECT_ID,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      parameters: {
        max_new_tokens: 600,
        temperature: 0.3,
        top_p: 0.9
      }
    };
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return resp.data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error('[Granite] API error:', err.response?.data || err.message);
    return null; // fallback to demo mode
  }
}

module.exports = { callGranite };
