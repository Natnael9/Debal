import { useState } from "react";

function ChatList({ chats = [], activeChatId, onSelectChat, onCloseMobile, onRequestDeleteChat }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);

  const filteredChats = chats.filter((chat) =>
    (chat.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full w-full flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm relative">
      
      {/* Header - Matching ChatWindow Header size */}
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2274A5] text-[11px] font-bold text-white shadow-xs">
              ME
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-gray-800 leading-tight">Messages</h2>
            <span className="text-[10px] text-gray-400">Recent conversations</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCloseMobile}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 md:hidden"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input - Matching ChatWindow Input size */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400"
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
          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-1.5 pl-8 pr-3 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#2274A5] focus:bg-white"
        />
      </div>

      {/* Conversations List */}
      <div className="flex-1 space-y-1.5 overflow-y-auto pr-0.5">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 4.03 8z" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-600">No conversations</p>
            <p className="mt-0.5 text-[10px] text-gray-400 leading-tight">
              {searchTerm ? "No match found for search term." : "Matched roommate connections will appear here."}
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const isMenuOpen = openMenuId === chat.id;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl p-2.5 transition ${
                  isActive
                    ? "border border-blue-100 bg-blue-50/70 text-[#2274A5]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="relative shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-[#2274A5] shadow-xs">
                      {chat.avatarText || (chat.name ? chat.name[0].toUpperCase() : "?")}
                    </div>
                    {chat.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xs font-bold text-gray-800 leading-tight">
                      {chat.name || "User"}
                    </h3>
                    <p className="truncate text-[10px] text-gray-400 mt-0.5">
                      {chat.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 pl-1">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[9px] font-medium text-gray-400">{chat.time}</span>
                    {chat.unreadCount > 0 && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2274A5] text-[9px] font-bold text-white">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* 3-dots action menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : chat.id);
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 opacity-60 group-hover:opacity-100 hover:bg-gray-200/60 hover:text-gray-700 transition"
                      title="Options"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>

                    {/* Action Dropdown */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(null);
                          }}
                        />
                        <div className="absolute right-0 top-7 z-50 w-32 rounded-xl border border-gray-100 bg-white p-1 shadow-xl text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onRequestDeleteChat?.(chat);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                          >
                            <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete Chat</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ChatList;