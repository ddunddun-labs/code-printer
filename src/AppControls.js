import React from 'react';
import { useTranslation } from 'react-i18next';
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
        <h1 className="site-title">{t('header.siteTitle')}</h1>
        <p className="site-tagline">{t('header.siteTagline')}</p>
      </div>

      <div className="app-footer-content">
        <span className="footer-copyright">
          © 2025 code-printer. All Rights Reserved.
        </span>
        <div className="footer-links">
          <button onClick={() => onNavigate('help')} className="footer-link-button">
            {t('footer.help')}
          </button>
          <button onClick={() => onNavigate('privacy')} className="footer-link-button">
            {t('footer.privacyPolicy')}
          </button>
          <a href="https://forms.gle/VRFFs4yruaMBxtbM7" target="_blank" rel="noopener noreferrer" className="footer-link">
            {t('footer.suggestImprovements')}
          </a>
          <span className="language-toggle-separator">|</span>
          <button onClick={toggleLanguage} className="footer-link-button language-toggle-button">
            {i18n.language === 'ko' ? 'English' : 'Korean'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppControls;
