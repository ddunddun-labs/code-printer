import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import i18n from '../i18n';
import { buildPublicState, exposeCodePrinterApi } from '../agent/codePrinterApi';
import {
  FILE_EXTENSION_LANG_MAP,
  INITIAL_SAMPLE_CODE,
  MAX_HISTORY_SIZE,
  PAGE_BREAK_MARKER,
  PAGE_BREAK_MARKER_TEXT,
  createDefaultSettingsState,
} from './constants';
import {
  pushViewLocation,
  readLocationState,
  writeLocation,
} from './urlSync';

const CodePrinterContext = createContext(null);

export function useCodePrinter() {
  const context = useContext(CodePrinterContext);
  if (!context) {
    throw new Error('useCodePrinter must be used within CodePrinterProvider');
  }
  return context;
}

export function CodePrinterProvider({ children }) {
  const [settings, setSettings] = useState(createDefaultSettingsState);
  const [editorState, setEditorState] = useState({
    current: INITIAL_SAMPLE_CODE,
    history: [],
    redoStack: [],
  });

  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const isTypingRef = useRef(false);
  const urlSyncTimerRef = useRef(null);
  const listenersRef = useRef(new Set());
  const skipUrlSyncRef = useRef(false);
  const initializedRef = useRef(false);

  const notifyListeners = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const getSnapshot = useCallback(
    () => buildPublicState(settings, editorState),
    [settings, editorState],
  );

  const updateSettings = useCallback((patch) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const pushStateToHistory = useCallback((newCode) => {
    setEditorState((prev) => {
      const newHistory = [...prev.history, prev.current];
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }
      return {
        current: newCode,
        history: newHistory,
        redoStack: [],
      };
    });
  }, []);

  const updateCodeImmediately = useCallback((newCode) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    isTypingRef.current = false;
    pushStateToHistory(newCode.trim());
  }, [pushStateToHistory]);

  const applyPatch = useCallback((patch) => {
    const { code, ...settingsPatch } = patch;

    if (Object.keys(settingsPatch).length > 0) {
      updateSettings(settingsPatch);
      if (settingsPatch.uiLang) {
        i18n.changeLanguage(settingsPatch.uiLang);
      }
    }

    if (code !== undefined) {
      updateCodeImmediately(code);
      writeLocation(
        { ...settings, ...settingsPatch },
        { includeCodeHash: true, code },
      );
      skipUrlSyncRef.current = true;
    }
  }, [settings, updateCodeImmediately, updateSettings]);

  const navigate = useCallback((view) => {
    setSettings((prev) => {
      pushViewLocation({ ...prev, view });
      return { ...prev, view };
    });
  }, []);

  const changeLanguage = useCallback((lang) => {
    i18n.changeLanguage(lang);
    updateSettings({ uiLang: lang });
  }, [updateSettings]);

  const handleCodeChange = useCallback((e) => {
    const newCode = e.target.value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setEditorState((prev) => ({
        ...prev,
        history: [...prev.history, prev.current],
        redoStack: [],
      }));
    }
    setEditorState((prev) => ({ ...prev, current: newCode }));
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  }, []);

  const handleInsertPageBreak = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const newCode =
      editorState.current.substring(0, cursorPosition) +
      PAGE_BREAK_MARKER +
      editorState.current.substring(cursorPosition);
    updateCodeImmediately(newCode);
    setTimeout(() => {
      const newCursorPosition = cursorPosition + PAGE_BREAK_MARKER.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }, [editorState.current, updateCodeImmediately]);

  const handleRemovePageBreak = useCallback(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const currentCode = editorState.current;
    const lines = currentCode.split('\n');

    let charCount = 0;
    let cursorLineIndex = -1;
    for (let i = 0; i < lines.length; i += 1) {
      charCount += lines[i].length + 1;
      if (cursorPosition <= charCount) {
        cursorLineIndex = i;
        break;
      }
    }
    if (cursorLineIndex === -1) cursorLineIndex = lines.length - 1;

    const searchStartLine = Math.max(0, cursorLineIndex - 1);
    const searchEndLine = Math.min(lines.length - 1, cursorLineIndex + 1);
    let markerFound = false;
    const newLines = [...lines];
    let firstMarkerLineIndex = -1;
    for (let i = searchStartLine; i <= searchEndLine; i += 1) {
      if (newLines[i].trim() === PAGE_BREAK_MARKER_TEXT) {
        firstMarkerLineIndex = i;
        markerFound = true;
        break;
      }
    }
    if (!markerFound) return;

    newLines.splice(firstMarkerLineIndex, 1);
    if (newLines[firstMarkerLineIndex] && newLines[firstMarkerLineIndex].trim() === '') {
      newLines.splice(firstMarkerLineIndex, 1);
    }
    if (newLines[firstMarkerLineIndex - 1] && newLines[firstMarkerLineIndex - 1].trim() === '') {
      newLines.splice(firstMarkerLineIndex - 1, 1);
    }
    const newCode = newLines.join('\n');
    updateCodeImmediately(newCode);
    setTimeout(() => {
      let newCursorPosition = 0;
      for (let i = 0; i < firstMarkerLineIndex; i += 1) {
        newCursorPosition += (newLines[i] ? newLines[i].length : 0) + 1;
      }
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  }, [editorState.current, updateCodeImmediately]);

  const findAndSelectNext = useCallback((startIndex = 0, code = editorState.current) => {
    const textarea = textareaRef.current;
    if (!textarea || !settings.findText) return -1;

    let nextIndex = code.indexOf(settings.findText, startIndex);
    if (nextIndex === -1 && startIndex > 0) {
      nextIndex = code.indexOf(settings.findText, 0);
    }

    if (nextIndex !== -1) {
      textarea.focus();
      textarea.setSelectionRange(nextIndex, nextIndex + settings.findText.length);

      const computedStyle = window.getComputedStyle(textarea);
      const lineHeightValue = parseFloat(computedStyle.lineHeight);
      const lineCount = code.substring(0, nextIndex).split('\n').length;
      const scrollTop = (lineCount - 1) * lineHeightValue;
      textarea.scrollTop = scrollTop - (textarea.clientHeight / 2);
    }
    return nextIndex;
  }, [editorState.current, settings.findText]);

  const handleFindNext = useCallback(() => {
    const foundIndex = findAndSelectNext(textareaRef.current?.selectionEnd || 0);
    return foundIndex;
  }, [findAndSelectNext]);

  const handleReplace = useCallback(() => {
    if (!textareaRef.current || !settings.findText) return false;

    const textarea = textareaRef.current;
    const { selectionStart } = textarea;
    const textToSearch = editorState.current;
    let foundIndex = textToSearch.indexOf(settings.findText, selectionStart);
    if (foundIndex === -1 && selectionStart > 0) {
      foundIndex = textToSearch.indexOf(settings.findText, 0);
    }

    if (foundIndex === -1) return false;

    const newCode =
      textToSearch.substring(0, foundIndex) +
      settings.replaceText +
      textToSearch.substring(foundIndex + settings.findText.length);

    updateCodeImmediately(newCode);

    setTimeout(() => {
      textarea.focus();
      const newSelectionStart = foundIndex;
      const newSelectionEnd = foundIndex + settings.replaceText.length;
      textarea.setSelectionRange(newSelectionStart, newSelectionEnd);

      const computedStyle = window.getComputedStyle(textarea);
      const lineHeightValue = parseFloat(computedStyle.lineHeight);
      const lineCount = newCode.substring(0, newSelectionStart).split('\n').length;
      const scrollTop = (lineCount - 1) * lineHeightValue;
      textarea.scrollTop = scrollTop - (textarea.clientHeight / 2);
    }, 0);

    return true;
  }, [editorState.current, settings.findText, settings.replaceText, updateCodeImmediately]);

  const handleReplaceAll = useCallback(() => {
    if (!settings.findText) return 0;

    const regex = new RegExp(settings.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = editorState.current.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      const newCode = editorState.current.replaceAll(settings.findText, settings.replaceText);
      updateCodeImmediately(newCode);
    }
    return count;
  }, [editorState.current, settings.findText, settings.replaceText, updateCodeImmediately]);

  const handleQuickReplace = useCallback((find, replace, useRegex = false) => {
    let newCode;
    if (useRegex) {
      const regex = new RegExp(find, 'g');
      newCode = editorState.current.replace(regex, replace);
    } else {
      newCode = editorState.current.replaceAll(find, replace);
    }

    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      return true;
    }
    return false;
  }, [editorState.current, updateCodeImmediately]);

  const handleRemoveFirstChar = useCallback(() => {
    const lines = editorState.current.split('\n');
    const newLines = lines.map((line) => {
      if (line.trim() === PAGE_BREAK_MARKER_TEXT) return line;
      return line.length > 0 ? line.substring(1) : line;
    });
    const newCode = newLines.join('\n');
    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      return true;
    }
    return false;
  }, [editorState.current, updateCodeImmediately]);

  const handleUndo = useCallback(() => {
    setEditorState((prevState) => {
      if (prevState.history.length === 0) return prevState;
      const previousState = prevState.history[prevState.history.length - 1];
      const newHistory = prevState.history.slice(0, prevState.history.length - 1);
      return {
        current: previousState,
        history: newHistory,
        redoStack: [prevState.current, ...prevState.redoStack],
      };
    });
  }, []);

  const handleRedo = useCallback(() => {
    setEditorState((prevState) => {
      if (prevState.redoStack.length === 0) return prevState;
      const nextState = prevState.redoStack[0];
      const newRedoStack = prevState.redoStack.slice(1);
      return {
        current: nextState,
        history: [...prevState.history, prevState.current],
        redoStack: newRedoStack,
      };
    });
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey) {
      if (e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) {
        e.preventDefault();
        handleRedo();
      }
    }
  }, [handleRedo, handleUndo]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop().toLowerCase();
    if (FILE_EXTENSION_LANG_MAP[extension]) {
      updateSettings({ syntaxLang: FILE_EXTENSION_LANG_MAP[extension] });
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      updateCodeImmediately(readerEvent.target.result);
    };
    reader.readAsText(file);
  }, [updateCodeImmediately, updateSettings]);

  const runAction = useCallback(async (action, args = {}) => {
    switch (action) {
      case 'undo':
        handleUndo();
        return { ok: true };
      case 'redo':
        handleRedo();
        return { ok: true };
      case 'insertPageBreak':
        if (args.at !== undefined && textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(args.at, args.at);
        }
        handleInsertPageBreak();
        return { ok: true };
      case 'removePageBreak':
        if (args.at !== undefined && textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(args.at, args.at);
        }
        handleRemovePageBreak();
        return { ok: true };
      case 'findNext': {
        const index = handleFindNext();
        return { ok: index !== -1, index };
      }
      case 'replace': {
        const replaced = handleReplace();
        return { ok: replaced };
      }
      case 'replaceAll': {
        const count = handleReplaceAll();
        return { ok: count > 0, count };
      }
      case 'quickClean': {
        const { type } = args;
        if (type === 'removeEmptyLines') {
          return { ok: handleQuickReplace('\n\n', '\n', true) };
        }
        if (type === 'liftBrackets') {
          return { ok: handleQuickReplace('\n *}', ' }', true) };
        }
        if (type === 'removeFirstChar') {
          return { ok: handleRemoveFirstChar() };
        }
        throw new Error(`Unknown quickClean type: ${type}`);
      }
      case 'loadFile': {
        const { name, content } = args;
        if (typeof content !== 'string') {
          throw new Error('loadFile requires string content');
        }
        if (name) {
          const extension = name.split('.').pop().toLowerCase();
          if (FILE_EXTENSION_LANG_MAP[extension]) {
            updateSettings({ syntaxLang: FILE_EXTENSION_LANG_MAP[extension] });
          }
        }
        updateCodeImmediately(content);
        return { ok: true };
      }
      case 'print': {
        if (args.skipModal) {
          window.print();
        } else {
          window.dispatchEvent(new CustomEvent('code-printer:print'));
        }
        return { ok: true };
      }
      case 'navigate': {
        if (!args.view) throw new Error('navigate requires view');
        navigate(args.view);
        return { ok: true };
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  }, [
    handleFindNext,
    handleInsertPageBreak,
    handleQuickReplace,
    handleRedo,
    handleRemoveFirstChar,
    handleRemovePageBreak,
    handleReplace,
    handleReplaceAll,
    handleUndo,
    navigate,
    updateCodeImmediately,
    updateSettings,
  ]);

  useEffect(() => {
    const { view, settingsPatch, codeFromHash } = readLocationState();
    skipUrlSyncRef.current = true;
    setSettings((prev) => ({ ...prev, view, ...settingsPatch }));
    if (settingsPatch.uiLang) {
      i18n.changeLanguage(settingsPatch.uiLang);
    }
    if (codeFromHash !== null) {
      setEditorState({ current: codeFromHash, history: [], redoStack: [] });
    }
    initializedRef.current = true;
  }, []);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (skipUrlSyncRef.current) {
      skipUrlSyncRef.current = false;
      notifyListeners();
      return;
    }

    clearTimeout(urlSyncTimerRef.current);
    urlSyncTimerRef.current = setTimeout(() => {
      writeLocation(settings);
      notifyListeners();
    }, 300);

    return () => clearTimeout(urlSyncTimerRef.current);
  }, [settings, notifyListeners]);

  useEffect(() => {
    notifyListeners();
  }, [editorState, notifyListeners]);

  useEffect(() => {
    const onPopState = () => {
      const { view, settingsPatch, codeFromHash } = readLocationState();
      skipUrlSyncRef.current = true;
      setSettings((prev) => ({ ...prev, view, ...settingsPatch }));
      if (settingsPatch.uiLang) {
        i18n.changeLanguage(settingsPatch.uiLang);
      }
      if (codeFromHash !== null) {
        setEditorState({ current: codeFromHash, history: [], redoStack: [] });
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const subscribe = (listener) => {
      listenersRef.current.add(listener);
      return () => listenersRef.current.delete(listener);
    };

    return exposeCodePrinterApi({
      getSnapshot,
      applyPatch,
      runAction,
      subscribe,
    });
  }, [applyPatch, getSnapshot, runAction]);

  const value = useMemo(() => ({
    settings,
    editorState,
    textareaRef,
    updateSettings,
    navigate,
    changeLanguage,
    handleCodeChange,
    handleInsertPageBreak,
    handleRemovePageBreak,
    handleFindNext,
    handleReplace,
    handleReplaceAll,
    handleQuickReplace,
    handleRemoveFirstChar,
    handleUndo,
    handleRedo,
    handleKeyDown,
    handleDragOver,
    handleDrop,
    getSnapshot,
    applyPatch,
    runAction,
  }), [
    settings,
    editorState,
    updateSettings,
    navigate,
    changeLanguage,
    handleCodeChange,
    handleInsertPageBreak,
    handleRemovePageBreak,
    handleFindNext,
    handleReplace,
    handleReplaceAll,
    handleQuickReplace,
    handleRemoveFirstChar,
    handleUndo,
    handleRedo,
    handleKeyDown,
    handleDragOver,
    handleDrop,
    getSnapshot,
    applyPatch,
    runAction,
  ]);

  return (
    <CodePrinterContext.Provider value={value}>
      {children}
    </CodePrinterContext.Provider>
  );
}
