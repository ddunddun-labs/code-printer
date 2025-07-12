import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json';
import ko from './locales/ko/translation.json';

i18n
  .use(initReactI18next) // i18next를 react-i18next에 전달합니다.
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: "ko", // 기본 언어 설정
    fallbackLng: "en", // lng에서 정의한 언어를 사용할 수 없을 때의 대체 언어
    interpolation: {
      escapeValue: false, // React는 이미 XSS로부터 안전하므로 false로 설정
    },
  });

export default i18n;
