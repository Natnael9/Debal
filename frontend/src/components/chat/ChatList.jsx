import { useState } from "react";

function ChatList({ chats, activeChatId, onSelectChat, onCloseMobile }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-80 md:w-full shrink-0 flex-col rounded-none md:rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      
      {/* Header - Increased Fonts */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-900 text-sm font-bold text-white shadow-xs">
              ME
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900 leading-tight">Messages</h2>
            <span className="text-xs text-gray-400">Recent conversations</span>
          </div>
        </div>

        <button
          onClick={onCloseMobile}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 md:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input - Increased Fonts */}
      <div className="relative mb-4">
        <svg
          className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white"
        />
      </div>

      {/* Conversations List - Increased Fonts */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-2xl p-3 transition ${
                isActive
                  ? "border border-blue-100 bg-blue-50/70 text-blue-900"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-900">
                    {chat.avatarText}
                  </div>
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-gray-900 leading-snug">
                    {chat.name}
                  </h3>
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5 pl-2">
                <span className="text-[11px] font-medium text-gray-400">{chat.time}</span>
                {chat.unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-900 text-xs font-bold text-white">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChatList;