import { useState } from "react";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";

const INITIAL_CHATS = [
  {
    id: "1",
    name: "Abebe Bikila",
    subtitle: "Roommate match",
    avatarText: "A",
    isOnline: true,
    lastMessage: "Yes! Still looking for a spot near campus.",
    time: "09:24 AM",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        senderId: "abebe",
        content: "Hey, are you still looking for a roommate?",
        createdAt: "09:20 AM",
      },
      {
        id: "m2",
        senderId: "current-user",
        content: "Yes! Still looking for a spot near campus.",
        createdAt: "09:24 AM",
      },
      {
        id: "m3",
        senderId: "abebe",
        content: "Awesome, what's your budget range for rent?",
        createdAt: "09:26 AM",
      },
    ],
  },
  {
    id: "2",
    name: "Sara Kebede",
    subtitle: "Apartment Sublet",
    avatarText: "S",
    isOnline: true,
    lastMessage: "Is the master bedroom still available?",
    time: "Yesterday",
    unreadCount: 2,
    messages: [
      {
        id: "m4",
        senderId: "sara",
        content: "Hi there! Saw your listing.",
        createdAt: "03:15 PM",
      },
      {
        id: "m5",
        senderId: "sara",
        content: "Is the master bedroom still available?",
        createdAt: "03:16 PM",
      },
    ],
  },
  {
    id: "3",
    name: "Dawit Mengistu",
    subtitle: "Bole Studio Share",
    avatarText: "D",
    isOnline: false,
    lastMessage: "Sent you the lease terms draft.",
    time: "Nov 12",
    unreadCount: 0,
    messages: [
      {
        id: "m6",
        senderId: "dawit",
        content: "Sent you the lease terms draft.",
        createdAt: "11:45 AM",
      },
    ],
  },
  {
    id: "4",
    name: "Helen Tadesse",
    subtitle: "Potential Flatmate",
    avatarText: "H",
    isOnline: false,
    lastMessage: "Sounds great, let's meet this Saturday!",
    time: "Nov 10",
    unreadCount: 0,
    messages: [
      {
        id: "m7",
        senderId: "helen",
        content: "Sounds great, let's meet this Saturday!",
        createdAt: "02:00 PM",
      },
    ],
  },
];

function ChatLayout() {
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState("1");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];

  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      senderId: "current-user",
      content,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            lastMessage: content,
            time: "Just now",
            messages: [...chat.messages, newMessage],
          };
        }
        return chat;
      })
    );
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
  };

  return (
    // CHANGE HERE: Added 'top-14' (or adjust as needed, e.g. top-16/top-12) to give the entire mobile view a top margin/offset without triggering page bounce
    <div className="fixed inset-x-0 bottom-0 top-20 flex h-[calc(100dvh-3.5rem)] w-full items-center justify-center overflow-hidden bg-slate-100 p-0 md:static md:top-auto md:min-h-screen md:h-auto md:overflow-y-auto md:p-6 lg:p-8">
      
      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity md:hidden"
        />
      )}

      {/* Frame Container */}
      <div className="relative flex h-full w-full gap-0 overflow-hidden md:h-[72vh] md:min-h-[480px] md:max-h-[640px] md:max-w-5xl md:gap-3.5 md:overflow-visible">
        
        {/* Slide-out Sidebar Drawer on Mobile / Panel on Desktop */}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Chat Window */}
        <ChatWindow
          chat={activeChat}
          onSendMessage={handleSendMessage}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  );
}

export default ChatLayout;