import { corsHeaders } from "../utils";

/**
 * Compression routes — TypeScript port of the Python compression_service.
 * Uses Web-standard CompressionStream/DecompressionStream APIs available in Workers.
 */

export async function handleCompressRoutes(
  url: URL,
  request: Request,
  db: any,
  env?: any
): Promise<Response | null> {
  if (!url.pathname.startsWith("/compress")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // POST /compress/text — compress raw text, return base64-encoded zlib output
  if (url.pathname === "/compress/text" && request.method === "POST") {
    try {
      const contentType = request.headers.get("Content-Type") || "";
      let text: string;

      if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await request.formData();
        text = formData.get("text") as string;
      } else {
        const body = await request.json();
        text = body.text;
      }

      if (!text) {
        return new Response(
          JSON.stringify({ error: "Missing 'text' field" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const textBytes = new TextEncoder().encode(text);
      const compressed = await compressBytes(textBytes);
      const b64Encoded = arrayBufferToBase64(compressed);

      return new Response(
        JSON.stringify({
          compressed: b64Encoded,
          originalSize: textBytes.byteLength,
          compressedSize: compressed.byteLength,
          ratio: (compressed.byteLength / textBytes.byteLength * 100).toFixed(1) + "%",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: `Text compression failed: ${e.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // POST /compress/document — compress binary document, return compressed binary
  if (url.pathname === "/compress/document" && request.method === "POST") {
    try {
      const body = await request.arrayBuffer();

      if (!body || body.byteLength === 0) {
        return new Response(
          JSON.stringify({ error: "Empty file body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const compressed = await compressBytes(new Uint8Array(body));

      return new Response(compressed, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/octet-stream",
          "X-Original-Size": String(body.byteLength),
          "X-Compressed-Size": String(compressed.byteLength),
        },
      });
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: `Document compression failed: ${e.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  // POST /compress/decompress — decompress base64-encoded zlib data back to text
  if (url.pathname === "/compress/decompress" && request.method === "POST") {
    try {
      const { compressed } = await request.json();

      if (!compressed) {
        return new Response(
          JSON.stringify({ error: "Missing 'compressed' field" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const compressedBytes = base64ToArrayBuffer(compressed);
      const decompressed = await decompressBytes(compressedBytes);
      const text = new TextDecoder().decode(decompressed);

      return new Response(
        JSON.stringify({ text }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (e: any) {
      return new Response(
        JSON.stringify({ error: `Decompression failed: ${e.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Unknown compress endpoint" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function compressBytes(input: Uint8Array): Promise<ArrayBuffer> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  writer.write(new Uint8Array(input.buffer, input.byteOffset, input.byteLength) as Uint8Array<ArrayBuffer>);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

async function decompressBytes(input: Uint8Array): Promise<ArrayBuffer> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  writer.write(new Uint8Array(input.buffer, input.byteOffset, input.byteLength) as Uint8Array<ArrayBuffer>);
  writer.close();

  const chunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result.buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
