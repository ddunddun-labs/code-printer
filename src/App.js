// React 라이브러리에서 필요한 기능들을 가져옵니다.
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next'; // useTranslation 훅 가져오기
import { FaUndo, FaRedo, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // 아이콘 가져오기
import { Helmet } from 'react-helmet-async';
import ReactGA from 'react-ga4';

// 컴포넌트들을 가져옵니다。
import AppControls from './AppControls'; // AppControls 컴포넌트 가져오기
import Preview from './Preview';
import PrivacyPolicy from './PrivacyPolicy';
import Help from './Help'; // Help 컴포넌트 가져오기
import AdComponent from './AdComponent';
// App.css 스타일시트 파일을 가져옵니다.
import './App.css';

// 되돌리기 히스토리 최대 개수
const MAX_HISTORY_SIZE = 50;
// Google Analytics 측정 ID
const GA_MEASUREMENT_ID = "G-1054HLTS1Q"; // <-- 여기에 실제 측정 ID를 입력하세요.

// App이라는 이름의 함수형 컴포넌트를 정의합니다.
function App() {
  const { t, i18n } = useTranslation(); // 다국어 지원 훅

  // --- GA 이벤트 추적 함수 ---
  const trackEvent = (category, action, label) => {
    if (GA_MEASUREMENT_ID !== "YOUR_MEASUREMENT_ID") {
      ReactGA.event({ category, action, label });
    }
  };

  // Google Analytics 초기화
  useEffect(() => {
    if (GA_MEASUREMENT_ID !== "YOUR_MEASUREMENT_ID") {
      ReactGA.initialize(GA_MEASUREMENT_ID);
      // 초기 페이지뷰 전송
      ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
    }
  }, []);


  // --- 상태 관리 (State) ---
  const [view, setView] = useState('app'); // 'app', 'privacy', 'help'
  const [editorState, setEditorState] = useState({
    current: `/**
 * [Drag & Drop a file here!]
 * Your code is processed entirely in your browser.
 * Nothing is ever sent to our servers.
 * 
 * Welcome to Code Printer!
 * 
 * This tool helps you create beautiful, printable documents from your source code.
 * Use the controls on the right to customize the appearance of your code.
 */

import React, { useState } from 'react';

// A simple counter component to demonstrate syntax highlighting.
function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prevCount => prevCount + 1);
  const reset = () => setCount(initialValue);

  return (
    <div class="counter-app" style={styles.counter}>
      <h3>Counter</h3>
      <p style={styles.paragraph}>Current count: {count}</p>
      <button onClick={increment} style={styles.button}>Click me!</button>
      <button onClick={reset} style={styles.button}>Reset</button>
    </div>
  );
}

/**
 * [TIP] Automatic Page Break
 * 
 * The preview shows where pages will break automatically
 * based on A4 paper size and your style settings.
 */

%%%%%%%%%% PAGE_BREAK %%%%%%%%%%

/**
 * [TIP] Manual Page Break
 * 
 * The marker above creates a manual page break.
 * You can add or remove these using the buttons in the editor toolbar
 * to control the page layout precisely.
 */

/**
 * [TIP] Multi-Column Layout
 * 
 * You can switch between 1-column and 2-column layouts.
 * Find this option in the 'Paper' settings panel on the right.
 * The 2-column layout is great for saving space with long code.
 */

// Main application component that uses the Counter.
function App() {
  return (
    <main style={styles.container}>
      <h1>My Application</h1>
      <p>This app uses multiple Counter components.</p>
      <Counter initialValue={5} />
      <Counter />
    </main>
  );
}

const styles = {
  container: { padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
  counter: { marginBottom: '15px', padding: '10px', border: '1px dashed #eee' },
  paragraph: { color: '#0056b3', fontSize: '16px' },
  button: { marginRight: '10px', padding: '8px 12px' }
};

export default App;
`,
    history: [],
    redoStack: [],
  });

  const [language, setLanguage] = useState('javascript');
  const [fontFamily, setFontFamily] = useState('D2Coding');
  const [fontSize, setFontSize] = useState(9.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [numColumns, setNumColumns] = useState(1); // 다단 상태 추가

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const isTypingRef = useRef(false);
  const PAGE_BREAK_MARKER = `
%%%%%%%%%% PAGE_BREAK %%%%%%%%%%
`;
  const PAGE_BREAK_MARKER_TEXT = '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%';

  // --- 히스토리 관리 ---
  const pushStateToHistory = (newCode) => {
    setEditorState(prev => {
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
  };

  // --- 이벤트 핸들러 ---
  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setEditorState(prev => ({
        ...prev,
        history: [...prev.history, prev.current],
        redoStack: []
      }));
    }
    setEditorState(prev => ({ ...prev, current: newCode }));
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  };
  
  const updateCodeImmediately = (newCode) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    isTypingRef.current = false;
    pushStateToHistory(newCode.trim()); // trim() 추가
  };

  const handleInsertPageBreak = () => {
    trackEvent('Editor', 'Click', 'Insert Page Break');
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
  };

  const handleRemovePageBreak = () => {
    trackEvent('Editor', 'Click', 'Remove Page Break');
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const currentCode = editorState.current;
    const lines = currentCode.split('\n');
    
    let charCount = 0;
    let cursorLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      charCount += lines[i].length + 1;
      if (cursorPosition <= charCount) {
        cursorLineIndex = i;
        break;
      }
    }
    if (cursorLineIndex === -1) cursorLineIndex = lines.length -1;

    const searchStartLine = Math.max(0, cursorLineIndex - 1);
    const searchEndLine = Math.min(lines.length - 1, cursorLineIndex + 1);
    let markerFound = false;
    let newLines = [...lines];
    let firstMarkerLineIndex = -1;
    for (let i = searchStartLine; i <= searchEndLine; i++) {
      if (newLines[i].trim() === PAGE_BREAK_MARKER_TEXT) {
        firstMarkerLineIndex = i;
        markerFound = true;
        break;
      }
    }
    if (markerFound) {
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
        for(let i=0; i < firstMarkerLineIndex; i++) {
          newCursorPosition += (newLines[i] ? newLines[i].length : 0) + 1;
        }
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }
  };

  const findAndSelectNext = (startIndex = 0, code = editorState.current) => {
    const textarea = textareaRef.current;
    if (!textarea || !findText) return -1;

    let nextIndex = code.indexOf(findText, startIndex);
    if (nextIndex === -1 && startIndex > 0) {
      nextIndex = code.indexOf(findText, 0);
    }

    if (nextIndex !== -1) {
      textarea.focus();
      textarea.setSelectionRange(nextIndex, nextIndex + findText.length);

      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseFloat(computedStyle.lineHeight);
      const lines = code.substring(0, nextIndex).split('\n');
      const lineCount = lines.length;
      const scrollTop = (lineCount - 1) * lineHeight;

      textarea.scrollTop = scrollTop - (textarea.clientHeight / 2);
    }
    return nextIndex;
  };

  const handleFindNext = () => {
    trackEvent('Editor', 'Click', 'Find Next');
    const foundIndex = findAndSelectNext(textareaRef.current?.selectionEnd || 0);
    if (foundIndex === -1) {
      alert(t('alert.noMatches'));
    }
  };

  const handleReplace = () => {
    trackEvent('Editor', 'Click', 'Replace');
    if (!textareaRef.current || !findText) return;

    const textarea = textareaRef.current;
    const { selectionStart } = textarea;
    const textToSearch = editorState.current;

    const foundIndex = textToSearch.indexOf(findText, selectionStart);

    if (foundIndex !== -1) {
      const newCode = 
        textToSearch.substring(0, foundIndex) +
        replaceText +
        textToSearch.substring(foundIndex + findText.length);
      
      updateCodeImmediately(newCode);

      setTimeout(() => {
        textarea.focus();
        const newSelectionStart = foundIndex;
        const newSelectionEnd = foundIndex + replaceText.length;
        textarea.setSelectionRange(newSelectionStart, newSelectionEnd);

        // 스크롤 조정
        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const lines = newCode.substring(0, newSelectionStart).split('\n');
        const lineCount = lines.length;
        const scrollTop = (lineCount - 1) * lineHeight;
        textarea.scrollTop = scrollTop - (textarea.clientHeight / 2);
      }, 0);
    } else {
      alert(t('alert.noMatches'));
    }
  };

  const handleReplaceAll = () => {
    trackEvent('Editor', 'Click', 'Replace All');
    if (!findText) return;
    const escapedFindText = findText.replace(/[.*+?^${}()|[\]]/g, '\\$&');
    const regex = new RegExp(escapedFindText, 'g');
    const matches = editorState.current.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      const newCode = editorState.current.replaceAll(findText, replaceText);
      updateCodeImmediately(newCode);
      alert(t('alert.replaceAllCount', { count }));
    } else {
      alert(t('alert.noMatches'));
    }
  };

  const handleQuickReplace = (find, replace, messageKey, useRegex = false) => {
    trackEvent('Editor', 'Click', `Quick Clean: ${messageKey}`);
    let newCode;
    if (useRegex) {
      const regex = new RegExp(find, 'g');
      newCode = editorState.current.replace(regex, replace);
    } else {
      newCode = editorState.current.replaceAll(find, replace);
    }

    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      alert(t(messageKey));
    }
  };

  const handleRemoveFirstChar = () => {
    trackEvent('Editor', 'Click', 'Quick Clean: Remove First Char');
    const lines = editorState.current.split('\n');
    const newLines = lines.map(line => {
      if (line.trim() === PAGE_BREAK_MARKER_TEXT) {
        return line; // 페이지 나누기 마커는 변경하지 않음
      }
      return line.length > 0 ? line.substring(1) : line;
    });
    const newCode = newLines.join('\n');
    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      alert(t('alert.removeFirstChar'));
    }
  };

  const handleUndo = useCallback(() => {
    trackEvent('Editor', 'Click', 'Undo');
    setEditorState(prevState => {
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
    trackEvent('Editor', 'Click', 'Redo');
    setEditorState(prevState => {
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
  }, [handleUndo, handleRedo]);

  const changeLanguage = (lang) => {
    trackEvent('Language', 'Change', lang);
    i18n.changeLanguage(lang);
  };

  const handleToggleFindReplace = () => {
    setShowFindReplace(!showFindReplace);
    trackEvent('Editor', 'Toggle', 'Find and Replace');
  };

  // --- Drag and Drop 핸들러 ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // 파일 확장자로 언어 추정 (간단한 버전)
      const extension = file.name.split('.').pop().toLowerCase();
      const langMap = {
        'js': 'javascript', 'jsx': 'javascript',
        'py': 'python',
        'java': 'java',
        'cs': 'csharp',
        'cpp': 'cpp', 'h': 'cpp',
        'html': 'html', 'htm': 'html',
        'css': 'css',
        'sql': 'sql',
        'txt': 'plaintext'
      };
      if (langMap[extension]) {
        setLanguage(langMap[extension]);
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result;
        updateCodeImmediately(content);
        trackEvent('Editor', 'Drop', `File: ${file.name}`);
      };
      reader.readAsText(file);
    }
  }, [updateCodeImmediately, trackEvent]);


  // --- 렌더링 (Rendering) ---
  const renderMainApp = () => (
    <div className="container">
      <Helmet>
        <title>소스 코드 프린터 - 코드를 깔끔하게 PDF로 변환</title>
        <meta name="description" content="개발자를 위한 소스 코드 프린팅 및 PDF 변환 도구입니다. 다양한 언어의 구문 강조, 글꼴 및 여백 조절, 페이지 나누기 기능을 지원하여 최적의 인쇄 결과물을 만듭니다." />
      </Helmet>
      <div 
        className="editor-pane"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="editor-controls">
          <div className="editor-controls-left">
            <button onClick={handleToggleFindReplace} className="control-button">
              {t('button.findReplace')} {showFindReplace ? <FaChevronUp /> : <FaChevronDown />} 
            </button>

            <div className="control-group">
              <span className="control-label">{t('editor.pageBreakGroup')}</span>
              <button onClick={handleInsertPageBreak} className="control-button">{t('button.insert')}</button>
              <button onClick={handleRemovePageBreak} className="control-button">{t('button.delete')}</button>
            </div>
          </div>

          <div className="control-group">
            <button onClick={handleUndo} disabled={editorState.history.length === 0} className="control-button icon-button">
              <FaUndo />
            </button>
            <button onClick={handleRedo} disabled={editorState.redoStack.length === 0} className="control-button icon-button">
              <FaRedo />
            </button>
          </div>
        </div>

        {showFindReplace && (
          <div className="find-replace-pane">
            <div className="find-replace-group">
              <label htmlFor="find-input">{t('findReplace.findLabel')}:</label>
              <textarea 
                id="find-input"
                className="find-replace-textarea"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                rows={2}
              />
            </div>
            <div className="find-replace-group">
              <label htmlFor="replace-input">{t('findReplace.replaceLabel')}:</label>
              <textarea 
                id="replace-input"
                className="find-replace-textarea"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                rows={2}
              />
            </div>
            <div className="find-replace-buttons">
              <button onClick={handleFindNext}>{t('button.findNext')}</button>
              <button onClick={handleReplace}>{t('button.replace')}</button>
              <button onClick={handleReplaceAll}>{t('button.replaceAll')}</button>
            </div>

            <div className="quick-clean-section">
              <span className="quick-clean-title">{t('quickClean.title')}:</span>
              <div className="quick-clean-buttons">
                <button onClick={() => handleQuickReplace('\n\n', '\n', 'alert.quickClean.removeEmptyLines', true)}>
                  {t('quickClean.removeEmptyLines')}
                </button>
                <button onClick={() => handleQuickReplace('\n\\s*\}', ' }', 'alert.quickClean.liftBrackets', true)}>
                  {t('quickClean.liftBrackets')}
                </button>
                <button onClick={handleRemoveFirstChar}>
                  {t('quickClean.removeFirstChar')}
                </button>
              </div>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={editorState.current}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          spellCheck="false"
          data-testid="code-editor" // 테스트를 위한 ID 추가
        />
      </div>

      <Preview 
        code={editorState.current}
        language={language} 
        onLanguageChange={(lang) => { setLanguage(lang); trackEvent('Preview', 'Change', `Language: ${lang}`); }}
        fontFamily={fontFamily}
        onFontFamilyChange={(font) => { setFontFamily(font); trackEvent('Preview', 'Change', `Font Family: ${font}`); }}
        fontSize={fontSize}
        onFontSizeChange={(size) => { setFontSize(size); trackEvent('Preview', 'Change', `Font Size: ${size}`); }}
        letterSpacing={letterSpacing}
        onLetterSpacingChange={(spacing) => { setLetterSpacing(spacing); trackEvent('Preview', 'Change', `Letter Spacing: ${spacing}`); }}
        lineHeight={lineHeight}
        onLineHeightChange={(height) => { setLineHeight(height); trackEvent('Preview', 'Change', `Line Height: ${height}`); }}
        numColumns={numColumns}
        onNumColumnsChange={(cols) => { setNumColumns(cols); trackEvent('Preview', 'Change', `Columns: ${cols}`); }}
        trackEvent={trackEvent} // 인쇄 이벤트 추적을 위해 전달
      />
    </div>
  );

  const renderContent = () => {
    switch (view) {
      case 'privacy':
        return <PrivacyPolicy onNavigate={setView} />;
      case 'help':
        return <Help onNavigate={setView} />;
      default:
        return renderMainApp();
    }
  };

  return (
    <div className="app-wrapper">
      <div className={`main-content ${view === 'help' || view === 'privacy' ? 'is-static-page' : ''}`}>
        <AppControls onNavigate={setView} changeLanguage={changeLanguage} />
        {renderContent()}
      </div>
      {view === 'app' && <AdComponent />}
    </div>
  );
}

export default App;
