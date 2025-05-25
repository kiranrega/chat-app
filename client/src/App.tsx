import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [text, setText] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({
        type: "join",
        payload: {
          roomId: "red"
        }
      }));
    };

    ws.current.onmessage = (ev: MessageEvent) => {
      setMessages((prev) => [...prev, ev.data]);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && text.trim()) {
      ws.current.send(JSON.stringify({
        type: "chat",
        payload: {
          message: text
        }
      }));
      setText("");
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
      <div className="flex flex-col w-full max-w-md h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-purple-700 text-white text-center p-4 font-bold text-xl">
          Chat Room: <span className="text-yellow-300">Red</span>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-transparent">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] px-4 py-2 rounded-2xl text-white ${
                idx % 2 === 0
                  ? "bg-purple-600 self-start"
                  : "bg-amber-500 self-end text-black"
              }`}
            >
              {msg}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-gray-100 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
