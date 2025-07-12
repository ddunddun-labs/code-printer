// React와 관련 Hook들을 가져옵니다.
import React, { useMemo, useState, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; // useTranslation 훅 가져오기
// 코드 하이라이팅을 위한 highlight.js 라이브러리를 가져옵니다.
import hljs from 'highlight.js';
// highlight.js의 'github' 테마 스타일시트를 가져옵니다.
import 'highlight.js/styles/github.css';
// 이 컴포넌트 전용 스타일시트인 Preview.css를 가져옵니다.
import './Preview.css';

// [수정] 페이지 나누기 표시자를 App.js와 동일하게 변경합니다.
const PAGE_BREAK_MARKER = `
%%%%%%%%%% PAGE_BREAK %%%%%%%%%%
`;

/**
 * 개별 코드 블록(페이지)을 렌더링하는 하위 컴포넌트
 */
const CodeBlock = ({ html, style, pageMarginV }) => {
  const contentRef = useRef(null);
  const [pageBreaks, setPageBreaks] = useState([]);
  const [ptInPx, setPtInPx] = useState(0);

  const [prevHtml, setPrevHtml] = useState(html);
  if (html !== prevHtml) {
    setPageBreaks([]);
    setPrevHtml(html);
  }

  useLayoutEffect(() => {
    if (ptInPx === 0) {
      const measurePtDiv = document.createElement('div');
      measurePtDiv.style.height = '10pt';
      measurePtDiv.style.visibility = 'hidden';
      document.body.appendChild(measurePtDiv);
      setPtInPx(measurePtDiv.offsetHeight / 10);
      document.body.removeChild(measurePtDiv);
      return;
    }

    if (contentRef.current) {
      const currentContentHeight = contentRef.current.scrollHeight;
      const mmToPx = (ptInPx / (1/72 * 25.4)); 
      const printableHeightPx = (297 - pageMarginV - pageMarginV) * mmToPx;

      if (printableHeightPx > 0) {
        const breakCount = Math.floor(currentContentHeight / printableHeightPx);
        const newBreaks = [];
        for (let i = 1; i <= breakCount; i++) {
          newBreaks.push(i * printableHeightPx);
        }
        setPageBreaks(newBreaks);
      }
    }
  }, [html, style, pageMarginV, ptInPx]);

  return (
    <div className="code-block" ref={contentRef}>
      <code style={style} dangerouslySetInnerHTML={{ __html: html }} />
      {pageBreaks.map((top, i) => (
        <div key={i} className="auto-page-break-line" style={{ top: `${top}px` }} />
      ))}
    </div>
  );
};


// Preview 컴포넌트를 정의합니다.
const Preview = ({
  code,
  language,
  fontFamily, onFontFamilyChange,
  fontSize, onFontSizeChange,
  letterSpacing, onLetterSpacingChange,
  lineHeight, onLineHeightChange,
  pageMarginV, onPageMarginVChange
}) => {
  const { t } = useTranslation(); // useTranslation 훅 사용

  const handlePrint = () => {
    window.print();
  };

  const codeChunks = useMemo(() => {
    const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
    const chunks = code.split(PAGE_BREAK_MARKER);
    return chunks.map(chunk => hljs.highlight(chunk, { language: validLanguage, ignoreIllegals: true }).value);
  }, [code, language]);

  const codeStyle = useMemo(() => ({
    fontFamily: fontFamily,
    fontSize: `${fontSize}pt`,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: lineHeight 
  }), [fontFamily, fontSize, letterSpacing, lineHeight]);


  // --- 렌더링 ---
  return (
    <div className="preview-pane">
      <div className="preview-controls">
        <div className="control-group">
          <span className="control-label">{t('preview.font')}:</span>
          <select value={fontFamily} onChange={(e) => onFontFamilyChange(e.target.value)} className="font-family-select">
            <option value="D2Coding, Consolas, 'Courier New', monospace">D2Coding</option>
            <option value="Consolas, 'Courier New', monospace">Consolas</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="'Ubuntu Mono', monospace">Ubuntu Mono</option>
          </select>
        </div>
        <div className="control-group">
          <span className="control-label">{t('preview.fontSize')}:</span>
          <input type="number" value={fontSize} onChange={(e) => onFontSizeChange(parseFloat(e.target.value) || 0)} className="font-size-input" step="0.5" />
        </div>
        <div className="control-group">
          <span className="control-label">{t('preview.letterSpacing')}:</span>
          <input type="number" value={letterSpacing} onChange={(e) => onLetterSpacingChange(parseFloat(e.target.value) || 0)} className="letter-spacing-input" step="0.1" />
        </div>
        <div className="control-group">
          <span className="control-label">{t('preview.lineHeight')}:</span>
          <input type="number" value={lineHeight} onChange={(e) => { const v = parseFloat(e.target.value); onLineHeightChange(v < 1 ? 1 : v || 1); }} className="line-height-input" step="0.1" min="1" />
        </div>
        <div className="control-group">
          <span className="control-label">{t('preview.pageMargin')}:</span>
          <input type="number" value={pageMarginV} onChange={(e) => onPageMarginVChange(parseFloat(e.target.value) || 0)} className="margin-input" step="1" />
        </div>
        <button onClick={handlePrint} className="print-button">{t('button.print')}</button>
      </div>
      
      <div className="preview-container">
        <div 
          className="content-layer"
          style={{
            paddingTop: `${pageMarginV}mm`,
            paddingBottom: `${pageMarginV}mm`
          }}
        >
          <pre>
            {codeChunks.map((chunkHtml, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <div className="manual-page-break-indicator">
                    <span className="manual-page-break-text">{t('preview.manualPageBreak')}</span>
                  </div>
                )}
                <CodeBlock 
                  html={chunkHtml} 
                  style={codeStyle} 
                  pageMarginV={pageMarginV} 
                />
              </React.Fragment>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Preview;
