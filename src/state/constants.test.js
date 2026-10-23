import { getHubUrl } from './constants';

describe('getHubUrl', () => {
  test('uses the Korean Hub entry for Korean locales', () => {
    expect(getHubUrl('ko')).toBe('https://ddunddunlabs.com/ko/');
    expect(getHubUrl('ko-KR')).toBe('https://ddunddunlabs.com/ko/');
  });

  test('uses the English Hub entry for other locales', () => {
    expect(getHubUrl('en')).toBe('https://ddunddunlabs.com/');
    expect(getHubUrl(undefined)).toBe('https://ddunddunlabs.com/');
  });
});
