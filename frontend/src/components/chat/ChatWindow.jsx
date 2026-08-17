import { useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";



function ChatWindow({ chat, onSendMessage, onOpenSidebar }) {
  const currentUserId = "current-user";
  const [isTyping, setIsTyping] = useState(false);

  return (
<div className="flex flex-1 h-[80dvh] md:h-[80dvh] sm:h-[full]  min-w-0 flex-col justify-between overflow-hidden rounded-none border-0 bg-white shadow-none md:rounded-2xl md:border md:border-gray-100 md:shadow-xl">      
      {/* Compact Header */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          
          {/* Mobile Drawer Opener */}
          <button
            onClick={onOpenSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 md:hidden"
            aria-label="Open chat list"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-900 shadow-xs">
              {chat.avatarText}
            </div>
            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
            )}
          </div>

          <div>
            <h1 className="text-xs font-bold leading-tight text-gray-800">{chat.name}</h1>
            <p className="text-[10px] text-gray-400 leading-none">
              {chat.subtitle} • {chat.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 text-gray-400">
          <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList messages={chat.messages} currentUserId={currentUserId} isTyping={isTyping}/>

      {/* Input */}
      <MessageInput onSend={onSendMessage} onTyping={() => setIsTyping(true)} 
      onStopTyping={() => setIsTyping(false)} />

    </div>
  );
}

export default ChatWindow;