import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { FONT_FAMILIES } from './state/constants';
import './Preview.css';

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const mmToPx = (mm) => {
  const dpi = 96;
  return (mm * dpi) / 25.4;
};

const Preview = ({
  code,
  language,
  onLanguageChange,
  fontFamily,
  fontFamilyKey,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
  letterSpacing,
  onLetterSpacingChange,
  lineHeight,
  onLineHeightChange,
  numColumns,
  onNumColumnsChange,
  marginOption,
  onMarginOptionChange,
  customMargins,
  onCustomMarginsChange,
  activePanel,
  onActivePanelChange,
  trackEvent,
}) => {
  const { t } = useTranslation();
  const [showPrintInstruction, setShowPrintInstruction] = useState(false);
  const [dontShowPrintInstructionAgain, setDontShowPrintInstructionAgain] = useState(false);

  const lineRef = useRef(null);
  const charMeasurerRef = useRef(null);
  const [lineHeightPx, setLineHeightPx] = useState(0);
  const [avgCharWidth, setAvgCharWidth] = useState(0);
  const debounceTimer = useRef(null);

  const handleDebouncedChange = useCallback((setter, value, trackingLabel) => {
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setter(value);
      trackEvent('Preview', 'Change (Debounced)', `${trackingLabel}: ${value}`);
    }, 300);
  }, [trackEvent]);

  const handleFontSizeInputChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    handleDebouncedChange(onFontSizeChange, value, 'Font Size');
  }, [handleDebouncedChange, onFontSizeChange]);

  const handleLetterSpacingInputChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    handleDebouncedChange(onLetterSpacingChange, value, 'Letter Spacing');
  }, [handleDebouncedChange, onLetterSpacingChange]);

  const handleLineHeightInputChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 1;
    const clampedValue = value < 1 ? 1 : value;
    handleDebouncedChange(onLineHeightChange, clampedValue, 'Line Height');
  }, [handleDebouncedChange, onLineHeightChange]);

  const margins = useMemo(() => {
    switch (marginOption) {
      case 'none':
        return { top: 0, bottom: 0, left: 0, right: 0 };
      case 'minimum':
        return { top: 5, bottom: 5, left: 5, right: 5 };
      case 'custom':
        return customMargins;
      default:
        return { top: 20, bottom: 20, left: 15, right: 15 };
    }
  }, [marginOption, customMargins]);

  const codeStyle = useMemo(() => ({
    fontFamily,
    fontSize: `${fontSize}pt`,
    letterSpacing: `${letterSpacing}px`,
    lineHeight,
    padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    boxSizing: 'border-box',
  }), [fontFamily, fontSize, letterSpacing, lineHeight, margins]);

  useEffect(() => {
    if (lineRef.current) {
      setLineHeightPx(lineRef.current.offsetHeight);
    }
    if (charMeasurerRef.current) {
      const testString = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;':,./<>?`~";
      charMeasurerRef.current.textContent = testString;
      const width = charMeasurerRef.current.offsetWidth;
      setAvgCharWidth(width / testString.length);
    }
  }, [codeStyle]);

  const pages = useMemo(() => {
    if (!lineHeightPx || !avgCharWidth) return [];

    const printableHeightMm = A4_HEIGHT_MM - margins.top - margins.bottom;
    const printableHeightPx = mmToPx(printableHeightMm);
    const visualLinesPerPage = Math.floor(printableHeightPx / lineHeightPx);

    const printableWidthMm = (A4_WIDTH_MM / numColumns) - margins.left - margins.right;
    const printableWidthPx = mmToPx(printableWidthMm);
    const charsPerLine = Math.floor(printableWidthPx / avgCharWidth);

    if (visualLinesPerPage <= 0 || charsPerLine <= 0) return [];

    const sourceCodeLines = code.split('\n');
    const highlightedCodeLines = hljs.highlight(code, { language, ignoreIllegals: true }).value.split('\n');

    const resultPages = [];
    let currentPageContent = [];
    let currentVisualLineCount = 0;

    for (let i = 0; i < sourceCodeLines.length; i += 1) {
      const sourceLine = sourceCodeLines[i];
      const highlightedLine = highlightedCodeLines[i] || '&nbsp;';

      if (sourceLine.trim() === '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%') {
        if (currentPageContent.length > 0) {
          resultPages.push(currentPageContent.join('\n'));
        }
        resultPages.push('MANUAL_PAGE_BREAK');
        currentPageContent = [];
        currentVisualLineCount = 0;
        continue;
      }

      const wrappedLineCount = Math.max(1, Math.ceil(sourceLine.length / charsPerLine));

      if (currentVisualLineCount + wrappedLineCount > visualLinesPerPage && currentPageContent.length > 0) {
        resultPages.push(currentPageContent.join('\n'));
        currentPageContent = [highlightedLine];
        currentVisualLineCount = wrappedLineCount;
      } else {
        currentPageContent.push(highlightedLine);
        currentVisualLineCount += wrappedLineCount;
      }
    }

    if (currentPageContent.length > 0) {
      resultPages.push(currentPageContent.join('\n'));
    }

    return resultPages;
  }, [code, language, margins, lineHeightPx, avgCharWidth, numColumns]);

  const renderablePages = useMemo(() => {
    const finalRenderablePages = [];
    let pageBuffer = [];

    const flushBuffer = () => {
      if (pageBuffer.length === 0) return;

      if (numColumns === 1) {
        pageBuffer.forEach((columnContent) => {
          finalRenderablePages.push({ isManualBreak: false, columns: [columnContent] });
        });
      } else {
        if (pageBuffer.length % 2 !== 0) {
          pageBuffer.push('');
        }
        for (let i = 0; i < pageBuffer.length; i += 2) {
          finalRenderablePages.push({ isManualBreak: false, columns: pageBuffer.slice(i, i + 2) });
        }
      }
      pageBuffer = [];
    };

    pages.forEach((page) => {
      if (page === 'MANUAL_PAGE_BREAK') {
        flushBuffer();
        finalRenderablePages.push({ isManualBreak: true, columns: [] });
      } else {
        pageBuffer.push(page);
      }
    });
    flushBuffer();

    return finalRenderablePages;
  }, [pages, numColumns]);

  const togglePanel = (panelName) => {
    onActivePanelChange(activePanel === panelName ? 'none' : panelName);
    trackEvent('Preview', 'Toggle Panel', panelName);
  };

  const handlePrint = useCallback(() => {
    trackEvent('Preview', 'Click', 'Print');
    const hideInstruction = sessionStorage.getItem('hidePrintInstruction');
    if (hideInstruction) {
      window.print();
    } else {
      setShowPrintInstruction(true);
    }
  }, [trackEvent]);

  const handlePrintConfirm = () => {
    if (dontShowPrintInstructionAgain) {
      sessionStorage.setItem('hidePrintInstruction', 'true');
    }
    setShowPrintInstruction(false);
    window.print();
  };

  useEffect(() => {
    const onPrintRequest = () => handlePrint();
    window.addEventListener('code-printer:print', onPrintRequest);
    return () => window.removeEventListener('code-printer:print', onPrintRequest);
  }, [handlePrint]);

  return (
    <div className="preview-pane">
      {showPrintInstruction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{t('preview.printInstruction')}</p>
            <div className="modal-actions">
              <label>
                <input
                  type="checkbox"
                  checked={dontShowPrintInstructionAgain}
                  onChange={(e) => setDontShowPrintInstructionAgain(e.target.checked)}
                />
                다시 보지 않기
              </label>
              <button type="button" onClick={handlePrintConfirm} className="modal-confirm-button">
                인쇄
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        <pre ref={lineRef} style={{ ...codeStyle, padding: 0, margin: 0 }}><span>A</span></pre>
        <span ref={charMeasurerRef} style={{ ...codeStyle, display: 'inline-block', height: 0, overflow: 'hidden' }} />
      </div>

      <div className="preview-controls">
        <div className="control-group">
          <span className="control-label">{t('preview.language')}:</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="font-family-select"
            data-testid="syntax-language-select"
          >
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
        <button
          type="button"
          onClick={() => togglePanel('style')}
          className="control-button"
          data-testid="toggle-style-panel"
        >
          {t('preview.styleGroup')}
          {activePanel === 'style' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <button
          type="button"
          onClick={() => togglePanel('paper')}
          className="control-button"
          data-testid="toggle-paper-panel"
        >
          {t('preview.paperGroup')}
          {activePanel === 'paper' ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        <button type="button" onClick={handlePrint} className="print-button" data-testid="print-button">
          {t('button.print')}
        </button>
      </div>

      {activePanel === 'style' && (
        <div className="preview-panel">
          <div className="control-group">
            <span className="control-label">{t('preview.font')}:</span>
            <select
              value={fontFamilyKey}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="font-family-select"
              data-testid="font-family-select"
            >
              {Object.keys(FONT_FAMILIES).map((key) => (
                <option key={key} value={key}>{key === 'CourierNew' ? 'Courier New' : key}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <span className="control-label">{t('preview.fontSize')}:</span>
            <input
              type="number"
              key={`font-size-${fontSize}`}
              defaultValue={fontSize}
              onChange={handleFontSizeInputChange}
              className="font-size-input"
              step="0.5"
              data-testid="font-size-input"
            />
          </div>
          <div className="control-group">
            <span className="control-label">{t('preview.letterSpacing')}:</span>
            <input
              type="number"
              key={`letter-spacing-${letterSpacing}`}
              defaultValue={letterSpacing}
              onChange={handleLetterSpacingInputChange}
              className="letter-spacing-input"
              step="0.1"
              data-testid="letter-spacing-input"
            />
          </div>
          <div className="control-group">
            <span className="control-label">{t('preview.lineHeight')}:</span>
            <input
              type="number"
              key={`line-height-${lineHeight}`}
              defaultValue={lineHeight}
              onChange={handleLineHeightInputChange}
              className="line-height-input"
              step="0.1"
              min="1"
              data-testid="line-height-input"
            />
          </div>
        </div>
      )}

      {activePanel === 'paper' && (
        <div className="preview-panel">
          <div className="control-group">
            <span className="control-label">{t('preview.columns')}:</span>
            <button
              type="button"
              onClick={() => onNumColumnsChange(1)}
              className={`column-button ${numColumns === 1 ? 'active' : ''}`}
              data-testid="columns-1"
            >
              {t('preview.oneColumn')}
            </button>
            <button
              type="button"
              onClick={() => onNumColumnsChange(2)}
              className={`column-button ${numColumns === 2 ? 'active' : ''}`}
              data-testid="columns-2"
            >
              {t('preview.twoColumns')}
            </button>
          </div>
          <div className="control-group">
            <span className="control-label">{t('preview.marginPreset')}:</span>
            <select
              value={marginOption}
              onChange={(e) => onMarginOptionChange(e.target.value)}
              className="font-family-select"
              data-testid="margin-preset-select"
            >
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
                <input
                  type="number"
                  value={customMargins.top}
                  onChange={(e) => onCustomMarginsChange({ ...customMargins, top: parseFloat(e.target.value) || 0 })}
                  className="margin-input"
                  data-testid="margin-top-input"
                />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginBottom')}:</span>
                <input
                  type="number"
                  value={customMargins.bottom}
                  onChange={(e) => onCustomMarginsChange({ ...customMargins, bottom: parseFloat(e.target.value) || 0 })}
                  className="margin-input"
                  data-testid="margin-bottom-input"
                />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginLeft')}:</span>
                <input
                  type="number"
                  value={customMargins.left}
                  onChange={(e) => onCustomMarginsChange({ ...customMargins, left: parseFloat(e.target.value) || 0 })}
                  className="margin-input"
                  data-testid="margin-left-input"
                />
              </div>
              <div className="control-group">
                <span className="control-label">{t('preview.marginRight')}:</span>
                <input
                  type="number"
                  value={customMargins.right}
                  onChange={(e) => onCustomMarginsChange({ ...customMargins, right: parseFloat(e.target.value) || 0 })}
                  className="margin-input"
                  data-testid="margin-right-input"
                />
              </div>
            </>
          )}
        </div>
      )}

      <div className="preview-container">
        {renderablePages.map((pageGroup, index) => {
          if (pageGroup.isManualBreak) {
            return (
              <div key={`break-${index}`} className="page-wrapper manual-page-break-wrapper" style={{ display: 'none' }} />
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
