# Implementing Agent Router in Your Projects

Agent Router is an AI routing service that provides a unified interface for calling various Large Language Models (LLMs) with fallback mechanisms and a consistent API. It is especially useful for managing API keys securely, avoiding browser-based CORS and User-Agent restrictions, and creating resilient AI pipelines.

This guide outlines how to implement Agent Router in a new or existing project.

## 1. Environment Setup

First, you need an API key for Agent Router. Store this securely in your project's environment file (e.g., `.env` or `.dev.vars`).

```env
VITE_AGENT_ROUTER_API_KEY=your_agent_router_api_key_here
```

*Note: If you are building a frontend application (like Vite/React), prefixing with `VITE_` exposes it to the browser. If you are building a backend proxy to protect the key, keep it purely as `AGENT_ROUTER_API_KEY` on the server.*

## 2. Backend Proxy (Recommended)

When making requests from a browser to Agent Router, you may encounter `User-Agent` blocks, CORS issues, or security concerns (exposing your API key). 

It is best practice to create a backend proxy endpoint. 

### Example: Node.js / Express Proxy

```javascript
// server.js
const express = require('express');
const fetch = require('node-fetch'); // or use native fetch in Node 18+

const app = express();
app.use(express.json());

app.post('/api/ai-proxy', async (req, res) => {
  const { model, messages, temperature, max_tokens, stream } = req.body;
  const AGENT_ROUTER_KEY = process.env.AGENT_ROUTER_API_KEY;

  try {
    const response = await fetch('https://api.agent-router.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AGENT_ROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: model || 'glm-5.1', // Example default model
        messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 2048,
        stream: stream || false
      })
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    if (stream) {
      // Pipe the stream back to the client
      res.setHeader('Content-Type', 'text/event-stream');
      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 3. Frontend Client Configuration

Create a dedicated client utility in your frontend code (`aiClient.ts` or `aiClient.js`) that handles the logic of calling your backend proxy and parsing the results (including Server-Sent Events / streaming).

### A. Standard Call (Non-Streaming)

```typescript
export async function callAgentRouter(messages: any[], options?: any) {
  const payload = {
    model: options?.model || 'glm-5.1',
    messages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens,
    stream: false
  };

  const res = await fetch('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Failed to fetch from Agent Router proxy');
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}
```

### B. Streaming Call

Streaming is crucial for long outputs or chat interfaces.

```typescript
export async function callAgentRouterStream(messages: any[], onChunk: (chunk: string) => void) {
  const res = await fetch('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'glm-5.1',
      messages,
      stream: true
    })
  });

  if (!res.ok || !res.body) throw new Error('Stream failed');

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\\n');
    
    // Keep incomplete line in buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      if (trimmedLine === 'data: [DONE]') return;
      if (trimmedLine.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmedLine.slice(6));
          const text = data.choices[0]?.delta?.content || '';
          onChunk(text);
        } catch (e) {
          console.warn('Failed to parse chunk:', e);
        }
      }
    }
  }
}
```

## 4. Usage in Components

Now you can use these functions in your React / Vue / Vanilla JS components easily:

```tsx
import { callAgentRouterStream } from './aiClient';
import { useState } from 'react';

function Chat() {
  const [response, setResponse] = useState('');

  const handleSend = async (userInput: string) => {
    const messages = [{ role: 'user', content: userInput }];
    setResponse(''); // Reset

    await callAgentRouterStream(messages, (chunk) => {
      setResponse((prev) => prev + chunk);
    });
  };

  // ...
}
```

## Best Practices

1. **Fallback Mechanisms**: Always implement a fallback. If Agent Router fails (e.g., due to rate limits), have your `aiClient.ts` automatically attempt the request directly through Groq, OpenAI, or Anthropic.
2. **Token Limits**: If you are using a proxy to handle long document analysis, handle token limits by auto-continuing the response if `finish_reason === 'length'`.
3. **Model Selection**: Allow your `callAgentRouter` function to accept dynamic model selection based on the task (e.g., `gpt-4o` for vision tasks, `llama-3.3-70b` for reasoning).
