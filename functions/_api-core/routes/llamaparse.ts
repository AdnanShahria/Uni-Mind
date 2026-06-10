import { corsHeaders, verifyToken } from '../utils';

const LLAMAPARSE_BASE = 'https://api.cloud.llamaindex.ai/api/v1/parsing';

/**
 * Proxy route for basic LlamaParse API forwarding (status checks, etc.)
 */
export async function handleLlamaParseRoutes(url: URL, request: Request, env: any): Promise<Response | null> {
  if (!url.pathname.startsWith('/api/llamaparse')) return null;

  const apiKey = env.LLAMAPARSE_API_KEY;
  console.log(`[LlamaParse] API key present: ${!!apiKey}, key starts with: ${apiKey ? apiKey.substring(0, 6) : 'N/A'}`);
  console.log(`[LlamaParse] Available env keys:`, Object.keys(env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET')).join(', '));

  if (!apiKey || apiKey === 'dummy_key_change_me') {
    return new Response(JSON.stringify({ error: "LlamaParse API key not configured on server", debug: { hasKey: !!apiKey, envKeys: Object.keys(env) } }), {
      status: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  // Enforce auth
  const payload = await verifyToken(request, env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod');
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
  }

  // ── LlamaParse Extraction Endpoints ──────────
  if (url.pathname === '/api/llamaparse/extract-start' && request.method === 'POST') {
    return handleExtractStart(request, apiKey, env);
  }

  if (url.pathname === '/api/llamaparse/extract-status' && request.method === 'GET') {
    return handleExtractStatus(url, request, apiKey, env);
  }

  // ── Generic proxy for other LlamaParse endpoints ──────────────────────────
  try {
    const llamaparsePath = url.pathname.replace('/api/llamaparse', '');
    const targetUrl = `${LLAMAPARSE_BASE}${llamaparsePath}`;

    const proxyHeaders = new Headers();
    proxyHeaders.set('Authorization', `Bearer ${apiKey}`);
    proxyHeaders.set('accept', 'application/json');

    const init: RequestInit = {
      method: request.method,
      headers: proxyHeaders,
    };

    // For POST/PUT, forward the body and let fetch handle content-type
    if (request.method === 'POST' || request.method === 'PUT') {
      init.body = request.body;
      // Copy content-type only for non-upload requests
      const ct = request.headers.get('Content-Type');
      if (ct) proxyHeaders.set('Content-Type', ct);
    }

    const response = await fetch(targetUrl, init);

    // If API limits are exceeded during upload, notify the admin
    if ((response.status === 429 || response.status === 402) && targetUrl.includes('/upload')) {
      await notifyAdminLimitExceeded(response.status);
    }

    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => newHeaders.set(key, value));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (err: any) {
    console.error('LlamaParse proxy error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// ── Start extraction: upload to LlamaParse ─
async function handleExtractStart(request: Request, apiKey: string, env: any): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const uploadForm = new FormData();
    uploadForm.append('file', file);

    console.log(`[LlamaParse] Uploading ${file.name} (${(file.size / 1024).toFixed(1)} KB)...`);

    const uploadRes = await fetch(`${LLAMAPARSE_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'accept': 'application/json' },
      body: uploadForm
    });

    if (!uploadRes.ok) {
      const errBody = await uploadRes.text();
      console.error(`[LlamaParse] Upload failed (${uploadRes.status}):`, errBody);

      if (uploadRes.status === 429 || uploadRes.status === 402) {
        await notifyAdminLimitExceeded(uploadRes.status);
      }

      return new Response(JSON.stringify({
        error: 'LlamaParse upload failed',
        status: uploadRes.status,
        detail: errBody
      }), {
        status: uploadRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const uploadData = await uploadRes.json();
    const jobId = uploadData.id;
    console.log(`[LlamaParse] Job created: ${jobId}`);

    return new Response(JSON.stringify({
      success: true,
      jobId,
      status: 'PENDING'
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error('[LlamaParse] Extraction start error:', err);
    return new Response(JSON.stringify({ error: err.message, fallback: true }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// ── Check extraction status: poll → fetch markdown + images → upload to imgbb ─
async function handleExtractStatus(url: URL, request: Request, apiKey: string, env: any): Promise<Response> {
  const jobId = url.searchParams.get('jobId');
  if (!jobId) {
    return new Response(JSON.stringify({ error: 'No jobId provided' }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const imgbbKey = env.VITE_IMGBB_API_KEY;

  try {
    const statusRes = await fetch(`${LLAMAPARSE_BASE}/job/${jobId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'accept': 'application/json' }
    });

    if (!statusRes.ok) {
      return new Response(JSON.stringify({ error: `Status check failed: ${statusRes.status}`, fallback: true }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const statusData = await statusRes.json();
    const status = statusData.status;
    console.log(`[LlamaParse] Poll status for ${jobId}: ${status}`);

    if (status === 'PENDING') {
      return new Response(JSON.stringify({ success: true, status: 'PENDING' }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (status !== 'SUCCESS') {
      return new Response(JSON.stringify({
        success: false,
        status,
        error: `LlamaParse job failed or cancelled. Final status: ${status}`,
        fallback: true
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // --- Job is SUCCESS, fetch the Markdown result ---
    const mdRes = await fetch(`${LLAMAPARSE_BASE}/job/${jobId}/result/markdown`, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'accept': 'application/json' }
    });

    if (!mdRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to fetch markdown result', fallback: true }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const mdData = await mdRes.json();
    let markdown: string = mdData.markdown || '';

    // --- Fetch images from the job ---
    const imageUrls: string[] = [];

    try {
      const imagesRes = await fetch(`${LLAMAPARSE_BASE}/job/${jobId}/result/images`, {
        headers: { 'Authorization': `Bearer ${apiKey}`, 'accept': 'application/json' }
      });

      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        const images = imagesData.images || imagesData || [];

        if (Array.isArray(images) && images.length > 0 && imgbbKey) {
          console.log(`[LlamaParse] Found ${images.length} images. Uploading to imgbb...`);

          for (const img of images) {
            try {
              const imgName = img.name || `pdf_image_${Date.now()}`;
              const base64Data = img.data || img.image;
              if (!base64Data) continue;

              const imgForm = new FormData();
              imgForm.append('image', base64Data);
              imgForm.append('name', imgName);

              const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
                method: 'POST',
                body: imgForm,
              });

              const imgbbData = await imgbbRes.json();
              if (imgbbData.success) {
                const publicUrl = imgbbData.data.display_url || imgbbData.data.url;
                imageUrls.push(publicUrl);

                const escapedName = imgName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const imgRegex = new RegExp(`!\\[([^\\]]*)\\]\\((?:[^)]*${escapedName}[^)]*)\\)`, 'g');
                markdown = markdown.replace(imgRegex, `![$1](${publicUrl})`);
              }
            } catch (imgErr) {
              console.error('[LlamaParse] Image upload error:', imgErr);
            }
          }
        }
      }
    } catch (imgFetchErr) {
      console.error('[LlamaParse] Image fetch error (non-fatal):', imgFetchErr);
    }

    // --- Return the final result ---
    return new Response(JSON.stringify({
      success: true,
      status: 'SUCCESS',
      markdown,
      imageUrls,
      jobId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error('[LlamaParse] Extraction status error:', err);
    return new Response(JSON.stringify({ error: err.message, fallback: true }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
}

// ── Admin notification via MailChannels ──────────────────────────────────────
async function notifyAdminLimitExceeded(statusCode: number) {
  console.log(`[LlamaParse] API limit exceeded (${statusCode}), sending admin notification...`);
  try {
    await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "adnanshahria2019@gmail.com", name: "Admin" }] }],
        from: { email: "alerts@unimind.app", name: "UniMind Alerts" },
        subject: "🚨 LlamaParse API Limit Exceeded",
        content: [{
          type: "text/plain",
          value: `The LlamaParse API returned status ${statusCode} at ${new Date().toISOString()}. The app has automatically fallen back to normal PDF parsing for users.`
        }]
      })
    });
  } catch (emailErr) {
    console.error('[LlamaParse] Failed to send limit email:', emailErr);
  }
}
