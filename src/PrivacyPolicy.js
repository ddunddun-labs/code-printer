import React from 'react';
import './PrivacyPolicy.css';

function PrivacyPolicy({ onNavigate }) {
  return (
    <div className="privacy-policy-container">
      <button onClick={() => onNavigate('app')} className="back-button">
        &larr; 앱으로 돌아가기
      </button>
      <h1>개인정보처리방침</h1>
      <p><strong>최종 수정일: 2025년 7월 12일</strong></p>

      <h2>1. 수집하는 개인정보의 항목</h2>
      <p>
        본 서비스(code-printer)는 사용자의 편의성 향상과 서비스 품질 유지를 위해 다음과 같은 정보를 자동으로 수집할 수 있습니다.
        <ul>
          <li>쿠키(Cookie)</li>
          <li>광고 식별자</li>
          <li>IP 주소, 브라우저 유형, 기기 정보 등 서비스 이용 기록</li>
        </ul>
        이 정보는 개인을 특정하지 않는 비식별 정보입니다.
      </p>

      <h2>2. 개인정보의 수집 및 이용 목적</h2>
      <p>
        본 서비스는 수집한 정보를 다음의 목적을 위해 활용합니다.
        <ul>
          <li>Google AdSense 등 제3자 광고 제공업체를 통한 맞춤형 광고 제공</li>
          <li>서비스 이용 통계 분석 및 품질 개선</li>
          <li>사용자 경험 최적화</li>
        </ul>
      </p>

      <h2>3. 쿠키(Cookie)에 의한 정보 수집</h2>
      <p>
        본 서비스는 Google AdSense를 포함한 제3자 광고 제공업체가 쿠키를 사용하여 사용자의 웹사이트 방문 기록에 근거한 광고를 게재할 수 있습니다.
      </p>
      <p>
        Google의 광고 쿠키를 사용하면 Google 및 파트너가 사용자의 사이트 및 다른 사이트 방문 기록을 토대로 맞춤 광고를 게재할 수 있습니다.
      </p>
      <p>
        사용자는 <a href="https://adssettings.google.com/authenticated" target="_blank" rel="noopener noreferrer">Google 광고 설정</a> 페이지에서 맞춤 광고 게재를 중단할 수 있습니다. 또는 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info/choices</a> 페이지를 방문하여 제3자 광고 제공업체의 맞춤 광고 쿠키 사용을 중단할 수 있습니다.
      </p>

      <h2>4. 개인정보처리방침의 변경</h2>
      <p>
        법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
      </p>

      <h2>5. 문의</h2>
      <p>
        개인정보 관련 문의는 푸터의 '개선 제안하기' 링크를 통해 이메일로 연락주시기 바랍니다.
      </p>
    </div>
  );
}

export default PrivacyPolicy;
