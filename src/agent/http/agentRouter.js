export const SPA_ROUTES = new Set(['/', '/help']);

export const MARKDOWN_PATHS = {
  '/': 'llms.txt',
  '/help': 'help.md',
};

export const VARY_HEADER = 'Accept, Accept-Encoding';

export function isSpaRoute(pathname) {
  return SPA_ROUTES.has(pathname);
}

export function prefersMarkdown(acceptHeader = '') {
  if (!acceptHeader) return false;
  const values = acceptHeader.split(',').map((part) => part.trim().split(';')[0].toLowerCase());
  const htmlIndex = values.indexOf('text/html');
  const markdownIndex = values.findIndex((value) => value === 'text/markdown' || value === 'text/x-markdown');
  if (markdownIndex === -1) return false;
  if (htmlIndex === -1) return true;
  return markdownIndex < htmlIndex;
}

export function prefersJson(acceptHeader = '') {
  if (!acceptHeader) return false;
  return acceptHeader.toLowerCase().includes('application/json');
}

export function buildNotFoundBody(format, origin, pathname) {
  const sitemap = `${origin}/sitemap.xml`;
  const llms = `${origin}/llms.txt`;
  const openapi = `${origin}/openapi.json`;

  if (format === 'json') {
    return JSON.stringify({
      error: {
        code: 'NOT_FOUND',
        message: 'Path not found',
        path: pathname,
        hints: [llms, sitemap, openapi],
        resolution: 'Use /llms.txt for agent integration or /openapi.json for HTTP surface documentation.',
      },
    }, null, 2);
  }

  if (format === 'markdown') {
    return `# Not Found

The path \`${pathname}\` does not exist on Code Printer.

## Agent resources

- [llms.txt](${llms})
- [sitemap.xml](${sitemap})
- [openapi.json](${openapi})
`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>404 Not Found - Code Printer</title>
</head>
<body>
  <main>
    <h1>404 Not Found</h1>
    <p>The path <code>${pathname}</code> does not exist.</p>
    <ul>
      <li><a href="${llms}">llms.txt</a></li>
      <li><a href="${sitemap}">sitemap.xml</a></li>
      <li><a href="${openapi}">openapi.json</a></li>
    </ul>
  </main>
</body>
</html>`;
}

export function notFoundResponse(request, pathname) {
  const accept = request.headers.get('Accept') || '';
  const origin = new URL(request.url).origin;

  if (prefersJson(accept)) {
    return new Response(buildNotFoundBody('json', origin, pathname), {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Vary: VARY_HEADER,
      },
    });
  }

  if (prefersMarkdown(accept)) {
    return new Response(buildNotFoundBody('markdown', origin, pathname), {
      status: 404,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        Vary: VARY_HEADER,
      },
    });
  }

  return new Response(buildNotFoundBody('html', origin, pathname), {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      Vary: VARY_HEADER,
    },
  });
}

export function withVary(response) {
  const headers = new Headers(response.headers);
  headers.set('Vary', VARY_HEADER);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
