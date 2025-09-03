import { useEffect, useRef } from 'react';
import type { Message } from '../../types/message';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export default function MessageList({
  messages,
  loading,
  error,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // メッセージが更新されるたびに最下部にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-gray-500'>メッセージを読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-red-500'>エラー: {error}</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-gray-500'>まだメッセージがありません</div>
      </div>
    );
  }

  return (
    <div className='grid gap-y-4 py-4'>
      {messages.map((message) => (
        <div key={message.id} className='bg-gray-100 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-xs text-gray-500'>
              {new Date(message.created_at).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div className='text-gray-800'>{message.content}</div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
