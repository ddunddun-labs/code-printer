import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { GITHUB_REPO_URL, HUB_URL } from './state/constants';
import './About.css';

const About = ({ onNavigate }) => {
  const { t } = useTranslation();

  const pageTitle = t('about.title');
  const pageDescription = t('about.metaDescription');

  return (
    <div className="about-container">
      <Helmet>
        <title>{`${pageTitle} - 소스 코드 프린터`}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <button onClick={() => onNavigate('app')} className="back-button">
        &lt; {t('help.backToApp')}
      </button>
      <h1>{pageTitle}</h1>
      <p>소스 코드 프린터는 개발자들의 코드 공유와 리뷰 문화를 개선하고자 시작된 프로젝트입니다.</p>
      <p>코드를 A4에 인쇄하거나 PDF로 변환할 때 발생하는 불편함을 해결하고, 누구나 쉽게 깔끔하고 전문적인 결과물을 얻을 수 있도록 돕는 것을 목표로 합니다.</p>
      <h2>주요 기능</h2>
      <ul>
        <li>다양한 언어에 대한 자동 구문 강조</li>
        <li>실시간 미리보기를 통한 즉각적인 결과 확인</li>
        <li>글꼴, 글자 크기, 여백 등 세밀한 디자인 제어</li>
        <li>수동/자동 페이지 나누기 기능</li>
      </ul>
      <h2>문의</h2>
      <p>
        버그 제보와 기능 제안은{' '}
        <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noopener noreferrer">GitHub Issues</a>
        에서 받습니다.
      </p>
      <p>
        더 많은 프로젝트는{' '}
        <a href={HUB_URL} target="_blank" rel="noopener noreferrer">ddunddun Hub</a>
        에서 확인할 수 있습니다.
      </p>
    </div>
  );
};

export default About;
