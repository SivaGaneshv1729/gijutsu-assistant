import re

with open('frontend/src/contexts/LanguageContext.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

ja_proper = """  ja: {
    'app.title': 'MEI (製造エンジニアリング・インテリジェンス)',
    'sidebar.newChat': '新しいチャット',
    'sidebar.close': 'サイドバーを閉じる',
    'sidebar.search': '検索',
    'sidebar.menu': 'メニュー',
    'sidebar.settings': '設定',
    'sidebar.teams': 'チーム',
    'sidebar.recentChats': '最近のチャット',
    'sidebar.noChats': '最近のチャットはありません',
    'sidebar.logout': 'ログアウト',
    'chat.placeholder': '何か質問してください...',
    'chat.greeting': 'コマンダー、こんにちは。私はMEIシステムです。すべてのマニュアルと診断がロードされています。どのようなご用件でしょうか？',
    'chat.empty': '今日はどのようなご用件でしょうか？',
    'chat.systemError': 'システム通信エラー: ',
    'chat.sessionLoaded': 'コマンダー、こんにちは。セッションがロードされました。どのようなご用件でしょうか？',
    'pdf.sourceDoc': 'ソースドキュメント',
    'pdf.page': 'ページ',
    'pdf.extractedContent': '抽出されたコンテンツ',
    'action.good': '良い回答',
    'action.bad': '悪い回答',
    'action.copy': 'クリップボードにコピー',
    'action.retry': '回答を再生成',
  }"""

content = re.sub(r'  ja: \{.*?\n  \}', ja_proper, content, flags=re.DOTALL)

with open('frontend/src/contexts/LanguageContext.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Japanese translations fixed.")
