import ChatInput from './chat-input';
import MessageList from './message-list';
import { useMessages } from '../../hooks/useMessages';

export default function Chat() {
  const { messages, loading, error } = useMessages();

  return (
    <div className='container mx-auto grid h-full grid-rows-[1fr_auto] max-w-4xl px-4'>
      <MessageList messages={messages} loading={loading} error={error} />
      <ChatInput />
    </div>
  );
}
