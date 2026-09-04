import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { CodePrinterProvider } from './state/CodePrinterProvider';

// i18next 초기화 모의(mock)
jest.mock('./i18n', () => ({
  __esModule: true,
  default: {
    changeLanguage: jest.fn(() => Promise.resolve()),
    language: 'ko',
  },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => {
      const translations = {
        'button.findReplace': '찾기/바꾸기',
        'editor.pageBreakGroup': '페이지 나누기:',
        'button.insert': '삽입',
        'button.delete': '삭제',
        'button.findNext': '다음 찾기',
        'button.replace': '바꾸기',
        'button.replaceAll': '모두 바꾸기',
        'quickClean.title': '빠른 정리:',
        'quickClean.removeEmptyLines': '연속된 빈 줄 제거',
        'quickClean.liftBrackets': '닫는 괄호 올리기',
        'quickClean.removeFirstChar': '첫 문자 제거',
        'alert.replaceAllCount': `${options?.count || 0}개의 항목을 바꿨습니다.`,
        'alert.quickClean.removeEmptyLines': '빈 줄 제거 정리 완료!',
        'alert.quickClean.liftBrackets': '닫는 괄호 올리기 정리 완료!',
        'alert.removeFirstChar': '첫 문자 제거 완료!',
        'alert.noMatches': '일치하는 내용이 없습니다.',
        'findReplace.findLabel': '찾을 내용',
        'findReplace.replaceLabel': '바꿀 내용',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: () => new Promise(() => {}),
    },
  }),
}));

// react-helmet-async 모의(mock)
jest.mock('react-helmet-async', () => ({
  Helmet: ({ children }) => <>{children}</>,
  HelmetProvider: ({ children }) => <>{children}</>,
}));

// window.alert 모의(mock)
global.alert = jest.fn();

describe('App Component Feature Tests', () => {

  beforeEach(() => {
    global.alert.mockClear();
  });

  const setup = async () => {
    const user = userEvent.setup();
    render(
      <CodePrinterProvider>
        <App />
      </CodePrinterProvider>,
    );
    const textarea = screen.getByTestId('code-editor');
    const findReplaceButton = screen.getByText('찾기/바꾸기');
    await user.click(findReplaceButton);
    return { user, textarea };
  };

  test('닫는 괄호 올리기 (공백 포함)', async () => {
    const { user, textarea } = await setup();
    fireEvent.change(textarea, { target: { value: '{\n  }' } });
    
    const liftBracketsButton = screen.getByText('닫는 괄호 올리기');
    await user.click(liftBracketsButton);

    expect(textarea.value).toBe('{ }');
    expect(global.alert).toHaveBeenCalledWith('닫는 괄호 올리기 정리 완료!');
  });

  test('첫 문자 제거 (페이지 나누기 마커 보호)', async () => {
    const { user, textarea } = await setup();
    const pageBreakMarker = '%%%%%%%%%% PAGE_BREAK %%%%%%%%%%';
    fireEvent.change(textarea, { target: { value: `1. first line\n${pageBreakMarker}\n3. third line` } });

    const removeFirstCharButton = screen.getByText('첫 문자 제거');
    await user.click(removeFirstCharButton);

    const expectedValue = `. first line\n${pageBreakMarker}\n. third line`;
    expect(textarea.value).toBe(expectedValue);
    expect(global.alert).toHaveBeenCalledWith('첫 문자 제거 완료!');
  });

  test('바꾸기 (선택 없을 때)', async () => {
    const { user, textarea } = await setup();
    fireEvent.change(textarea, { target: { value: 'apple banana apple' } });

    const findInput = screen.getByLabelText('찾을 내용:');
    const replaceInput = screen.getByLabelText('바꿀 내용:');
    await user.type(findInput, 'apple');
    await user.type(replaceInput, 'orange');

    const replaceButton = screen.getByText('바꾸기');
    await user.click(replaceButton);

    expect(textarea.value).toBe('orange banana apple');
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe('orange'.length);
  });

  test('바꾸기 (선택 있을 때)', async () => {
    const { user, textarea } = await setup();
    fireEvent.change(textarea, { target: { value: 'apple banana apple' } });

    const findInput = screen.getByLabelText('찾을 내용:');
    const replaceInput = screen.getByLabelText('바꿀 내용:');
    await user.type(findInput, 'apple');
    await user.type(replaceInput, 'orange');

    const findNextButton = screen.getByText('다음 찾기');
    await user.click(findNextButton);

    const replaceButton = screen.getByText('바꾸기');
    await user.click(replaceButton);

    expect(textarea.value).toBe('orange banana apple');
    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe('orange'.length);
  });
});
