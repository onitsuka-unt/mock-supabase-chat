import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(
  '/api/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  })
);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

// メッセージ投稿API
app.post('/api/messages', async (c) => {
  try {
    const { content } = await c.req.json();

    if (!content || !content.trim()) {
      return c.json({ error: 'メッセージが空です' }, 400);
    }

    // メッセージの前処理
    const processedMessage = {
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    // Supabaseにメッセージを保存
    const { data, error } = await supabase
      .from('messages')
      .insert(processedMessage)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return c.json({ error: 'データベースエラー' }, 500);
    }

    return c.json({ message: data[0] });
  } catch (err) {
    console.error('API error:', err);
    return c.json({ error: 'サーバーエラー' }, 500);
  }
});

export default app;
