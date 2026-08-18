import { useState } from "react";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import MeetupCard from "../../components/chat/MeetupCard";

const INITIAL_CHATS = [
  {
    id: "1",
    name: "Abebe Bikila",
    subtitle: "Roommate match",
    avatarText: "A",
    isOnline: true,
    lastMessage: "Yes! Still looking for a spot ne...",
    time: "09:24 AM",
    unreadCount: 0,
    meetup: { status: "none" },
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
    lastMessage: "Is the master bedroom still a...",
    time: "Yesterday",
    unreadCount: 2,
    meetup: {
      status: "pending",
      proposedBy: "Sara Kebede",
      date: "August 22, 2026",
      time: "3:00 PM",
      location: "Bole, Addis Ababa",
      note: "Let's meet for coffee!",
    },
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
    meetup: {
      status: "pending",
      proposedBy: "Dawit Mengistu",
      date: "August 24, 2026",
      time: "5:00 PM",
      location: "Bole, Addis Ababa",
      note: "Let's discuss the apartment.",
    },
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
    lastMessage: "Sounds great, let's meet this Sa...",
    time: "Nov 10",
    unreadCount: 0,
    meetup: { status: "none" },
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
  const [isMeetupOpen, setIsMeetupOpen] = useState(false);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || chats[0];

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
    <div className="fixed inset-x-0 bottom-0 top-14 flex h-[calc(100dvh-3.5rem)] w-full justify-center overflow-hidden bg-slate-100 p-0 sm:top-20 md:static md:top-auto md:min-h-[calc(100vh-80px)] md:h-auto md:overflow-y-auto md:p-6 lg:p-8">

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN FRAME */}
      <div className="relative flex h-full w-full max-w-[1400px] gap-0 overflow-hidden md:h-[80vh] md:gap-3 md:overflow-visible">

        {/* 1. CHAT LIST (Balanced width: 280px) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-[280px] md:shrink-0 md:translate-x-0 ${
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

        {/* 2. CHAT WINDOW */}
        <div className="flex flex-1 min-w-0 h-[87vh] sm:h-[80vh] mt-6 sm:mt-0">


          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenMeetups={() => setIsMeetupOpen(true)}
          />
        </div>

        {/* 3. DESKTOP MEETUP PANEL (Compact 290px container with centered items) */}
        <aside className=" sm:h-[80vh] hidden w-[290px] shrink-0 flex-col items-center overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:flex">
          <div className="mb-3 flex w-full flex-col items-center border-b border-gray-100 pb-2.5 text-center">
            <h2 className="text-xs font-bold leading-tight text-gray-900">
              Meetups
            </h2>
            <p className="mt-0.5 text-[9px] text-gray-400 leading-none">
              Meetup proposals with {activeChat.name}
            </p>
          </div>

          <MeetupCard
            {...activeChat.meetup}
            onAccept={() => {
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === activeChatId
                    ? {
                        ...chat,
                        meetup: { ...chat.meetup, status: "confirmed" },
                      }
                    : chat
                )
              );
            }}
            onDecline={() => {
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === activeChatId
                    ? {
                        ...chat,
                        meetup: { ...chat.meetup, status: "declined" },
                      }
                    : chat
                )
              );
            }}
          />
        </aside>
      </div>

      {/* MOBILE MEETUP MODAL */}
      {isMeetupOpen && (
        <>
          <div
            onClick={() => setIsMeetupOpen(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:hidden">
            <div className="relative flex flex-col items-center max-h-[90vh] w-full max-w-[280px] overflow-y-auto rounded-3xl bg-white p-3.5 shadow-2xl">
              <div className="mb-2 flex w-full items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">Meetup Details</h3>
                <button
                  type="button"
                  onClick={() => setIsMeetupOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              <MeetupCard
                {...activeChat.meetup}
                onAccept={() => {
                  setChats((prevChats) =>
                    prevChats.map((chat) =>
                      chat.id === activeChatId
                        ? {
                            ...chat,
                            meetup: { ...chat.meetup, status: "confirmed" },
                          }
                        : chat
                    )
                  );
                  setIsMeetupOpen(false);
                }}
                onDecline={() => {
                  setChats((prevChats) =>
                    prevChats.map((chat) =>
                      chat.id === activeChatId
                        ? {
                            ...chat,
                            meetup: { ...chat.meetup, status: "declined" },
                          }
                        : chat
                    )
                  );
                  setIsMeetupOpen(false);
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatLayout;