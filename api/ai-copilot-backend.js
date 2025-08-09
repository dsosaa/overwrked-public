// ========== AI COPILOT BACKEND SERVICE ==========
// Server-side handler for AI API calls
// Deploy this on your backend server (Vercel, Netlify Functions, AWS Lambda, etc.)

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const CONFIG = {
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo-preview']
  },
  anthropic: {
    apiUrl: 'https://api.anthropic.com/v1/messages',
    models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
  },
  google: {
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
    models: ['gemini-pro', 'gemini-pro-vision']
  },
  ollama: {
    apiUrl: 'http://localhost:11434/api/generate',
    models: ['llama2', 'mistral', 'codellama']
  }
};

// API endpoint
app.post('/api/ai-copilot', async (req, res) => {
  try {
    const {
      prompt,
      context,
      provider = 'openai',
      model = 'gpt-4',
      temperature = 0.7,
      maxTokens = 2000,
      chatHistory = []
    } = req.body;

    // Get API key from environment variables
    // IMPORTANT: Set these in your deployment environment, never commit them
    const apiKey = process.env[`${provider.toUpperCase()}_API_KEY`] || 
                   req.headers.authorization?.replace('Bearer ', '');

    if (!apiKey && provider !== 'ollama') {
      return res.status(401).json({ error: 'API key required. Set it in environment variables.' });
    }

    // Build the request based on provider
    let response;
    
    switch (provider) {
      case 'openai':
        response = await callOpenAI(prompt, context, model, apiKey, temperature, maxTokens, chatHistory);
        break;
      
      case 'anthropic':
        response = await callAnthropic(prompt, context, model, apiKey, temperature, maxTokens, chatHistory);
        break;
      
      case 'google':
        response = await callGoogle(prompt, context, model, apiKey, temperature, maxTokens);
        break;
      
      case 'ollama':
        response = await callOllama(prompt, context, model, temperature);
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json({ response });
  } catch (error) {
    console.error('AI Copilot Error:', error.message);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// OpenAI implementation
async function callOpenAI(prompt, context, model, apiKey, temperature, maxTokens, chatHistory) {
  const messages = [
    {
      role: 'system',
      content: `You are an AI assistant helping with documentation and notes. 
                The user is working with markdown content in a web-based editor.
                Provide helpful, concise, and well-formatted responses.
                ${context ? `Current document context:\n${context}` : ''}`
    },
    ...chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })),
    { role: 'user', content: prompt }
  ];

  const response = await axios.post(
    CONFIG.openai.apiUrl,
    {
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

// Anthropic (Claude) implementation
async function callAnthropic(prompt, context, model, apiKey, temperature, maxTokens, chatHistory) {
  const messages = chatHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
  
  messages.push({ role: 'user', content: prompt });

  const response = await axios.post(
    CONFIG.anthropic.apiUrl,
    {
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
      system: `You are an AI assistant helping with documentation and notes. 
               ${context ? `Current document context:\n${context}` : ''}`
    },
    {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.content[0].text;
}

// Google (Gemini) implementation
async function callGoogle(prompt, context, model, apiKey, temperature, maxTokens) {
  const fullPrompt = context ? 
    `Context:\n${context}\n\nRequest:\n${prompt}` : 
    prompt;

  const response = await axios.post(
    `${CONFIG.google.apiUrl}${model}:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [{
          text: fullPrompt
        }]
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens
      }
    }
  );

  return response.data.candidates[0].content.parts[0].text;
}

// Ollama (Local) implementation
async function callOllama(prompt, context, model, temperature) {
  const fullPrompt = context ? 
    `Context:\n${context}\n\nRequest:\n${prompt}` : 
    prompt;

  const response = await axios.post(
    CONFIG.ollama.apiUrl,
    {
      model,
      prompt: fullPrompt,
      temperature,
      stream: false
    }
  );

  return response.data.response;
}

// Health check endpoint
app.get('/api/ai-copilot/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    providers: Object.keys(CONFIG),
    timestamp: new Date().toISOString()
  });
});

// Start server (for local development)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`AI Copilot backend running on port ${PORT}`);
  });
}

// Export for serverless functions
module.exports = app;

// ========== DEPLOYMENT INSTRUCTIONS ==========
//
// 1. Set environment variables in your deployment platform:
//    - OPENAI_API_KEY (for OpenAI)
//    - ANTHROPIC_API_KEY (for Claude)
//    - GOOGLE_API_KEY (for Gemini)
//
// 2. Deploy to your platform of choice:
//    - Vercel: Deploy as serverless function
//    - Netlify: Deploy as Netlify Function
//    - AWS: Deploy as Lambda with API Gateway
//    - Heroku: Deploy as Node.js app
//
// 3. Update the frontend to point to your API endpoint
//
// NEVER commit API keys to version control!