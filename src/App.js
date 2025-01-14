import Explain from "./Explain";
import Footer from "./Footer";
import Header from "./Header";
import Chat from "./chatbot/Chat";
import "./chatbot/Chat.css";

function App() {
  return (
    <div className="App">
      <Header />
      <div className="body_container">
        <Explain />
        <Chat />
      </div>
      <Footer />
    </div>
  );
}

export default App;
