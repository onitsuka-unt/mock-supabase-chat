import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { cors } from 'hono/cors';
import { GoogleGenAI } from '@google/genai';

type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  GOOGLE_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  '/api/*',
  cors({
    origin: '*',
    allowHeaders: ['Content-Type'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  })
);

// 環境変数の検証とクライアント初期化を関数化
const initializeServices = (c: any) => {
  // Cloudflare Workers環境では c.env から、開発環境では process.env から取得
  const supabaseUrl = c.env?.SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    c.env?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiApiKey = c.env?.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Supabase環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  if (!geminiApiKey) {
    throw new Error('Google API Key が設定されていません: GOOGLE_API_KEY');
  }

  // クライアント初期化
  const supabase = createClient(supabaseUrl, supabaseKey);
  const genAI = new GoogleGenAI({ apiKey: geminiApiKey });

  return { supabase, genAI };
};

const getChatHistory = async (supabase: any) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('履歴取得エラー:', error);
    return [];
  }

  return data || [];
};

const saveMessage = async (
  supabase: any,
  content: string,
  role: 'user' | 'assistant'
) => {
  const messageData = {
    content: content.trim(),
    role,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error('メッセージ保存エラー:', error);
    throw error;
  }

  return data;
};

// 統合チャットAPI - クライアントからテキスト受信→AI生成→DB保存まで一括処理
app.post('/api/chat', async (c) => {
  try {
    // 各リクエストでサービスを初期化
    const { supabase, genAI } = initializeServices(c);

    const { message } = await c.req.json();

    if (!message || typeof message !== 'string') {
      return c.json({ error: 'メッセージが必要です' }, 400);
    }

    const savedUserMessage = await saveMessage(supabase, message, 'user');
    const history = await getChatHistory(supabase);
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...chatHistory,
        {
          role: 'user',
          parts: [{ text: message }],
        },
      ],
      config: {
        // システム指示を追加して人間味を出す
        systemInstruction: {
          role: 'system',
          parts: [
            {
              text: `あなたは親しみやすい日本人です。以下の点を守って回答してください：
                      1. 自然で親しみやすい会話調で応答する
                      2. 箇条書きや特殊記号（***、##など）は使わない
                      3. 一文は適度な長さに収める（30-50文字程度）
                      4. 専門用語は分かりやすく説明する
                      5. 共感的で温かみのある表現を心がける
                      6. 「です・ま」調で統一する
                      7. あなたは複数ユーザーとの会話を理解できます。
                        - ユーザー名を見て誰が発言したかを把握してください
                        - 過去の会話の文脈を理解して応答してください`,
            },
          ],
        },

        maxOutputTokens: 200,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const aiResponse = response.text || 'AIからの応答を生成できませんでした。';
    const savedAiMessage = await saveMessage(supabase, aiResponse, 'assistant');

    return c.json({
      success: true,
      userMessage: savedUserMessage.content,
      aiResponse: savedAiMessage.content,
    });
  } catch (err) {
    console.error('チャットAPI エラー:', err);
    return c.json(
      {
        error: 'チャット処理中にエラーが発生しました',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      500
    );
  }
});

export default app;
