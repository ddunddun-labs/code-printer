import React from 'react';
import { useTranslation } from 'react-i18next';
import { HUB_URL } from './state/constants';
import './AppControls.css';

function AppControls({
  onNavigate, changeLanguage
}) {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ko' ? 'en' : 'ko';
    changeLanguage(newLang);
  };

  return (
    <div className="app-controls-container">
      <div className="app-header-content">
        <h1
          className="site-title"
          onClick={() => onNavigate('app')}
          style={{ cursor: 'pointer' }}
          data-testid="nav-home"
        >
          {t('header.siteTitle')}
        </h1>
        <p className="site-tagline">{t('header.siteTagline')}</p>
      </div>

      <div className="app-footer-content">
        <div className="footer-links">
          <button type="button" onClick={() => onNavigate('help')} className="footer-link-button" data-testid="nav-help">
            {t('footer.help')}
          </button>
          <a
            href={HUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            data-testid="nav-hub"
          >
            {t('footer.hub')}
          </a>
          <span className="language-toggle-separator">|</span>
          <button type="button" onClick={toggleLanguage} className="footer-link-button language-toggle-button" data-testid="language-toggle">
            {i18n.language === 'ko' ? 'English' : 'Korean'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppControls;
