// React와 관련 Hook들을 가져옵니다.
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './Preview.css';

// A4 크기 (mm)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// mm를 px로 변환하는 헬퍼 함수
const mmToPx = (mm) => {
  const dpi = 96; // 일반적인 화면 DPI
  return (mm * dpi) / 25.4;
};

const Preview = ({
  code,
  language, onLanguageChange,
  fontFamily, onFontFamilyChange,
  fontSize, onFontSizeChange,
  letterSpacing, onLetterSpacingChange,
  lineHeight, onLineHeightChange,
  trackEvent
}) => {
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState('none');
  const [marginOption, setMarginOption] = useState('default');
  const [customMargins, setCustomMargins] = useState({ top: 20, bottom: 20, left: 15, right: 15 });
  
  const lineRef = useRef(null);
  const [lineHeightPx, setLineHeightPx] = useState(0);

  const margins = useMemo(() => {
    switch (marginOption) {
      case 'none': return { top: 0, bottom: 0, left: 0, right: 0 };
      case 'minimum': return { top: 5, bottom: 5, left: 5, right: 5 };
      case 'custom': return customMargins;
      default: return { top: 20, bottom: 20, left: 15, right: 15 };
    }
  }, [marginOption, customMargins]);

  const codeStyle = useMemo(() => ({
    fontFamily: fontFamily,
    fontSize: `${fontSize}pt`,
    letterSpacing: `${letterSpacing}px`,
    lineHeight: lineHeight,
    padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    boxSizing: 'border-box',
  }), [fontFamily, fontSize, letterSpacing, lineHeight, margins]);

  // 한 줄의 실제 높이(px)를 측정합니다.
  useEffect(() => {
    if (lineRef.current) {
      setLineHeightPx(lineRef.current.offsetHeight);
    }
  }, [codeStyle]); // 스타일이 바뀔 때마다 재측정

  const pages = useMemo(() => {
    if (!lineHeightPx) return [];

    const printableHeightMm = A4_HEIGHT_MM - margins.top - margins.bottom;
    const printableHeightPx = mmToPx(printableHeightMm);
    const linesPerPage = Math.floor(printableHeightPx / lineHeightPx);

    if (linesPerPage <= 0) return [];

    const highlightedCode = hljs.highlight(code, { language: language, ignoreIllegals: true }).value;
    const lines = highlightedCode.split('\n');
    
    const resultPages = [];
    let currentPageLines = [];

    const manualPageBreaks = /\n(%%%%%%%%%% PAGE_BREAK %%%%%%%%%%)\n/g;
    const codeWithMarkers = code.replace(manualPageBreaks, '\n$1\n');
    const sourceLines = codeWithMarkers.split('\n');

    let lineCounter = 0;
    for (let i = 0; i < sourceLines.length; i++) {
      const sourceLine = sourceLines[i];
      
      if (sourceLine.includes('%%%%%%%%%% PAGE_BREAK %%%%%%%%%%')) {
        if (currentPageLines.length > 0) {
          resultPages.push(currentPageLines.join('\n'));
          currentPageLines = [];
        }
        lineCounter = 0;
        continue;
      }

      currentPageLines.push(lines[i] || ' '); // highlighted line
      lineCounter++;

      if (lineCounter >= linesPerPage && i < sourceLines.length - 1) {
        resultPages.push(currentPageLines.join('\n'));
        currentPageLines = [];
        lineCounter = 0;
      }
    }

    if (currentPageLines.length > 0) {
      resultPages.push(currentPageLines.join('\n'));
    }
    
    return resultPages;

  }, [code, language, margins, lineHeightPx, fontSize, fontFamily, letterSpacing, lineHeight]);


  const togglePanel = (panelName) => {
    setActivePanel(current => (current === panelName ? 'none' : panelName));
    trackEvent('Preview', 'Toggle Panel', panelName);
  };

  const handlePrint = () => {
    trackEvent('Preview', 'Click', 'Print');
    alert(t('preview.printInstruction'));
    window.print();
  };

  return (
    <div className="preview-pane">
      {/* 한 줄 높이 측정을 위한 숨겨진 요소 */}
      <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
        <pre ref={lineRef} style={{...codeStyle, padding: 0, margin: 0}}><span>A</span></pre>
      </div>

      <div className="preview-controls">
        <div className="control-group">
          <span className="control-label">{t('preview.language')}:</span>
          <select value={language} onChange={(e) => onLanguageChange(e.target.value)} className="font-family-select">
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
        </div>
        <button onClick={() => togglePanel('style')} className="control-button">
          {t('preview.styleGroup')}
          {activePanel === 'style' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <button onClick={() => togglePanel('paper')} className="control-button">
          {t('preview.paperGroup')}
          {activePanel === 'paper' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <button onClick={handlePrint} className="print-button">{t('button.print')}</button>
      </div>
      
      {activePanel === 'style' && (
        <div className="preview-panel">
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
        </div>
      )}

      {activePanel === 'paper' && (
        <div className="preview-panel">
          <div className="control-group">
            <span className="control-label">{t('preview.marginPreset')}:</span>
            <select value={marginOption} onChange={(e) => setMarginOption(e.target.value)} className="font-family-select">
              <option value="default">{t('preview.marginDefault')}</option>
              <option value="none">{t('preview.marginNone')}</option>
              <option value="minimum">{t('preview.marginMinimum')}</option>
              <option value="custom">{t('preview.marginCustom')}</option>
            </select>
          </div>
          {marginOption === 'custom' && (
            <>
              <div className="control-group">
                <span className="control-label">{t('preview.marginTop')}:</span>
                <input type="number" value={customMargins.top} onChange={(e) => setCustomMargins(m => ({...m, top: parseFloat(e.target.value) || 0}))} className="margin-input" />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginBottom')}:</span>
                <input type="number" value={customMargins.bottom} onChange={(e) => setCustomMargins(m => ({...m, bottom: parseFloat(e.target.value) || 0}))} className="margin-input" />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginLeft')}:</span>
                <input type="number" value={customMargins.left} onChange={(e) => setCustomMargins(m => ({...m, left: parseFloat(e.target.value) || 0}))} className="margin-input" />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginRight')}:</span>
                <input type="number" value={customMargins.right} onChange={(e) => setCustomMargins(m => ({...m, right: parseFloat(e.target.value) || 0}))} className="margin-input" />
              </div>
            </>
          )}
        </div>
      )}

      <div className="preview-container">
        {pages.map((pageHtml, index) => (
          <div key={index} className="page-wrapper">
            <div className="content-layer">
              <pre style={codeStyle}>
                <code dangerouslySetInnerHTML={{ __html: pageHtml }} />
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Preview;