export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export const AGENT_ROUTER_API_KEY = import.meta.env.VITE_AGENT_ROUTER_API_KEY || '';
// Route through backend proxy to bypass browser User-Agent restrictions
const AI_PROXY_URL = '/api/ai-proxy';
const DEFAULT_AGENT_ROUTER_MODEL = 'glm-5.1';
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface Message {
  role: string;
  content: string | any[];
}

export interface CallAIOptions {
  temperature?: number;
  max_tokens?: number;
  responseFormat?: any;
  agentRouterModel?: string;
  groqModel?: string;
}

async function handleStreamResponse(body: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line === 'data: [DONE]') return fullContent;
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          const text = data.choices[0]?.delta?.content || '';
          fullContent += text;
          onChunk(text);
        } catch (e) {
          // ignore parse errors for partial chunks
        }
      }
    }
  }
  return fullContent;
}

export async function callAIStream(
  messages: Message[],
  onChunk: (chunk: string) => void,
  options?: CallAIOptions
): Promise<string> {
  const temperature = options?.temperature ?? 0.7;
  const max_tokens = options?.max_tokens ?? 2048;

  // Try Agent Router via backend proxy first
  if (AGENT_ROUTER_API_KEY) {
    try {
      const model = options?.agentRouterModel || DEFAULT_AGENT_ROUTER_MODEL;
      const res = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens,
          stream: true
        })
      });

      if (res.ok && res.body) {
        console.log('[AI Client] Streaming response from Agent Router (via proxy)');
        return await handleStreamResponse(res.body, onChunk);
      } else {
        console.warn('Agent Router failed, falling back to Groq...', await res.text());
      }
    } catch (e) {
      console.warn('Agent Router threw an error, falling back to Groq...', e);
    }
  }

  // Fallback to Groq
  if (GROQ_API_KEY) {
    const model = options?.groqModel || DEFAULT_GROQ_MODEL;
    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: true
      })
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status} - ${await res.text()}`);
    }
    if (!res.body) throw new Error('No response body from Groq');

    console.log('[AI Client] Streaming response from Groq');
    return await handleStreamResponse(res.body, onChunk);
  }

  throw new Error("No API keys configured for AI providers. Please configure VITE_AGENT_ROUTER_API_KEY or VITE_GROQ_API_KEY in your .env file.");
}

export async function callAI(
  messages: Message[],
  options?: CallAIOptions
): Promise<string> {
  const temperature = options?.temperature ?? 0.5;
  const max_tokens = options?.max_tokens;

  // Try Agent Router via backend proxy first
  if (AGENT_ROUTER_API_KEY) {
    try {
      const model = options?.agentRouterModel || DEFAULT_AGENT_ROUTER_MODEL;
      const payload: any = { model, messages, temperature };
      if (max_tokens) payload.max_tokens = max_tokens;
      if (options?.responseFormat) payload.response_format = options.responseFormat;

      const res = await fetch(AI_PROXY_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[AI Client] Received response from Agent Router (via proxy)');
        return data.choices?.[0]?.message?.content || '';
      } else {
        console.warn('Agent Router failed, falling back to Groq...', await res.text());
      }
    } catch (e) {
      console.warn('Agent Router threw an error, falling back to Groq...', e);
    }
  }

  // Fallback to Groq
  if (GROQ_API_KEY) {
    const model = options?.groqModel || DEFAULT_GROQ_MODEL;
    const payload: any = { model, messages, temperature };
    if (max_tokens) payload.max_tokens = max_tokens;
    if (options?.responseFormat) payload.response_format = options.responseFormat;

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || 'Failed to generate from Groq');
    }

    const data = await res.json();
    console.log('[AI Client] Received response from Groq');
    return data.choices?.[0]?.message?.content || '';
  }

  throw new Error("No API keys configured for AI providers. Please configure VITE_AGENT_ROUTER_API_KEY or VITE_GROQ_API_KEY in your .env file.");
}
