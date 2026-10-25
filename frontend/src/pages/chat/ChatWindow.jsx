import { useState } from "react";

import MessageList from "../../components/chat/MessageList";
import MessageInput from "../../components/chat/MessageInput";

function ChatWindow() {
  const [messages, setMessages] = useState([]);

  // Temporary ID until authentication/backend is connected
  const currentUserId = "current-user";

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ]);
  };

  return (
    <div className="flex h-[calc(100vh-73px)] flex-col bg-gray-50">

      {/* Chat Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-900">
            A
          </div>

          <div>
            <h1 className="font-semibold text-gray-900">
              Abebe
            </h1>

            <p className="text-sm text-gray-500">
              Roommate match
            </p>
          </div>

        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
      />

      {/* Input */}
      <MessageInput
        onSend={handleSendMessage}
      />

    </div>
  );
}

export default ChatWindow;