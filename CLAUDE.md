# React + Hono + Supabase Realtime チャット実装

## 概要

React フロントエンド、Hono API サーバー、Supabase Realtime を組み合わせたリアルタイムチャットアプリケーションの実装。

## アーキテクチャ

### 構成要素

- **React**: フロントエンド UI、リアルタイム表示
- **Hono**: API サーバー（メッセージ処理、認証、バリデーション）
- **Supabase**: データベース + Realtime 機能

### データフロー

```
[メッセージ送信]
React → Hono API → [処理/変換] → Supabase → Realtime → 全クライアント

[リアルタイム受信]
React ←← Supabase Realtime (WebSocket購読)
```

## 実装ポイント

### 1. Supabase 設定

- メッセージテーブルで Realtime 機能有効化
- Row Level Security（RLS）設定
- 適切なインデックス設定

### 2. React 側（フロントエンド）

```javascript
// リアルタイム購読（読み取り専用）
supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      setMessages((prev) => [...prev, payload.new]);
    }
  )
  .subscribe();

// メッセージ送信（Hono API経由）
const sendMessage = async (content) => {
  await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ content, room_id }),
  });
};
```

### 3. Hono 側（バックエンド）

```javascript
// メッセージ処理API
app.post('/api/messages', async (c) => {
  const { content, user_id, room_id } = await c.req.json();

  // メッセージの前処理
  const processedMessage = {
    content: sanitizeContent(content),
    user_id,
    room_id,
    created_at: new Date().toISOString(),
    // 追加処理結果
    word_count: content.split(' ').length,
    has_mentions: content.includes('@'),
  };

  // Supabaseに保存
  const { data } = await supabase
    .from('messages')
    .insert(processedMessage)
    .select();

  return c.json({ message: data[0] });
});
```

## 役割分担

### React（クライアント）

- **読み取り**: Supabase Realtime から直接購読
- **書き込み**: Hono API 経由でメッセージ送信
- UI/UX、状態管理

### Hono（API サーバー）

- メッセージの前処理（サニタイズ、バリデーション）
- 認証・認可
- ビジネスロジック
- 外部 API 連携（AI 分析、翻訳など）

### Supabase

- データ永続化
- リアルタイム配信（WebSocket 管理）
- 認証機能
- セキュリティ（RLS）
