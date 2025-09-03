import { useState } from 'react';

export default function ChatInput() {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className='border-t bg-white pt-4'>
      <form onSubmit={handleSubmit}>
        <div className='grid grid-cols-[1fr_auto] space-x-2'>
          <input
            type='text'
            placeholder='メッセージを入力してください...'
            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
          />
          <button
            type='submit'
            className='px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
