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

  /*
   * Meetup confirmation action.
   *
   * null      = no confirmation prompt
   * "accept"  = asking user to confirm acceptance
   * "decline" = asking user to confirm decline
   */
  const [meetupAction, setMeetupAction] = useState(null);

  const activeChat =
    chats.find((chat) => chat.id === activeChatId) || chats[0];

  /* =====================================================
     SEND MESSAGE
  ====================================================== */
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

  /* =====================================================
     SELECT CHAT
  ====================================================== */
  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount: 0,
            }
          : chat
      )
    );
  };

  /* =====================================================
     ACCEPT MEETUP
  ====================================================== */
  const handleAcceptMeetup = () => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              meetup: {
                ...chat.meetup,
                status: "confirmed",
              },
            }
          : chat
      )
    );

    // Close confirmation prompt
    setMeetupAction(null);

    // Close mobile meetup modal
    setIsMeetupOpen(false);
  };

  /* =====================================================
     DECLINE MEETUP
  ====================================================== */
  const handleDeclineMeetup = () => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              meetup: {
                ...chat.meetup,
                status: "declined",
              },
            }
          : chat
      )
    );

    // Close confirmation prompt
    setMeetupAction(null);

    // Close mobile meetup modal
    setIsMeetupOpen(false);
  };

  /* =====================================================
     CANCEL MEETUP ACTION
  ====================================================== */
  const handleCancelMeetupAction = () => {
    setMeetupAction(null);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-14 flex h-[calc(100dvh-3.5rem)] w-full justify-center overflow-hidden bg-slate-100 p-0 sm:top-20 md:static md:top-auto md:min-h-[calc(100vh-80px)] md:h-auto md:overflow-y-auto md:p-6 lg:p-8">

      {/* =====================================================
          MOBILE SIDEBAR OVERLAY
      ====================================================== */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* =====================================================
          MAIN FRAME
      ====================================================== */}
      <div className="relative flex h-full w-full max-w-[1400px] gap-0 overflow-hidden md:h-[80vh] md:gap-3 md:overflow-visible">

        {/* =====================================================
            1. CHAT LIST
        ====================================================== */}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-[280px] md:shrink-0 md:translate-x-0 ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }`}
        >
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={handleSelectChat}
            onCloseMobile={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* =====================================================
            2. CHAT WINDOW
        ====================================================== */}
        <div className="mt-6 flex h-[87vh] min-w-0 flex-1 sm:mt-0 sm:h-[80vh]">
          <ChatWindow
            chat={activeChat}
            onSendMessage={handleSendMessage}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenMeetups={() => setIsMeetupOpen(true)}
          />
        </div>

        {/* =====================================================
            3. DESKTOP MEETUP PANEL
        ====================================================== */}
        <aside className="hidden w-[290px] shrink-0 flex-col items-center overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:h-[80vh] md:flex">

          {/* Panel Header */}
          <div className="mb-3 flex w-full flex-col items-center border-b border-gray-100 pb-2.5 text-center">
            <h2 className="text-xs font-bold leading-tight text-gray-900">
              Meetups
            </h2>

            <p className="mt-0.5 text-[9px] leading-none text-gray-400">
              Meetup proposals with {activeChat.name}
            </p>
          </div>

          {/* Meetup Card */}
          <MeetupCard
            {...activeChat.meetup}
            onAccept={() => {
              setMeetupAction("accept");
            }}
            onDecline={() => {
              setMeetupAction("decline");
            }}
          />
        </aside>
      </div>

      {/* =====================================================
          MOBILE MEETUP MODAL
      ====================================================== */}
      {isMeetupOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setIsMeetupOpen(false)}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:hidden">
            <div className="relative flex max-h-[90vh] w-full max-w-[280px] flex-col items-center overflow-y-auto rounded-3xl bg-white p-3.5 shadow-2xl">

              {/* Header */}
              <div className="mb-2 flex w-full items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">
                  Meetup Details
                </h3>

                <button
                  type="button"
                  onClick={() => setIsMeetupOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500 hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Meetup Card */}
              <MeetupCard
                {...activeChat.meetup}
                onAccept={() => {
                  setMeetupAction("accept");
                }}
                onDecline={() => {
                  setMeetupAction("decline");
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* =====================================================
          MEETUP CONFIRMATION PROMPT
      ====================================================== */}
      {meetupAction && (
        <>
          {/* Confirmation overlay */}
          <div
            onClick={handleCancelMeetupAction}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          />

          {/* Confirmation dialog */}
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">

            <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">

              {/* Icon */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  meetupAction === "accept"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {meetupAction === "accept" ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m5 12 4 4L19 6"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>

              {/* Title */}
              <h2 className="mt-4 text-base font-bold text-gray-900">
                {meetupAction === "accept"
                  ? "Accept this meetup?"
                  : "Decline this meetup?"}
              </h2>

              {/* Description */}
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {meetupAction === "accept"
                  ? `Are you sure you want to accept the meetup with ${activeChat.meetup?.proposedBy || activeChat.name}?`
                  : `Are you sure you want to decline the meetup with ${activeChat.meetup?.proposedBy || activeChat.name}?`}
              </p>

              {/* Meetup summary */}
              {activeChat.meetup?.status === "pending" && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-800">
                    {activeChat.meetup.date}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {activeChat.meetup.time}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {activeChat.meetup.location}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-5 flex gap-2">

                {/* Cancel */}
                <button
                  type="button"
                  onClick={handleCancelMeetupAction}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                {/* Confirm */}
                <button
                  type="button"
                  onClick={
                    meetupAction === "accept"
                      ? handleAcceptMeetup
                      : handleDeclineMeetup
                  }
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                    meetupAction === "accept"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {meetupAction === "accept"
                    ? "Accept"
                    : "Decline"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatLayout;