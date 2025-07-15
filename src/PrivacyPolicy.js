import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import './PrivacyPolicy.css';

function PrivacyPolicy({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="privacy-policy-container">
      <Helmet>
        <title>{`${t('privacyPolicy.title')} - ${t('header.siteTitle')}`}</title>
        <meta name="description" content={t('privacyPolicy.metaDescription')} />
      </Helmet>
      <button onClick={() => onNavigate('app')} className="back-button">
        &larr; {t('help.backToApp')}
      </button>
      <h1>{t('privacyPolicy.title')}</h1>
      <p><strong>{t('privacyPolicy.lastUpdated')}: 2025년 7월 15일</strong></p>

      <h2>{t('privacyPolicy.section1.title')}</h2>
      <p>
        {t('privacyPolicy.section1.p1')}
        <ul>
          <li>{t('privacyPolicy.section1.item1')}</li>
          <li>{t('privacyPolicy.section1.item2')}</li>
          <li>{t('privacyPolicy.section1.item3')}</li>
        </ul>
        {t('privacyPolicy.section1.p2')}
      </p>

      <h2>{t('privacyPolicy.section2.title')}</h2>
      <p>
        {t('privacyPolicy.section2.p1')}
        <ul>
          <li>{t('privacyPolicy.section2.item1')}</li>
          <li>{t('privacyPolicy.section2.item2')}</li>
          <li>{t('privacyPolicy.section2.item3')}</li>
        </ul>
      </p>

      <h2>{t('privacyPolicy.section3.title')}</h2>
      <p>{t('privacyPolicy.section3.p1')}</p>
      <p>{t('privacyPolicy.section3.p2')}</p>
      <p>
        <Trans i18nKey="privacyPolicy.section3.p3">
          Users may opt out of personalized advertising by visiting <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>. Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a>.
        </Trans>
      </p>

      <h2>{t('privacyPolicy.section4.title')}</h2>
      <p>{t('privacyPolicy.section4.p1')}</p>

      <h2>{t('privacyPolicy.section5.title')}</h2>
      <p>{t('privacyPolicy.section5.p1')}</p>
    </div>
  );
}

export default PrivacyPolicy;