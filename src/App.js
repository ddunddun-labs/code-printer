// React 라이브러리에서 필요한 기능들을 가져옵니다.
import React, { useState, useRef, useCallback } from 'react'; // useEffect 제거
// Preview 컴포넌트를 같은 폴더의 Preview.js 파일에서 가져옵니다.
import Preview from './Preview';
// App.css 스타일시트 파일을 가져옵니다.
import './App.css';

// 되돌리기 히스토리 최대 개수
const MAX_HISTORY_SIZE = 50;

// App이라는 이름의 함수형 컴포넌트를 정의합니다.
function App() {
  // --- 상태 관리 (State) ---
  const [editorState, setEditorState] = useState({
    current: `// 페이지 분할 테스트를 위한 아주 긴 예제 코드입니다. (5페이지 이상 분량)
function function_1() {
    console.log("This is function 1.");
}

function function_2() {
    console.log("This is function 2.");
}
// 찾아 바꾸기 테스트를 위한 단어: apple
function function_3() {
    console.log("This is function 3 with apple.");
}
// 찾아 바꾸기 테스트를 위한 단어: apple
function function_4() {
    console.log("This is function 4 with apple.");
}

function function_5() {
    console.log("This is function 5.");
}
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
  // [추가] 사용자의 타이핑 상태를 추적하기 위한 ref
  const isTypingRef = useRef(false);
  const PAGE_BREAK_MARKER = '\n%%%%%%%%%% PAGE_BREAK %%%%%%%%%%\n';
  const PAGE_BREAK_MARKER_TEXT = '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%';

  // --- 히스토리 관리 ---

  /**
   * [수정] 히스토리 스택에 새로운 상태를 추가하는 핵심 함수
   * @param {string} newCode - 새로운 코드 내용
   */
  const pushStateToHistory = (newCode) => {
    setEditorState(prev => {
      const newHistory = [...prev.history, prev.current];
      if (newHistory.length > MAX_HISTORY_SIZE) {
        newHistory.shift();
      }
      return {
        current: newCode,
        history: newHistory,
        redoStack: [], // 새로운 변경 시 redo 스택은 항상 비워짐
      };
    });
  };

  // --- 이벤트 핸들러 ---

  /**
   * [수정] 사용자의 직접적인 코드 입력을 처리하는 함수 (디바운싱 로직 개선)
   */
  const handleCodeChange = (e) => {
    const newCode = e.target.value;

    // 디바운스 타이머가 있다면 초기화합니다.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 만약 새로운 타이핑 시퀀스가 시작된 것이라면,
    // 변경 전의 상태를 히스토리에 먼저 저장합니다.
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      // 현재 상태를 히스토리에 추가합니다.
      setEditorState(prev => ({
        ...prev,
        history: [...prev.history, prev.current],
        redoStack: []
      }));
    }

    // 화면에는 즉시 변경 내용을 반영합니다.
    setEditorState(prev => ({ ...prev, current: newCode }));

    // 500ms 후에 타이핑이 멈췄다고 간주하고, 플래그를 리셋합니다.
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 500);
  };
  
  /**
   * [수정] 버튼 클릭 등 즉각적인 변경을 위한 함수
   */
  const updateCodeImmediately = (newCode) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    isTypingRef.current = false;
    pushStateToHistory(newCode);
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
    const textarea = textarea.current;
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
    } else {
      const firstIndex = currentCode.indexOf(findText);
      if (firstIndex !== -1) {
        textarea.focus();
        textarea.setSelectionRange(firstIndex, firstIndex + findText.length);
      } else {
        alert("더 이상 일치하는 내용이 없습니다.");
      }
    }
  };

  const handleReplace = () => {
    if (!textareaRef.current || !findText) return;
    const textarea = textarea.current;
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
    } else {
      handleFindNext();
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    
    // 정규표현식 특수 문자를 이스케이프 처리합니다.
    const escapedFindText = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedFindText, 'g');
    const matches = editorState.current.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      const newCode = editorState.current.replaceAll(findText, replaceText);
      updateCodeImmediately(newCode);
      alert(`${count}개의 항목을 바꿨습니다.`);
    } else {
      alert("일치하는 내용이 없습니다.");
    }
  };

  const handleQuickReplace = (find, replace, message, loop = false) => {
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
      alert(`'${message}' 정리 완료!`);
    } else {
      alert("변경할 항목이 없습니다.");
    }
  };

  const handleRemoveFirstChar = () => {
    const lines = editorState.current.split('\n');
    const newLines = lines.map(line => line.length > 0 ? line.substring(1) : line);
    const newCode = newLines.join('\n');
    if (editorState.current !== newCode) {
      updateCodeImmediately(newCode);
      alert('모든 줄의 첫 문자를 제거했습니다.');
    } else {
      alert('변경할 내용이 없습니다.');
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


  // --- 렌더링 (Rendering) ---
  return (
    <div className="App">
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
            <button onClick={handleInsertPageBreak} className="control-button">페이지 나누기 삽입</button>
            <button onClick={handleRemovePageBreak} className="control-button">페이지 나누기 삭제</button>
            <button onClick={() => setShowFindReplace(!showFindReplace)} className="control-button">찾아 바꾸기</button>
            <button onClick={handleUndo} disabled={editorState.history.length === 0} className="control-button">되돌리기</button>
            <button onClick={handleRedo} disabled={editorState.redoStack.length === 0} className="control-button">다시 실행</button>
          </div>

          {showFindReplace && (
            <div className="find-replace-pane">
              <div className="find-replace-group">
                <label htmlFor="find-input">찾을 내용:</label>
                <textarea 
                  id="find-input"
                  className="find-replace-textarea"
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="find-replace-group">
                <label htmlFor="replace-input">바꿀 내용:</label>
                <textarea 
                  id="replace-input"
                  className="find-replace-textarea"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="find-replace-buttons">
                <button onClick={handleFindNext}>다음 찾기</button>
                <button onClick={handleReplace}>바꾸기</button>
                <button onClick={handleReplaceAll}>모두 바꾸기</button>
              </div>

              <div className="quick-clean-section">
                <span className="quick-clean-title">빠른 정리:</span>
                <div className="quick-clean-buttons">
                  <button onClick={() => handleQuickReplace('\n\n', '\n', '빈 줄 제거', true)}>
                    연속된 빈 줄 제거
                  </button>
                  <button onClick={() => handleQuickReplace('\n}', ' }', '닫는 괄호 올리기')}>
                    닫는 괄호 올리기
                  </button>
                  <button onClick={handleRemoveFirstChar}>
                    첫 문자 제거 (줄 번호)
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
    </div>
  );
}

export default App;