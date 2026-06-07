import worker from './_api-core/index';

interface PagesContext {
  request: Request;
  env: Record<string, string>;
  next: () => Promise<Response>;
  waitUntil: (promise: Promise<unknown>) => void;
}

export const onRequest = async (context: PagesContext) => {
  const url = new URL(context.request.url);

  // Static assets and HTML files — let Vite/Cloudflare Pages serve them directly.
  // Do NOT forward these to the worker (avoids ECONNRESET in wrangler proxy dev mode).
  if (
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.jsx') ||
    url.pathname.endsWith('.ts') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.map') ||
    url.pathname.startsWith('/@') ||           // Vite HMR and internal module paths
    url.pathname.startsWith('/node_modules') ||
    url.pathname.startsWith('/src/')
  ) {
    return context.next();
  }

  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/compress') ||
    url.pathname === '/status'
  ) {
    // Forward to the _api-core router (all server-side logic)
    return worker.fetch(context.request, context.env as any, context as any);
  }

  // Let Cloudflare Pages handle static assets and SPA fallback
  return context.next();
};
