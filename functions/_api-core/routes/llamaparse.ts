import { corsHeaders } from '../utils';

export async function handleLlamaParseRoutes(url: URL, request: Request, env: any): Promise<Response | null> {
  if (!url.pathname.startsWith('/api/llamaparse')) return null;

  const apiKey = env.LLAMAPARSE_API_KEY;
  if (!apiKey || apiKey === 'dummy_key_change_me') {
    return new Response(JSON.stringify({ error: "LlamaParse API key not configured on server" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  try {
    // Strip '/api/llamaparse' from the beginning and append to LlamaParse base URL
    const llamaparsePath = url.pathname.replace('/api/llamaparse', '');
    const targetUrl = `https://api.cloud.llamaindex.ai/api/parsing${llamaparsePath}`;

    // Create a new request based on the original, modifying only the headers and URL
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${apiKey}`);
    // Let fetch calculate the correct host and content-length automatically
    headers.delete('Host');

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.body,
    });

    // If API limits are exceeded during upload, notify the admin via MailChannels
    if ((response.status === 429 || response.status === 402) && targetUrl.includes('/upload')) {
      console.log(`LlamaParse API limit exceeded (${response.status}), sending admin notification...`);
      const emailRequest = new Request("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: "adnanshahria2019@gmail.com", name: "Admin" }] }],
          from: { email: "alerts@unimind.app", name: "UniMind Alerts" },
          subject: "🚨 LlamaParse API Limit Exceeded",
          content: [{ type: "text/plain", value: `The LlamaParse API returned status ${response.status}. The app has automatically fallen back to normal PDF parsing for users.` }]
        })
      });
      try {
        await fetch(emailRequest);
      } catch (emailErr) {
        console.error('Failed to send limit email:', emailErr);
      }
    }

    // Create a new response to forward back to the client, adding CORS headers
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => newHeaders.set(key, value));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}
