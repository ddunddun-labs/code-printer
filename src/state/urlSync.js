import {
  FONT_FAMILY_KEYS,
  MARGIN_PRESETS,
  PREVIEW_PANELS,
  SYNTAX_LANGUAGES,
  createDefaultSettingsState,
} from './constants';

export function viewFromPathname(pathname) {
  if (pathname === '/help' || pathname.startsWith('/help/')) return 'help';
  return 'app';
}

export function pathnameFromView(view) {
  switch (view) {
    case 'help':
      return '/help';
    default:
      return '/';
  }
}

function parseNumber(value, fallback) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseIntStrict(value, fallback) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseSearchParams(search) {
  const params = new URLSearchParams(search);
  const defaults = createDefaultSettingsState();
  const patch = {};

  const ui = params.get('ui');
  if (ui === 'ko' || ui === 'en') patch.uiLang = ui;

  const lang = params.get('lang');
  if (lang && SYNTAX_LANGUAGES.includes(lang)) patch.syntaxLang = lang;

  const font = params.get('font');
  if (font && FONT_FAMILY_KEYS.includes(font)) patch.fontFamilyKey = font;

  if (params.has('size')) patch.fontSize = parseNumber(params.get('size'), defaults.fontSize);
  if (params.has('spacing')) patch.letterSpacing = parseNumber(params.get('spacing'), defaults.letterSpacing);
  if (params.has('lineHeight')) patch.lineHeight = parseNumber(params.get('lineHeight'), defaults.lineHeight);

  const cols = params.get('cols');
  if (cols === '1' || cols === '2') patch.numColumns = parseIntStrict(cols, defaults.numColumns);

  const margin = params.get('margin');
  if (margin && MARGIN_PRESETS.includes(margin)) patch.marginPreset = margin;

  const customMargins = { ...defaults.customMargins };
  let hasCustomMargins = false;
  ['mt', 'mb', 'ml', 'mr'].forEach((key, index) => {
    const field = ['top', 'bottom', 'left', 'right'][index];
    if (params.has(key)) {
      customMargins[field] = parseNumber(params.get(key), customMargins[field]);
      hasCustomMargins = true;
    }
  });
  if (hasCustomMargins) {
    patch.customMargins = customMargins;
    patch.marginPreset = 'custom';
  }

  if (params.get('find') === '1') patch.showFindReplace = true;

  const panel = params.get('panel');
  if (panel && PREVIEW_PANELS.includes(panel)) patch.activePreviewPanel = panel;

  return patch;
}

export function buildSearchParams(settings) {
  const params = new URLSearchParams();
  const defaults = createDefaultSettingsState();

  if (settings.uiLang !== defaults.uiLang) params.set('ui', settings.uiLang);
  if (settings.syntaxLang !== defaults.syntaxLang) params.set('lang', settings.syntaxLang);
  if (settings.fontFamilyKey !== defaults.fontFamilyKey) params.set('font', settings.fontFamilyKey);
  if (settings.fontSize !== defaults.fontSize) params.set('size', String(settings.fontSize));
  if (settings.letterSpacing !== defaults.letterSpacing) params.set('spacing', String(settings.letterSpacing));
  if (settings.lineHeight !== defaults.lineHeight) params.set('lineHeight', String(settings.lineHeight));
  if (settings.numColumns !== defaults.numColumns) params.set('cols', String(settings.numColumns));
  if (settings.marginPreset !== defaults.marginPreset) params.set('margin', settings.marginPreset);

  if (settings.marginPreset === 'custom') {
    params.set('mt', String(settings.customMargins.top));
    params.set('mb', String(settings.customMargins.bottom));
    params.set('ml', String(settings.customMargins.left));
    params.set('mr', String(settings.customMargins.right));
  }

  if (settings.showFindReplace) params.set('find', '1');
  if (settings.activePreviewPanel !== defaults.activePreviewPanel) {
    params.set('panel', settings.activePreviewPanel);
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function encodeCodeToHash(code) {
  const bytes = new TextEncoder().encode(code);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const base64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `code=${base64}`;
}

export function decodeCodeFromHash(hash) {
  const normalized = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!normalized.startsWith('code=')) return null;

  try {
    const base64 = normalized
      .slice(5)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function readLocationState() {
  const view = viewFromPathname(window.location.pathname);
  const settingsPatch = parseSearchParams(window.location.search);
  const codeFromHash = decodeCodeFromHash(window.location.hash);

  return {
    view,
    settingsPatch,
    codeFromHash,
  };
}

export function writeLocation(settings, { includeCodeHash = false, code = '' } = {}) {
  const pathname = pathnameFromView(settings.view);
  const search = buildSearchParams(settings);
  let hash = '';
  if (includeCodeHash && code) {
    hash = `#${encodeCodeToHash(code)}`;
  }
  const url = `${pathname}${search}${hash}`;
  window.history.replaceState(null, '', url);
}

export function pushViewLocation(settings) {
  const pathname = pathnameFromView(settings.view);
  const search = buildSearchParams(settings);
  const url = `${pathname}${search}${window.location.hash}`;
  window.history.pushState(null, '', url);
}
