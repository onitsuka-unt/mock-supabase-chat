import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types/message';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初期メッセージの取得
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: true });
        if (error) throw error;
        setMessages(data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '不明なエラーが発生しました'
        );
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // PostgresChangesを利用してクライアント⇄データベースをリアルタイム同期
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { messages, loading, error };
}
