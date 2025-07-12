import React from 'react';
import { useTranslation } from 'react-i18next';
import './About.css';

const About = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="about-container">
      <button onClick={() => onNavigate('app')} className="back-button">
        &lt; {t('button.backToApp')}
      </button>
      <h1>{t('about.title')}</h1>
      <p>{t('about.description1')}</p>
      <p>{t('about.description2')}</p>
      <h2>{t('about.ourMission')}</h2>
      <p>{t('about.missionDescription')}</p>
      <h2>{t('about.contactUs')}</h2>
      <p>{t('about.contactDescription')}</p>
      <p>
        {t('about.contactEmail')}: <a href="mailto:your.email@example.com">your.email@example.com</a>
      </p>
    </div>
  );
};

export default About;
