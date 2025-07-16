import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicy.css'; // 스타일 재사용

function Help({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="privacy-policy-container">
      <Helmet>
        <title>{`${t('help.title')} - ${t('header.siteTitle')}`}</title>
        <meta name="description" content={t('help.metaDescription')} />
      </Helmet>
      <button onClick={() => onNavigate('app')} className="back-button">
        &larr; {t('help.backToApp')}
      </button>
      <h1>{t('help.title')}</h1>

      <h2>{t('help.gettingStarted.title')}</h2>
      <p>{t('help.gettingStarted.intro')}</p>
      <h3>{t('help.gettingStarted.screenLayout.title')}</h3>
      <ul>
        <li><strong>{t('help.gettingStarted.screenLayout.editor')}</strong> {t('help.gettingStarted.screenLayout.editorDesc')}</li>
        <li><strong>{t('help.gettingStarted.screenLayout.preview')}</strong> {t('help.gettingStarted.screenLayout.previewDesc')}</li>
        <li><strong>{t('help.gettingStarted.screenLayout.controls')}</strong> {t('help.gettingStarted.screenLayout.controlsDesc')}</li>
      </ul>
      <h3>{t('help.gettingStarted.basicUsage.title')}</h3>
      <ol>
        <li>{t('help.gettingStarted.basicUsage.step1')}</li>
        <li>{t('help.gettingStarted.basicUsage.step2')}</li>
        <li>{t('help.gettingStarted.basicUsage.step3')}</li>
      </ol>

      <h2>{t('help.features.title')}</h2>
      <h3>{t('help.features.editor.title')}</h3>
      <ul>
        <li><strong>{t('help.features.editor.highlighting')}</strong> {t('help.features.editor.highlightingDesc')}</li>
        <li><strong>{t('help.features.editor.findReplace')}</strong> {t('help.features.editor.findReplaceDesc')}</li>
        <li><strong>{t('help.features.editor.quickClean')}</strong> {t('help.features.editor.quickCleanDesc')}</li>
        <li><strong>{t('help.features.editor.undoRedo')}</strong> {t('help.features.editor.undoRedoDesc')}</li>
      </ul>
      
      <h3>{t('help.features.preview.title')}</h3>
      <ul>
        <li><strong>{t('help.features.preview.style.title')}</strong>
          <ul>
            <li>{t('help.features.preview.style.font')}</li>
            <li>{t('help.features.preview.style.size')}</li>
          </ul>
        </li>
        <li><strong>{t('help.features.preview.paper.title')}</strong>
          <ul>
            <li>{t('help.features.preview.paper.columns')}</li>
            <li>{t('help.features.preview.paper.margins')}</li>
          </ul>
        </li>
      </ul>

      <h3>{t('help.features.pageBreak.title')}</h3>
      <ul>
        <li><strong>{t('help.features.pageBreak.auto')}</strong> {t('help.features.pageBreak.autoDesc')}</li>
        <li><strong>{t('help.features.pageBreak.manual')}</strong> {t('help.features.pageBreak.manualDesc')}</li>
      </ul>

      <h2>{t('help.printing.title')}</h2>
      <h3>{t('help.printing.bestResults.title')}</h3>
      <ul>
        <li><strong>{t('help.printing.bestResults.margins')}</strong> {t('help.printing.bestResults.marginsDesc')}</li>
        <li><strong>{t('help.printing.bestResults.background')}</strong> {t('help.printing.bestResults.backgroundDesc')}</li>
      </ul>
      <h3>{t('help.printing.troubleshooting.title')}</h3>
      <ul>
        <li><strong>{t('help.printing.troubleshooting.layoutBroken')}</strong> {t('help.printing.troubleshooting.layoutBrokenDesc')}</li>
        <li><strong>{t('help.printing.troubleshooting.colors')}</strong> {t('help.printing.troubleshooting.colorsDesc')}</li>
      </ul>

      <h2>{t('help.other.title')}</h2>
      <h3>{t('help.other.security.title')}</h3>
      <p>{t('help.other.security.desc')}</p>
      <h3>{t('help.other.shortcuts.title')}</h3>
      <ul>
        <li><strong>Ctrl+F:</strong> {t('help.other.shortcuts.find')}</li>
        <li><strong>Ctrl+Z:</strong> {t('help.other.shortcuts.undo')}</li>
        <li><strong>Ctrl+Y:</strong> {t('help.other.shortcuts.redo')}</li>
      </ul>
    </div>
  );
}

export default Help;
