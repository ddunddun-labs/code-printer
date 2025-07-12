// React 라이브러리에서 필요한 기능들을 가져옵니다.
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // useTranslation 훅 가져오기
import { FaUndo, FaRedo } from 'react-icons/fa'; // 아이콘 가져오기

// 컴포넌트들을 가져옵니다.
import AppControls from './AppControls'; // AppControls 컴포넌트 가져오기
import Preview from './Preview';
import PrivacyPolicy from './PrivacyPolicy';
import Help from './Help'; // Help 컴포넌트 가져오기
import AdComponent from './AdComponent';
// App.css 스타일시트 파일을 가져옵니다.
import './App.css';

// 되돌리기 히스토리 최대 개수
const MAX_HISTORY_SIZE = 50;

// App이라는 이름의 함수형 컴포넌트를 정의합니다.
function App() {
  const { t, i18n } = useTranslation(); // 다국어 지원 훅

  // --- 상태 관리 (State) ---
  const [view, setView] = useState('app'); // 'app', 'privacy', 'help'
  const [editorState, setEditorState] = useState({
    current: `/**
 * Welcome to Code Printer!
 * 
 * This tool helps you create beautiful, printable documents from your source code.
 * Use the controls on the right to customize the appearance of your code.
 * 
 * Let's see how it works with a simple React application.
 */

import React, { useState } from 'react';

// A simple counter component to demonstrate syntax highlighting.
function Counter({ initialValue = 0 }) {
  const [count, setCount] = useState(initialValue);

  // You can increment the count.
  const increment = () => {
    setCount(prevCount => prevCount + 1);
  };

  // Or reset it to its initial value.
  const reset = () => {
    setCount(initialValue);
  };

  return (
    <div className="counter-app" style={styles.counter}>
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
 * If the code gets long enough, you will see a red dotted line.
 * This line indicates where an automatic page break will occur
 * on a standard A4 sheet.
 * 
 * You can adjust font size, line height, and margins to control this.
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

// You can even include CSS-in-JS for styling.
const styles = {
  container: {
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  counter: {
    marginBottom: '15px',
    padding: '10px',
    border: '1px dashed #eee',
  },
  paragraph: {
    color: '#0056b3', // A nice blue color
    fontSize: '16px',
  },
  button: {
    marginRight: '10px',
    padding: '8px 12px',
  }
};

%%%%%%%%%% PAGE_BREAK %%%%%%%%%%

/**
 * [TIP] Manual Page Break
 * 
 * The line above is a special marker.
 * It creates a manual page break in the printout,
 * represented by a blue line in the preview.
 * 
 * You can add or remove page breaks using the buttons in the editor toolbar.
 * This is useful for organizing long code into multiple pages.
 */

// More features to explore:
// 1. Find & Replace: Use the panel to refactor code quickly.
// 2. Quick Clean: Tidy up your code with one-click actions.
// 3. Undo/Redo: Don't worry about mistakes (Ctrl+Z / Ctrl+Y).

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
  const [pageMarginV, setPageMarginV] = useState(20);

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  const isTypingRef = useRef(false);
  const PAGE_BREAK_MARKER = `\n%%%%%%%%%% PAGE_BREAK %%%%%%%%%%\n`;
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

  const handleFindNext = () => {
    if (!textareaRef.current || !findText) return;
    const textarea = textareaRef.current;
    const currentCode = textarea.value;
    const startIndex = textarea.selectionEnd;
    const nextIndex = currentCode.indexOf(findText, startIndex);
    if (nextIndex !== -1) {
      textarea.focus();
      textarea.setSelectionRange(nextIndex, nextIndex + findText.length);
    }
  };

  const handleReplace = () => {
    if (!textareaRef.current || !findText) return;
    const textarea = textareaRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = textarea.value.substring(selectionStart, selectionEnd);
    if (selectedText === findText) {
      const newCode = 
        editorState.current.substring(0, selectionStart) +
        replaceText +
        editorState.current.substring(selectionEnd);
      updateCodeImmediately(newCode);
      setTimeout(() => {
        const nextIndex = newCode.indexOf(findText, selectionStart + replaceText.length);
        if (nextIndex !== -1) {
          textarea.focus();
          textarea.setSelectionRange(nextIndex, nextIndex + findText.length);
        }
      }, 0);
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const escapedFindText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const handleQuickReplace = (find, replace, messageKey, loop = false) => {
    let newCode = editorState.current;
    if (loop) {
      while (newCode.includes(find)) {
        newCode = newCode.replaceAll(find, replace);
      }
    } else {
      newCode = newCode.replaceAll(find, replace);
    }
    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      alert(t(messageKey));
    }
  };

  const handleRemoveFirstChar = () => {
    const lines = editorState.current.split('\n');
    const newLines = lines.map(line => line.length > 0 ? line.substring(1) : line);
    const newCode = newLines.join('\n');
    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      alert(t('alert.removeFirstChar'));
    }
  };

  const handleUndo = useCallback(() => {
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
    i18n.changeLanguage(lang);
  };

  // --- 렌더링 (Rendering) ---
  const renderMainApp = () => (
    <div className="container">
      <div className="editor-pane">
        <div className="editor-controls">
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="plaintext">Plain Text</option>
          </select>
          <button onClick={handleInsertPageBreak} className="control-button">{t('button.addPageBreak')}</button>
          <button onClick={handleRemovePageBreak} className="control-button">{t('button.removePageBreak')}</button>
          <button onClick={() => setShowFindReplace(!showFindReplace)} className="control-button">{t('button.findReplace')}</button>
          <button onClick={handleUndo} disabled={editorState.history.length === 0} className="control-button icon-button">
            <FaUndo />
          </button>
          <button onClick={handleRedo} disabled={editorState.redoStack.length === 0} className="control-button icon-button">
            <FaRedo />
          </button>
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
                <button onClick={() => handleQuickReplace('\n}', ' }', 'alert.quickClean.liftBrackets')}>
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
        />
      </div>

      <Preview 
        code={editorState.current}
        language={language} 
        fontFamily={fontFamily}
        onFontFamilyChange={setFontFamily}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        letterSpacing={letterSpacing}
        onLetterSpacingChange={setLetterSpacing}
        lineHeight={lineHeight}
        onLineHeightChange={setLineHeight}
        pageMarginV={pageMarginV}
        onPageMarginVChange={setPageMarginV}
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
    <div className="App">
      <AppControls onNavigate={setView} changeLanguage={changeLanguage} /> {/* AppControls 컴포넌트 사용 */}
      {renderContent()}
      {view === 'app' && <AdComponent className="ad-component" />}
    </div>
  );
}

export default App;
