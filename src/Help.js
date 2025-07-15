import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicy.css'; // 스타일 재사용

function Help({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="privacy-policy-container">
      <Helmet>
        <title>{`${t('help.title')} - 소스 코드 프린터`}</title>
        <meta name="description" content={t('help.metaDescription')} />
      </Helmet>
      <button onClick={() => onNavigate('app')} className="back-button">
        {t('help.backToApp')}
      </button>
      <h1>{t('help.title')}</h1>
      
      <h2>{t('help.about.title')}</h2>
      <p>{t('help.about.p1')}</p>
      <p>{t('help.about.p2')}</p>

      <h2>{t('help.editor.title')}</h2>
      <p>{t('help.editor.p1')}</p>
      
      <h2>{t('help.preview.title')}</h2>
      <p>{t('help.preview.p1')}</p>

      <h2>{t('help.pageBreak.title')}</h2>
      <p>{t('help.pageBreak.p1')}</p>
      <p>{t('help.pageBreak.p2')}</p>

      <h2>{t('help.margins.title')}</h2>
      <p>{t('help.margins.p1')}</p>

      <h2>{t('help.findReplace.title')}</h2>
      <p>{t('help.findReplace.p1')}</p>

      <h2>{t('help.quickClean.title')}</h2>
      <p>{t('help.quickClean.p1')}</p>

      <h2>{t('help.undoRedo.title')}</h2>
      <p>{t('help.undoRedo.p1')}</p>
    </div>
  );
}

export default Help;