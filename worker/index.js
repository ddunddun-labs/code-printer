import {
  MARKDOWN_PATHS,
  VARY_HEADER,
  isSpaRoute,
  notFoundResponse,
  prefersMarkdown,
  withVary,
} from '../src/agent/http/agentRouter.js';

const CAPABILITIES = {
  name: 'Code Printer',
  clientOnly: true,
  browserApi: 'window.codePrinter',
  docs: '/llms.txt',
  schema: '/agent-schema.json',
  openapi: '/openapi.json',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (pathname === '/api/agent/capabilities') {
      return new Response(JSON.stringify(CAPABILITIES, null, 2), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) {
      if (prefersMarkdown(request.headers.get('Accept') || '')) {
        const markdownAsset = MARKDOWN_PATHS[pathname];
        if (markdownAsset) {
          const markdownRequest = new Request(new URL(`/${markdownAsset}`, url.origin), request);
          const markdownResponse = await env.ASSETS.fetch(markdownRequest);
          if (markdownResponse.ok) {
            const headers = new Headers(markdownResponse.headers);
            headers.set('Content-Type', 'text/markdown; charset=utf-8');
            headers.set('Vary', VARY_HEADER);
            return new Response(markdownResponse.body, {
              status: markdownResponse.status,
              headers,
            });
          }
        }
      }
      return assetResponse;
    }

    if (isSpaRoute(pathname)) {
      const indexRequest = new Request(new URL('/', url.origin), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      if (!indexResponse.ok) {
        return notFoundResponse(request, pathname);
      }

      if (prefersMarkdown(request.headers.get('Accept') || '')) {
        const markdownAsset = MARKDOWN_PATHS[pathname];
        if (markdownAsset) {
          const markdownRequest = new Request(new URL(`/${markdownAsset}`, url.origin), request);
          const markdownResponse = await env.ASSETS.fetch(markdownRequest);
          if (markdownResponse.ok) {
            const headers = new Headers(markdownResponse.headers);
            headers.set('Content-Type', 'text/markdown; charset=utf-8');
            headers.set('Vary', VARY_HEADER);
            return new Response(markdownResponse.body, {
              status: 200,
              headers,
            });
          }
        }
      }

      return withVary(indexResponse);
    }

    return notFoundResponse(request, pathname);
  },
};
