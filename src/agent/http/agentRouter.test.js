import {
  buildNotFoundBody,
  isSpaRoute,
  prefersJson,
  prefersMarkdown,
} from './agentRouter';

describe('agentRouter', () => {
  test('recognizes SPA routes', () => {
    expect(isSpaRoute('/')).toBe(true);
    expect(isSpaRoute('/help')).toBe(true);
    expect(isSpaRoute('/missing')).toBe(false);
  });

  test('prefers markdown when Accept prioritizes text/markdown', () => {
    expect(prefersMarkdown('text/markdown, text/html;q=0.9')).toBe(true);
    expect(prefersMarkdown('text/html, text/markdown;q=0.8')).toBe(false);
  });

  test('prefers json when Accept includes application/json', () => {
    expect(prefersJson('application/json')).toBe(true);
    expect(prefersJson('text/html')).toBe(false);
  });

  test('builds structured JSON 404 body', () => {
    const body = buildNotFoundBody('json', 'https://example.com', '/missing');
    const parsed = JSON.parse(body);
    expect(parsed.error.code).toBe('NOT_FOUND');
    expect(parsed.error.path).toBe('/missing');
    expect(parsed.error.hints).toContain('https://example.com/llms.txt');
  });

  test('builds markdown 404 body with agent links', () => {
    const body = buildNotFoundBody('markdown', 'https://example.com', '/missing');
    expect(body).toContain('# Not Found');
    expect(body).toContain('llms.txt');
  });
});
