import { BrowserRouter as Router } from "react-router-dom";
import Layout from "./layouts/Layout";
import { AuthContextProvider } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebSocketContext";
import CleanerWebSocket from "./context/CleanerWebSocket";
import ChatWidget from "./components/ChatBot/ChatWidget";

function App() {
  const cleaner = JSON.parse(sessionStorage.getItem("cleaner"));

  return (
    <AuthContextProvider>
      <WebSocketProvider>
        <Router>
          {cleaner && <CleanerWebSocket />}
          <Layout />
          <ChatWidget />
        </Router>
      </WebSocketProvider>
    </AuthContextProvider>
  );
}

export default App;
