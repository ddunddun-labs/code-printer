export const FONT_FAMILY_KEYS = ['D2Coding', 'Consolas', 'CourierNew', 'UbuntuMono'];

export const FONT_FAMILIES = {
  D2Coding: "D2Coding, Consolas, 'Courier New', monospace",
  Consolas: "Consolas, 'Courier New', monospace",
  CourierNew: "'Courier New', monospace",
  UbuntuMono: "'Ubuntu Mono', monospace",
};

export const SYNTAX_LANGUAGES = [
  'javascript', 'python', 'java', 'csharp', 'cpp', 'html', 'css', 'sql', 'plaintext',
];

export const MARGIN_PRESETS = ['default', 'none', 'minimum', 'custom'];

export const VIEWS = ['app', 'help'];

export const HUB_URL = 'https://ddunddun-hub.sysscalper.workers.dev/';

export const SITE_URL = 'https://code-printer.sysscalper.workers.dev/';

export const GITHUB_REPO_URL = 'https://github.com/ddunddun-labs/code-printer';

export const PREVIEW_PANELS = ['none', 'style', 'paper'];

export const PAGE_BREAK_MARKER_TEXT = '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%';

export const PAGE_BREAK_MARKER = `
${PAGE_BREAK_MARKER_TEXT}
`;

export const MAX_HISTORY_SIZE = 50;

export const DEFAULT_CUSTOM_MARGINS = { top: 20, bottom: 20, left: 15, right: 15 };

export const INITIAL_SAMPLE_CODE = `/**
 * [파일을 여기에 드래그 & 드롭하세요! / Drag & Drop a file here!]
 * 코드 작업은 100% 브라우저 내에서 안전하게 처리됩니다. (서버 전송 없음)
 * Your code is processed entirely in your browser. Nothing is ever sent to our servers.
 * 
 * Code Printer에 오신 것을 환영합니다! / Welcome to Code Printer!
 * 소스 코드를 인쇄하거나 PDF로 저장하기 쉽도록 깔끔하게 편집해 주는 도구입니다.
 * 오른쪽 컨트롤 패널을 사용하여 스타일과 레이아웃을 자유롭게 조정해 보세요.
 * Use the controls on the right to customize the appearance of your code.
 */

import React, { useState } from 'react';

// 구문 강조(Syntax Highlighting)를 보여주기 위한 카운터 컴포넌트 예시
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
 * [팁 / TIP] 자동 페이지 분할 (Automatic Page Break)
 * A4 용지 크기 및 스타일 설정에 따라 미리보기에서 페이지가 자동으로 분할됩니다.
 * The preview shows where pages will break automatically based on paper size.
 */

${PAGE_BREAK_MARKER}

/**
 * [팁 / TIP] 수동 페이지 분할 (Manual Page Break)
 * 위 마커(PAGE_BREAK)는 수동 페이지 구분선입니다.
 * 에디터 상단 툴바 버튼을 통해 자유롭게 추가/삭제하여 페이지 레이아웃을 정밀하게 제어할 수 있습니다.
 * Add or remove page breaks using the buttons in the editor toolbar.
 */

/**
 * [팁 / TIP] 다단 레이아웃 (Multi-Column Layout)
 * 1단 및 2단 레이아웃을 지원합니다.
 * 오른쪽 '용지' 설정 패널에서 2단 레이아웃으로 변경하면 긴 코드를 효율적으로 배치할 수 있습니다.
 * You can switch between 1-column and 2-column layouts in the right panel.
 */

// Counter 컴포넌트를 사용하는 메인 앱 예시 / Main application component using Counter
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
`;

export const FILE_EXTENSION_LANG_MAP = {
  js: 'javascript',
  jsx: 'javascript',
  py: 'python',
  java: 'java',
  cs: 'csharp',
  cpp: 'cpp',
  h: 'cpp',
  html: 'html',
  htm: 'html',
  css: 'css',
  sql: 'sql',
  txt: 'plaintext',
};

export function resolveFontFamily(key) {
  return FONT_FAMILIES[key] || FONT_FAMILIES.D2Coding;
}

export function createDefaultSettingsState() {
  return {
    view: 'app',
    uiLang: 'ko',
    syntaxLang: 'javascript',
    fontFamilyKey: 'D2Coding',
    fontSize: 9.5,
    letterSpacing: 0,
    lineHeight: 1.5,
    numColumns: 1,
    marginPreset: 'default',
    customMargins: { ...DEFAULT_CUSTOM_MARGINS },
    showFindReplace: false,
    findText: '',
    replaceText: '',
    activePreviewPanel: 'none',
  };
}
