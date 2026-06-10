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
  provider?: 'groq' | 'agent-router';
}

export interface StreamResult {
  fullContent: string;
  finishReason: string | null;
}

async function handleStreamResponse(body: ReadableStream<Uint8Array>, onChunk: (chunk: string) => void): Promise<StreamResult> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullContent = '';
  let buffer = '';
  let finishReason: string | null = null;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    
    // The last element is either an empty string (if buffer ended in \n) 
    // or an incomplete line. We keep it in the buffer for the next chunk.
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      if (trimmedLine === 'data: [DONE]') return { fullContent, finishReason };
      if (trimmedLine.startsWith('data: ')) {
        try {
          const data = JSON.parse(trimmedLine.slice(6));
          const text = data.choices[0]?.delta?.content || '';
          
          if (data.choices[0]?.finish_reason) {
            finishReason = data.choices[0].finish_reason;
          }
          
          fullContent += text;
          onChunk(text);
        } catch (e) {
          console.warn('Failed to parse SSE data chunk:', e);
        }
      }
    }
  }
  return { fullContent, finishReason };
}

function getToken() {
  return localStorage.getItem('unimind_token') || '';
}

export async function callAIStream(
  messages: Message[],
  onChunk: (chunk: string) => void,
  options?: CallAIOptions
): Promise<string> {
  const temperature = options?.temperature ?? 0.7;
  const max_tokens = options?.max_tokens ?? 2048;
  const provider = options?.provider ?? 'groq';
  const maxContinuations = 3; // Prevent infinite loops
  let continuations = 0;
  
  const currentMessages = [...messages];
  let accumulatedContent = '';

  while (continuations <= maxContinuations) {
    let result: StreamResult | null = null;

    try {
      const model = provider === 'agent-router' 
          ? (options?.agentRouterModel || DEFAULT_AGENT_ROUTER_MODEL)
          : (options?.groqModel || DEFAULT_GROQ_MODEL);

      const res = await fetch(`${AI_PROXY_URL}?provider=${provider === 'agent-router' ? 'agentrouter' : 'groq'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          model,
          messages: currentMessages,
          temperature,
          max_tokens,
          stream: true
        })
      });

      if (res.ok && res.body) {
        if (continuations === 0) console.log(`[AI Client] Streaming response from proxy (${provider})`);
        result = await handleStreamResponse(res.body, onChunk);
      } else {
        if (continuations === 0) throw new Error(`${provider} API error: ${res.status} - ${await res.text()}`);
        else break; // If continuation fails, just stop
      }
    } catch (e) {
      if (continuations === 0) throw e;
      break;
    }

    if (!result) {
      if (continuations === 0) throw new Error(`Provider ${provider} failed to return a result.`);
      break;
    }

    accumulatedContent += result.fullContent;

    // Check if the AI was cut off due to max_tokens limit
    if (result.finishReason === 'length') {
      continuations++;
      if (continuations > maxContinuations) {
        console.warn('[AI Client] Reached max continuations, stopping stream.');
        break;
      }
      
      console.log(`[AI Client] Hit token limit, auto-continuing (attempt ${continuations}/${maxContinuations})...`);
      
      // Append the AI's partial response and ask it to continue
      currentMessages.push({ role: 'assistant', content: result.fullContent });
      currentMessages.push({ 
        role: 'user', 
        content: 'Your previous response was cut off due to a length limit. Please continue exactly from where you left off. Do NOT start a new sentence, do NOT say "Here is the continuation", just output the very next word as if you were never interrupted.' 
      });
    } else {
      // Finished normally (stop, stop_sequence, etc.)
      break;
    }
  }

  return accumulatedContent;
}

export async function callAI(
  messages: Message[],
  options?: CallAIOptions
): Promise<string> {
  const temperature = options?.temperature ?? 0.5;
  const max_tokens = options?.max_tokens;
  const provider = options?.provider ?? 'groq';

  try {
    const model = provider === 'agent-router' 
        ? (options?.agentRouterModel || DEFAULT_AGENT_ROUTER_MODEL)
        : (options?.groqModel || DEFAULT_GROQ_MODEL);

    const payload: any = { model, messages, temperature };
    if (max_tokens) payload.max_tokens = max_tokens;
    if (options?.responseFormat) payload.response_format = options.responseFormat;

    const res = await fetch(`${AI_PROXY_URL}?provider=${provider === 'agent-router' ? 'agentrouter' : 'groq'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`[AI Client] Received response from proxy (${provider})`);
      return data.choices?.[0]?.message?.content || '';
    } else {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || errorData?.error || `Failed to generate from ${provider}`);
    }
  } catch (e) {
    throw e;
  }
}
