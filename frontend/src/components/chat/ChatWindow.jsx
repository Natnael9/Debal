import { useState } from "react";
import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const currentUserId = "current-user";

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => [...previousMessages, newMessage]);
  };

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col bg-[#f8fafc]">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-900">
              A
            </div>
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div>
            <h1 className="text-sm font-semibold text-gray-900">Abebe</h1>
            <p className="text-xs text-gray-400">Roommate match • Online</p>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="flex items-center gap-2 text-gray-400">
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 hover:text-gray-600">
            📞
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 hover:text-gray-600">
            📹
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-50 hover:text-gray-600">
            ⚙️
          </button>
        </div>
      </div>

      {/* Messages View */}
      <MessageList messages={messages} currentUserId={currentUserId} />

      {/* Message Floating Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}

export default ChatWindow;