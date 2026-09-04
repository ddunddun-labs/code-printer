import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUndo, FaRedo, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

import AppControls from './AppControls';
import Preview from './Preview';
import Help from './Help';
import AdComponent from './AdComponent';
import { useCodePrinter } from './state/CodePrinterProvider';
import { resolveFontFamily } from './state/constants';
import './App.css';

function App() {
  const { t } = useTranslation();
  const {
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
  } = useCodePrinter();

  const trackEvent = useCallback(() => {}, []);

  const onFindNext = () => {
    trackEvent('Editor', 'Click', 'Find Next');
    const foundIndex = handleFindNext();
    if (foundIndex === -1) alert(t('alert.noMatches'));
  };

  const onReplace = () => {
    trackEvent('Editor', 'Click', 'Replace');
    if (!handleReplace()) alert(t('alert.noMatches'));
  };

  const onReplaceAll = () => {
    trackEvent('Editor', 'Click', 'Replace All');
    const count = handleReplaceAll();
    if (count > 0) {
      alert(t('alert.replaceAllCount', { count }));
    } else {
      alert(t('alert.noMatches'));
    }
  };

  const renderMainApp = () => (
    <div className="container">
      <Helmet>
        <title>소스 코드 프린터 - 코드를 깔끔하게 PDF로 변환</title>
        <meta
          name="description"
          content="개발자를 위한 소스 코드 프린팅 및 PDF 변환 도구입니다. 다양한 언어의 구문 강조, 글꼴 및 여백 조절, 페이지 나누기 기능을 지원하여 최적의 인쇄 결과물을 만듭니다."
        />
      </Helmet>
      <div
        className="editor-pane"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="editor-controls">
          <div className="editor-controls-left">
            <button
              type="button"
              onClick={() => {
                updateSettings({ showFindReplace: !settings.showFindReplace });
                trackEvent('Editor', 'Toggle', 'Find and Replace');
              }}
              className="control-button"
              data-testid="toggle-find-replace"
            >
              {t('button.findReplace')} {settings.showFindReplace ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            <div className="control-group">
              <span className="control-label">{t('editor.pageBreakGroup')}</span>
              <button
                type="button"
                onClick={() => {
                  trackEvent('Editor', 'Click', 'Insert Page Break');
                  handleInsertPageBreak();
                }}
                className="control-button"
                data-testid="insert-page-break"
              >
                {t('button.insert')}
              </button>
              <button
                type="button"
                onClick={() => {
                  trackEvent('Editor', 'Click', 'Remove Page Break');
                  handleRemovePageBreak();
                }}
                className="control-button"
                data-testid="remove-page-break"
              >
                {t('button.delete')}
              </button>
            </div>
          </div>

          <div className="control-group">
            <button
              type="button"
              onClick={() => {
                trackEvent('Editor', 'Click', 'Undo');
                handleUndo();
              }}
              disabled={editorState.history.length === 0}
              className="control-button icon-button"
              data-testid="undo-button"
            >
              <FaUndo />
            </button>
            <button
              type="button"
              onClick={() => {
                trackEvent('Editor', 'Click', 'Redo');
                handleRedo();
              }}
              disabled={editorState.redoStack.length === 0}
              className="control-button icon-button"
              data-testid="redo-button"
            >
              <FaRedo />
            </button>
          </div>
        </div>

        {settings.showFindReplace && (
          <div className="find-replace-pane">
            <div className="find-replace-group">
              <label htmlFor="find-input">{t('findReplace.findLabel')}:</label>
              <textarea
                id="find-input"
                className="find-replace-textarea"
                value={settings.findText}
                onChange={(e) => updateSettings({ findText: e.target.value })}
                rows={2}
                data-testid="find-input"
              />
            </div>
            <div className="find-replace-group">
              <label htmlFor="replace-input">{t('findReplace.replaceLabel')}:</label>
              <textarea
                id="replace-input"
                className="find-replace-textarea"
                value={settings.replaceText}
                onChange={(e) => updateSettings({ replaceText: e.target.value })}
                rows={2}
                data-testid="replace-input"
              />
            </div>
            <div className="find-replace-buttons">
              <button type="button" onClick={onFindNext} data-testid="find-next-button">
                {t('button.findNext')}
              </button>
              <button type="button" onClick={onReplace} data-testid="replace-button">
                {t('button.replace')}
              </button>
              <button type="button" onClick={onReplaceAll} data-testid="replace-all-button">
                {t('button.replaceAll')}
              </button>
            </div>

            <div className="quick-clean-section">
              <span className="quick-clean-title">{t('quickClean.title')}:</span>
              <div className="quick-clean-buttons">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('Editor', 'Click', 'Quick Clean: removeEmptyLines');
                    if (handleQuickReplace('\n\n', '\n', true)) {
                      alert(t('alert.quickClean.removeEmptyLines'));
                    }
                  }}
                >
                  {t('quickClean.removeEmptyLines')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('Editor', 'Click', 'Quick Clean: liftBrackets');
                    if (handleQuickReplace('\n *}', ' }', true)) {
                      alert(t('alert.quickClean.liftBrackets'));
                    }
                  }}
                >
                  {t('quickClean.liftBrackets')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('Editor', 'Click', 'Quick Clean: Remove First Char');
                    if (handleRemoveFirstChar()) {
                      alert(t('alert.removeFirstChar'));
                    }
                  }}
                >
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
          data-testid="code-editor"
        />
      </div>

      <Preview
        code={editorState.current}
        language={settings.syntaxLang}
        onLanguageChange={(lang) => {
          updateSettings({ syntaxLang: lang });
          trackEvent('Preview', 'Change', `Language: ${lang}`);
        }}
        fontFamily={resolveFontFamily(settings.fontFamilyKey)}
        fontFamilyKey={settings.fontFamilyKey}
        onFontFamilyChange={(fontKey) => {
          updateSettings({ fontFamilyKey: fontKey });
          trackEvent('Preview', 'Change', `Font Family: ${fontKey}`);
        }}
        fontSize={settings.fontSize}
        onFontSizeChange={(size) => {
          updateSettings({ fontSize: size });
          trackEvent('Preview', 'Change', `Font Size: ${size}`);
        }}
        letterSpacing={settings.letterSpacing}
        onLetterSpacingChange={(spacing) => {
          updateSettings({ letterSpacing: spacing });
          trackEvent('Preview', 'Change', `Letter Spacing: ${spacing}`);
        }}
        lineHeight={settings.lineHeight}
        onLineHeightChange={(height) => {
          updateSettings({ lineHeight: height });
          trackEvent('Preview', 'Change', `Line Height: ${height}`);
        }}
        numColumns={settings.numColumns}
        onNumColumnsChange={(cols) => {
          updateSettings({ numColumns: cols });
          trackEvent('Preview', 'Change', `Columns: ${cols}`);
        }}
        marginOption={settings.marginPreset}
        onMarginOptionChange={(marginPreset) => {
          updateSettings({ marginPreset });
          trackEvent('Preview', 'Change', `Margin Preset: ${marginPreset}`);
        }}
        customMargins={settings.customMargins}
        onCustomMarginsChange={(customMargins) => {
          updateSettings({ customMargins });
          trackEvent('Preview', 'Change', 'Custom Margins');
        }}
        activePanel={settings.activePreviewPanel}
        onActivePanelChange={(activePreviewPanel) => {
          updateSettings({ activePreviewPanel });
          trackEvent('Preview', 'Toggle Panel', activePreviewPanel);
        }}
        trackEvent={trackEvent}
      />
    </div>
  );

  const renderContent = () => {
    switch (settings.view) {
      case 'help':
        return <Help onNavigate={navigate} />;
      default:
        return renderMainApp();
    }
  };

  return (
    <div className="app-wrapper">
      <div className={`main-content ${settings.view === 'help' ? 'is-static-page' : ''}`}>
        <AppControls onNavigate={navigate} changeLanguage={changeLanguage} />
        {renderContent()}
      </div>
      {settings.view === 'app' && <AdComponent />}
    </div>
  );
}

export default App;
