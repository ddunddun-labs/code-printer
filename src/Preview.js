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
  numColumns, onNumColumnsChange, // 다단 관련 props 추가
  trackEvent
}) => {
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState('none');
  const [marginOption, setMarginOption] = useState('default');
  const [customMargins, setCustomMargins] = useState({ top: 20, bottom: 20, left: 15, right: 15 });
  
  const lineRef = useRef(null);
  const charMeasurerRef = useRef(null);
  const [lineHeightPx, setLineHeightPx] = useState(0);
  const [avgCharWidth, setAvgCharWidth] = useState(0);

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

  // 한 줄의 실제 높이(px)와 평균 문자 너비(px)를 측정합니다.
  useEffect(() => {
    if (lineRef.current) {
      setLineHeightPx(lineRef.current.offsetHeight);
    }
    if (charMeasurerRef.current) {
      // 다양한 문자를 포함하여 평균 너비를 더 정확하게 계산
      const testString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?`~";
      charMeasurerRef.current.textContent = testString;
      const width = charMeasurerRef.current.offsetWidth;
      setAvgCharWidth(width / testString.length);
    }
  }, [codeStyle]); // 스타일이 바뀔 때마다 재측정

  const pages = useMemo(() => {
    // 측정값이 없으면 계산 중단
    if (!lineHeightPx || !avgCharWidth) return [];

    // 1. 계산에 필요한 변수 설정
    const printableHeightMm = A4_HEIGHT_MM - margins.top - margins.bottom;
    const printableHeightPx = mmToPx(printableHeightMm);
    const visualLinesPerPage = Math.floor(printableHeightPx / lineHeightPx);

    // 다단 수에 따라 실제 인쇄 가능한 너비 계산
    const printableWidthMm = (A4_WIDTH_MM / numColumns) - margins.left - margins.right;
    const printableWidthPx = mmToPx(printableWidthMm);
    // 한 줄에 들어갈 수 있는 평균 글자 수
    const charsPerLine = Math.floor(printableWidthPx / avgCharWidth);

    if (visualLinesPerPage <= 0 || charsPerLine <= 0) return [];

    // 2. 코드 하이라이팅 및 줄 단위 분리
    const sourceCodeLines = code.split('\n');
    const highlightedCodeLines = hljs.highlight(code, { language, ignoreIllegals: true }).value.split('\n');

    // 3. 페이지 분할 로직
    const resultPages = [];
    let currentPageContent = [];
    let currentVisualLineCount = 0;

    for (let i = 0; i < sourceCodeLines.length; i++) {
      const sourceLine = sourceCodeLines[i];
      const highlightedLine = highlightedCodeLines[i] || '&nbsp;'; // 빈 줄은 공백으로 처리

      // 수동 페이지 나누기 처리
      if (sourceLine.trim() === '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%') {
        if (currentPageContent.length > 0) {
          resultPages.push(currentPageContent.join('\n'));
        }
        resultPages.push('MANUAL_PAGE_BREAK');
        currentPageContent = [];
        currentVisualLineCount = 0;
        continue;
      }

      // 현재 줄이 차지할 시각적 줄 수 계산 (자동 줄 바꿈 고려)
      const wrappedLineCount = Math.max(1, Math.ceil(sourceLine.length / charsPerLine));

      // 현재 페이지에 추가될 경우, 허용된 줄 수를 넘는지 확인
      if (currentVisualLineCount + wrappedLineCount > visualLinesPerPage && currentPageContent.length > 0) {
        resultPages.push(currentPageContent.join('\n'));
        currentPageContent = [highlightedLine];
        currentVisualLineCount = wrappedLineCount;
      } else {
        currentPageContent.push(highlightedLine);
        currentVisualLineCount += wrappedLineCount;
      }
    }

    // 마지막 페이지에 남은 내용 추가
    if (currentPageContent.length > 0) {
      resultPages.push(currentPageContent.join('\n'));
    }
    
    return resultPages;

  }, [code, language, margins, lineHeightPx, avgCharWidth, numColumns, codeStyle]);


  // 렌더링을 위해 페이지들을 다단에 맞게 그룹화합니다.
  const renderablePages = useMemo(() => {
    const finalRenderablePages = [];
    let pageBuffer = [];

    const flushBuffer = () => {
      if (pageBuffer.length === 0) return;
      
      if (numColumns === 1) {
        pageBuffer.forEach(columnContent => {
          finalRenderablePages.push({ isManualBreak: false, columns: [columnContent] });
        });
      } else { // 2단일 경우
        // 현재 버퍼에 홀수 개의 단이 있다면, 짝을 맞추기 위해 빈 단을 추가
        if (pageBuffer.length % 2 !== 0) {
          pageBuffer.push('');
        }
        for (let i = 0; i < pageBuffer.length; i += 2) {
          finalRenderablePages.push({ isManualBreak: false, columns: pageBuffer.slice(i, i + 2) });
        }
      }
      pageBuffer = [];
    };

    pages.forEach(page => {
      if (page === 'MANUAL_PAGE_BREAK') {
        flushBuffer();
        finalRenderablePages.push({ isManualBreak: true, columns: [] });
      } else {
        pageBuffer.push(page);
      }
    });
    flushBuffer(); // 마지막 남은 버퍼 처리

    return finalRenderablePages;

  }, [pages, numColumns]);


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
      {/* 측정용 숨겨진 요소들 */}
      <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <pre ref={lineRef} style={{...codeStyle, padding: 0, margin: 0}}><span>A</span></pre>
        <span ref={charMeasurerRef} style={{...codeStyle, display: 'inline-block', height: 0, overflow: 'hidden'}}></span>
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
            <span className="control-label">{t('preview.columns')}:</span>
            <button onClick={() => onNumColumnsChange(1)} className={`column-button ${numColumns === 1 ? 'active' : ''}`}>{t('preview.oneColumn')}</button>
            <button onClick={() => onNumColumnsChange(2)} className={`column-button ${numColumns === 2 ? 'active' : ''}`}>{t('preview.twoColumns')}</button>
          </div>
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
        {renderablePages.map((pageGroup, index) => {
          if (pageGroup.isManualBreak) {
            // 수동 페이지 나눔은 시각적으로 구분만 해주고, 실제 인쇄 시에는 page-break-after에 의해 나뉨
            return (
              <div key={`break-${index}`} className="page-wrapper manual-page-break-wrapper" style={{ display: 'none' }}></div>
            );
          }
          return (
            <div key={index} className={`page-wrapper ${numColumns === 2 ? 'two-columns' : ''}`}>
              {pageGroup.columns.map((pageHtml, subIndex) => (
                <div key={subIndex} className="content-layer">
                  <pre style={codeStyle}>
                    <code dangerouslySetInnerHTML={{ __html: pageHtml }} />
                  </pre>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Preview;
