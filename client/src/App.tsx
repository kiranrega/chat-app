import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [isCreateRoomClicked, setIsCreateRoomClicked] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [text, setText] = useState("");
  const [roomIdChange, setroomIdChange] = useState("");
  let ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("onOpen");
    };

    ws.current.onmessage = (ev: MessageEvent) => {
      setMessages((prev) => [...prev, ev.data]);
    };
    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    ws.current;

    return () => {
      ws.current?.close();
      setIsCreateRoomClicked(false);
    };
  }, []);
  const joinRoom = () => {
    if (!ws.current) return;

    ws.current.send(
      JSON.stringify({
        type: "join",
        payload: {
          roomId: roomIdChange,
        },
      })
    );
    setIsCreateRoomClicked(true);
  };
  const handleCreateRoom = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    setRoomId(result);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN && text.trim()) {
      ws.current.send(
        JSON.stringify({
          type: "chat",
          payload: {
            message: text,
          },
        })
      );
      setText("");
    }
  };
  const handleRoomId = (e: any) => {
    setroomIdChange(e.target.value);
  };
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center">
      <div className="flex flex-col w-full max-w-md h-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden p-4">
        {isCreateRoomClicked ? (
          <div className="h-[80vh] flex flex-col">
            <div className="bg-purple-700 text-white text-center p-4 font-bold text-xl rounded-xl">
              Chat Room: <span className="text-yellow-300">{roomIdChange}</span>
            </div>
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

            <div className="p-3 flex items-center space-x-2 bg-gray-800 align-bottom">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-amber-50"
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
        ) : (
          <div>
            <button
              className="bg-purple-700 rounded-4xl text-amber-50 text-center p-2 font-bold text-xl w-full my-3 hover:cursor-pointer"
              onClick={handleCreateRoom}
            >
              Create Room
            </button>
            <div className="flex justify-between">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2  text-white placeholder:text-amber-50 "
                onChange={handleRoomId}
                value={roomIdChange}
              />
              <button
                className="bg-purple-700 rounded-4xl text-amber-50 text-center p-2 font-bold text-xl hover:cursor-pointer"
                onClick={joinRoom}
              >
                Join Room
              </button>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-amber-50 pl-3 mr-3">
              Room ID:{" "}
              <span className="px-2 py-1 bg-purple-100 text-purple-700 font-mono rounded">
                {roomId}
              </span>
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
