import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import MeetupCard from "../../components/chat/MeetupCard";
import { apiGet, apiPost, apiPatch, getToken } from "../../services/api";
import { connectSocket, getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

/* ============================================================
   ChatLayout
   - Fetches accepted matches from GET /api/v1/matches/feed
   - Loads message history from GET /api/v1/matches/:matchId/messages
   - Sends messages via Socket.IO `message:send`
   - Receives messages via Socket.IO `message:new`
   - Accepts/Declines meetups via PATCH /api/v1/meetups/:id
============================================================ */

function ChatLayout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const chatFromUrl = searchParams.get("chat");

  // ── State ──────────────────────────────────────────────────
  const [chats,        setChats]        = useState([]);
  const [activeChatId, setActiveChatId] = useState(chatFromUrl || null);
  const [messages,     setMessages]     = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMsgs,  setIsLoadingMsgs]  = useState(false);
  const [isSidebarOpen,  setIsSidebarOpen]  = useState(false);
  const [isMeetupOpen,   setIsMeetupOpen]   = useState(false);
  const [meetupAction,   setMeetupAction]   = useState(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0] || null;

  // ── Load match list on mount ───────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoadingChats(true);

    apiGet("/matches/feed?pageSize=50")
      .then((data) => {
        if (cancelled) return;
        const matches = data?.data?.matches ?? [];
        // Map backend match objects to chat-list shape
        const mapped = matches.map((m) => ({
          id:          m._id,
          matchId:     m._id,
          userId:      m.user?._id ?? m._id,
          name:        m.user?.name  ?? "Unknown",
          avatarUrl:   m.user?.photoUrl ?? "",
          avatarText:  (m.user?.name ?? "?")[0].toUpperCase(),
          isOnline:    false,
          lastMessage: m.lastMessage ?? "",
          time:        m.lastMessageAt ? new Date(m.lastMessageAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
          unreadCount: 0,
          meetup:      m.meetup ?? { status: "none" },
        }));
        setChats(mapped);
        if (!activeChatId && mapped.length > 0) {
          setActiveChatId(mapped[0].id);
        }
      })
      .catch((err) => console.error("[chat] failed to load matches:", err.message))
      .finally(() => { if (!cancelled) setIsLoadingChats(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Load messages when active chat changes ─────────────────
  useEffect(() => {
    if (!activeChatId) return;
    let cancelled = false;
    setIsLoadingMsgs(true);

    apiGet(`/matches/${activeChatId}/messages`)
      .then((data) => {
        if (cancelled) return;
        setMessages(data?.data?.messages ?? []);
      })
      .catch((err) => console.error("[chat] failed to load messages:", err.message))
      .finally(() => { if (!cancelled) setIsLoadingMsgs(false); });

    return () => { cancelled = true; };
  }, [activeChatId]);

  // ── Socket.IO: connect + listen for incoming messages ──────
  useEffect(() => {
    const token = getToken();
    const socket = connectSocket(token);

    const handleNewMessage = (msg) => {
      // Only append if the message belongs to the active conversation
      if (msg.matchId === activeChatId) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update the last message preview in the chat list
      setChats((prev) =>
        prev.map((c) =>
          c.id === msg.matchId
            ? { ...c, lastMessage: msg.content, time: "Now" }
            : c
        )
      );
    };

    socket?.on("message:new", handleNewMessage);
    return () => { socket?.off("message:new", handleNewMessage); };
  }, [activeChatId]);

  // ── Send message ───────────────────────────────────────────
  const handleSendMessage = useCallback((content) => {
    if (!activeChatId || !content.trim()) return;

    const socket = getSocket();

    // Optimistic update
    const tempMsg = {
      _id:       `temp-${Date.now()}`,
      matchId:   activeChatId,
      senderId:  user?._id ?? "me",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, lastMessage: content, time: "Just now" }
          : c
      )
    );

    if (socket?.connected) {
      socket.emit("message:send", { matchId: activeChatId, content });
    } else {
      // Fallback: REST
      apiPost(`/matches/${activeChatId}/messages`, { content }).catch(console.error);
    }
  }, [activeChatId, user]);

  // ── Select chat ────────────────────────────────────────────
  const handleSelectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
    setIsSidebarOpen(false);
    setChats((prev) =>
      prev.map((c) => c.id === chatId ? { ...c, unreadCount: 0 } : c)
    );
  }, []);

  // ── Meetup actions ─────────────────────────────────────────
  const handleAcceptMeetup = async () => {
    const meetupId = activeChat?.meetup?._id;
    if (meetupId) {
      try {
        await apiPatch(`/meetups/${meetupId}`, { action: "accept" });
      } catch (err) { console.error("Accept meetup failed:", err.message); }
    }
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, meetup: { ...c.meetup, status: "confirmed" } }
          : c
      )
    );
    setMeetupAction(null);
    setIsMeetupOpen(false);
  };

  const handleDeclineMeetup = async () => {
    const meetupId = activeChat?.meetup?._id;
    if (meetupId) {
      try {
        await apiPatch(`/meetups/${meetupId}`, { action: "decline" });
      } catch (err) { console.error("Decline meetup failed:", err.message); }
    }
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? { ...c, meetup: { ...c.meetup, status: "declined" } }
          : c
      )
    );
    setMeetupAction(null);
    setIsMeetupOpen(false);
  };

  const handleCancelMeetupAction = () => setMeetupAction(null);

  // ── Loading state ──────────────────────────────────────────
  if (isLoadingChats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#2274A5]" />
      </div>
    );
  }

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

        {/* 1. CHAT LIST */}
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
        <div className="mt-6 flex h-[87vh] min-w-0 flex-1 sm:mt-0 sm:h-[80vh]">
          <ChatWindow
            chat={activeChat ? { ...activeChat, messages } : null}
            isLoadingMessages={isLoadingMsgs}
            onSendMessage={handleSendMessage}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenMeetups={() => setIsMeetupOpen(true)}
          />
        </div>

        {/* 3. DESKTOP MEETUP PANEL */}
        <aside className="hidden w-[290px] shrink-0 flex-col items-center overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:h-[80vh] md:flex">
          <div className="mb-3 flex w-full flex-col items-center border-b border-gray-100 pb-2.5 text-center">
            <h2 className="text-xs font-bold leading-tight text-gray-900">Meetups</h2>
            <p className="mt-0.5 text-[9px] leading-none text-gray-400">
              Meetup proposals with {activeChat?.name ?? "..."}
            </p>
          </div>
          <MeetupCard
            {...(activeChat?.meetup ?? { status: "none" })}
            onAccept={() => setMeetupAction("accept")}
            onDecline={() => setMeetupAction("decline")}
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
            <div className="relative flex max-h-[90vh] w-full max-w-[280px] flex-col items-center overflow-y-auto rounded-3xl bg-white p-3.5 shadow-2xl">
              <div className="mb-2 flex w-full items-center justify-between">
                <h3 className="text-xs font-bold text-gray-900">Meetup Details</h3>
                <button
                  type="button"
                  onClick={() => setIsMeetupOpen(false)}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-[10px] text-gray-500 hover:bg-gray-200"
                >✕</button>
              </div>
              <MeetupCard
                {...(activeChat?.meetup ?? { status: "none" })}
                onAccept={() => setMeetupAction("accept")}
                onDecline={() => setMeetupAction("decline")}
              />
            </div>
          </div>
        </>
      )}

      {/* MEETUP CONFIRMATION DIALOG */}
      {meetupAction && (
        <>
          <div onClick={handleCancelMeetupAction} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full ${
                  meetupAction === "accept" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                }`}
              >
                {meetupAction === "accept" ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 12 4 4L19 6" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              <h2 className="mt-4 text-base font-bold text-gray-900">
                {meetupAction === "accept" ? "Accept this meetup?" : "Decline this meetup?"}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-500">
                {meetupAction === "accept"
                  ? `Are you sure you want to accept the meetup with ${activeChat?.name}?`
                  : `Are you sure you want to decline the meetup with ${activeChat?.name}?`}
              </p>

              {activeChat?.meetup?.status === "pending" && (
                <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-800">{activeChat.meetup.date}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{activeChat.meetup.time}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{activeChat.meetup.location}</p>
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelMeetupAction}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >Cancel</button>
                <button
                  type="button"
                  onClick={meetupAction === "accept" ? handleAcceptMeetup : handleDeclineMeetup}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition ${
                    meetupAction === "accept" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {meetupAction === "accept" ? "Accept" : "Decline"}
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