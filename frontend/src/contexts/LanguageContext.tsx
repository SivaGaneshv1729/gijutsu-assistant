import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ja';

type Translations = {
  [key in Language]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  en: {
    'app.title': 'MEI',
    'sidebar.newChat': 'New Chat',
    'sidebar.close': 'Close Sidebar',
    'sidebar.search': 'Search',
    'sidebar.menu': 'Menu',
    'sidebar.settings': 'Settings',
    'sidebar.teams': 'Teams',
    'sidebar.recentChats': 'Recent Chats',
    'sidebar.noChats': 'No recent chats',
    'sidebar.logout': 'Log out',
    'chat.placeholder': 'Ask me something',
    'chat.greeting': 'Greetings, Commander. I am the MEI System. All manuals and diagnostics are loaded. How can I assist you?',
    'chat.empty': 'How can I help you today?',
    'chat.systemError': 'System communication failure. ',
    'chat.sessionLoaded': 'Greetings, Commander. Session loaded. How can I assist you?',
    'pdf.sourceDoc': 'Source Document',
    'pdf.page': 'Pg',
    'pdf.extractedContent': 'Extracted Content',
    'action.good': 'Good response',
    'action.bad': 'Bad response',
    'action.copy': 'Copy to clipboard',
    'action.retry': 'Regenerate response',
  },
  ja: {
    'app.title': 'MEI (製造エンジニアリングインテリジェンス)',
    'sidebar.newChat': '新しいチャット',
    'sidebar.close': 'サイドバーを閉じる',
    'sidebar.search': '検索',
    'sidebar.menu': 'メニュー',
    'sidebar.settings': '設定',
    'sidebar.teams': 'チーム',
    'sidebar.recentChats': '最近のチャット',
    'sidebar.noChats': '最近のチャットはありません',
    'sidebar.logout': 'ログアウト',
    'chat.placeholder': '何か質問はありますか？',
    'chat.greeting': '司令官、こんにちは。私はMEIシステムです。すべてのマニュアルと診断がロードされています。どのようなご用件でしょうか？',
    'chat.empty': '今日はどのようなご用件でしょうか？',
    'chat.systemError': 'システム通信障害。 ',
    'chat.sessionLoaded': '司令官、こんにちは。セッションがロードされました。どのようなご用件でしょうか？',
    'pdf.sourceDoc': 'ソースドキュメント',
    'pdf.page': 'ページ',
    'pdf.extractedContent': '抽出されたコンテンツ',
    'action.good': '良い回答',
    'action.bad': '悪い回答',
    'action.copy': 'クリップボードにコピー',
    'action.retry': '回答を再生成',
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
