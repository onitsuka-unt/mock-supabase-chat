import Header from './components/header';
import Footer from './components/footer';
import Chat from './components/chat/chat-container';

function App() {
  return (
    <div className='grid min-h-screen grid-rows-[auto_1fr_auto] grid-cols-[100%]'>
      <Header />
      <Chat />
      <Footer />
    </div>
  );
}

export default App;
