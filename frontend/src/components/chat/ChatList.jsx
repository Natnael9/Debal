import { useState } from "react";

function ChatList({ chats, activeChatId, onSelectChat, onCloseMobile }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-none md:rounded-2xl border border-gray-100 bg-white p-3.5 shadow-xl">
      
      {/* Header */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-900 text-[11px] font-bold text-white shadow-xs">
              ME
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold leading-tight text-gray-800">Messages</h2>
            <span className="text-[10px] text-gray-400">Recent conversations</span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 md:hidden"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Compact Search Bar */}
      <div className="relative mb-2.5">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-1.5 pl-8 pr-3 text-[11px] text-gray-800 placeholder-gray-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600/20"
        />
        <svg
          className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* List */}
      <div className="flex-1 space-y-1 overflow-y-auto pr-0.5">
        {filteredChats.map((chat) => {
          const isActive = chat.id === activeChatId;

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`group flex cursor-pointer items-center justify-between rounded-xl p-2.5 transition ${
                isActive
                  ? "border border-blue-100 bg-blue-50/80 text-blue-950 shadow-xs"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-900 shadow-xs">
                    {chat.avatarText}
                  </div>
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[11px] font-semibold text-gray-900">
                    {chat.name}
                  </h3>
                  <p className="truncate text-[10px] text-gray-400">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1 pl-1.5">
                <span className="text-[9px] font-medium text-gray-400">{chat.time}</span>
                {chat.unreadCount > 0 && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-900 text-[8px] font-bold text-white">
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