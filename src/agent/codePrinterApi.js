import {
  FONT_FAMILY_KEYS,
  MARGIN_PRESETS,
  PREVIEW_PANELS,
  SYNTAX_LANGUAGES,
  VIEWS,
  resolveFontFamily,
} from '../state/constants';

function pickDefined(source, keys) {
  const patch = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) patch[key] = source[key];
  });
  return patch;
}

function normalizePatch(rawPatch) {
  const patch = { ...rawPatch };

  if (patch.language !== undefined) {
    patch.syntaxLang = patch.language;
    delete patch.language;
  }
  if (patch.uiLanguage !== undefined) {
    patch.uiLang = patch.uiLanguage;
    delete patch.uiLanguage;
  }
  if (patch.fontFamily !== undefined) {
    patch.fontFamilyKey = patch.fontFamily;
    delete patch.fontFamily;
  }
  if (patch.style && typeof patch.style === 'object') {
    Object.assign(patch, pickDefined(patch.style, ['fontFamilyKey', 'fontSize', 'letterSpacing', 'lineHeight']));
    delete patch.style;
  }
  if (patch.paper && typeof patch.paper === 'object') {
    if (patch.paper.columns !== undefined) patch.numColumns = patch.paper.columns;
    if (patch.paper.marginPreset !== undefined) patch.marginPreset = patch.paper.marginPreset;
    if (patch.paper.customMargins !== undefined) patch.customMargins = patch.paper.customMargins;
    delete patch.paper;
  }
  if (patch.panels && typeof patch.panels === 'object') {
    if (patch.panels.findReplace !== undefined) patch.showFindReplace = patch.panels.findReplace;
    if (patch.panels.previewStyle !== undefined) {
      patch.activePreviewPanel = patch.panels.previewStyle ? 'style' : patch.activePreviewPanel;
    }
    if (patch.panels.previewPaper !== undefined) {
      patch.activePreviewPanel = patch.panels.previewPaper ? 'paper' : patch.activePreviewPanel;
    }
    delete patch.panels;
  }
  if (patch.findReplace && typeof patch.findReplace === 'object') {
    Object.assign(patch, pickDefined(patch.findReplace, ['findText', 'replaceText']));
    delete patch.findReplace;
  }

  return patch;
}

export function buildPublicState(settings, editorState) {
  return {
    view: settings.view,
    uiLang: settings.uiLang,
    code: editorState.current,
    syntaxLang: settings.syntaxLang,
    style: {
      fontFamilyKey: settings.fontFamilyKey,
      fontFamily: resolveFontFamily(settings.fontFamilyKey),
      fontSize: settings.fontSize,
      letterSpacing: settings.letterSpacing,
      lineHeight: settings.lineHeight,
    },
    paper: {
      columns: settings.numColumns,
      marginPreset: settings.marginPreset,
      customMargins: { ...settings.customMargins },
    },
    panels: {
      findReplace: settings.showFindReplace,
      previewStyle: settings.activePreviewPanel === 'style',
      previewPaper: settings.activePreviewPanel === 'paper',
    },
    findReplace: {
      find: settings.findText,
      replace: settings.replaceText,
    },
    editor: {
      canUndo: editorState.history.length > 0,
      canRedo: editorState.redoStack.length > 0,
    },
  };
}

export function validateSettingsPatch(patch) {
  const next = { ...patch };

  if (next.view !== undefined && !VIEWS.includes(next.view)) {
    throw new Error(`Invalid view: ${next.view}`);
  }
  if (next.uiLang !== undefined && next.uiLang !== 'ko' && next.uiLang !== 'en') {
    throw new Error(`Invalid uiLang: ${next.uiLang}`);
  }
  if (next.syntaxLang !== undefined && !SYNTAX_LANGUAGES.includes(next.syntaxLang)) {
    throw new Error(`Invalid syntaxLang: ${next.syntaxLang}`);
  }
  if (next.fontFamilyKey !== undefined && !FONT_FAMILY_KEYS.includes(next.fontFamilyKey)) {
    throw new Error(`Invalid fontFamilyKey: ${next.fontFamilyKey}`);
  }
  if (next.numColumns !== undefined && next.numColumns !== 1 && next.numColumns !== 2) {
    throw new Error(`Invalid numColumns: ${next.numColumns}`);
  }
  if (next.marginPreset !== undefined && !MARGIN_PRESETS.includes(next.marginPreset)) {
    throw new Error(`Invalid marginPreset: ${next.marginPreset}`);
  }
  if (next.activePreviewPanel !== undefined && !PREVIEW_PANELS.includes(next.activePreviewPanel)) {
    throw new Error(`Invalid activePreviewPanel: ${next.activePreviewPanel}`);
  }

  return next;
}

export function exposeCodePrinterApi({ getSnapshot, applyPatch, runAction, subscribe }) {
  const api = {
    version: '1',
    getState: () => getSnapshot(),
    apply: (patch) => {
      const normalized = validateSettingsPatch(normalizePatch(patch));
      applyPatch(normalized);
    },
    run: (action, args = {}) => runAction(action, args),
    subscribe: (listener) => subscribe(listener),
  };

  window.codePrinter = api;
  return () => {
    if (window.codePrinter === api) {
      delete window.codePrinter;
    }
  };
}
