import type { Message } from '../../types/message';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

export default function MessageList({ messages, loading, error }: MessageListProps) {
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
    <div className='flex flex-col space-y-4 p-4 overflow-y-auto'>
      {messages.map((message) => (
        <div key={message.id} className='bg-gray-100 rounded-lg p-3'>
          <div className='flex items-center justify-between mb-2'>
            <span className='font-semibold text-blue-600'>{message.user_id}</span>
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
    </div>
  );
}