import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import ChatList from "../../components/chat/ChatList";
import ChatWindow from "../../components/chat/ChatWindow";
import MeetupCard from "../../components/chat/MeetupCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { apiGet, apiPost, apiPatch, getToken } from "../../services/api";
import { connectSocket, getSocket } from "../../services/socket";
import { useAuth } from "../../context/AuthContext";

/* ============================================================
   ChatLayout
   - Fetches user matches from GET /api/v1/matches
   - Loads message history from GET /api/v1/matches/:matchId/messages
   - Real-time Socket.IO: `chat:join_match`, `chat:send_message`, `chat:new_message`
   - Accepts/Declines meetups via PATCH /api/v1/meetups/:id
============================================================ */

function ChatLayout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const chatFromUrl = searchParams.get("chat");

  // ── State ──────────────────────────────────────────────────
  const [chats,           setChats]           = useState([]);
  const [activeChatId,    setActiveChatId]    = useState(chatFromUrl || null);
  const [messages,        setMessages]        = useState([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const [isLoadingChats,  setIsLoadingChats]  = useState(true);
  const [isLoadingMsgs,   setIsLoadingMsgs]   = useState(false);
  const [isSidebarOpen,   setIsSidebarOpen]   = useState(false);
  const [isMeetupOpen,    setIsMeetupOpen]    = useState(false);
  const [meetupAction,    setMeetupAction]    = useState(null);

  const activeChat = activeChatId
    ? chats.find((c) => c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId) || null
    : null;

  // ── Load active match list on mount ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    setIsLoadingChats(true);

    apiGet("/matches")
      .then(async (res) => {
        if (cancelled) return;
        let mapped = res?.data?.matches ?? [];

        // If chatFromUrl is specified and not present in matches list, initialize it
        if (chatFromUrl) {
          const found = mapped.some(
            (c) => c.id === chatFromUrl || c.matchId === chatFromUrl || c.userId === chatFromUrl
          );

          if (!found) {
            try {
              // Fetching messages triggers auto-creation of Match document on backend if user exists
              const msgRes = await apiGet(`/matches/${chatFromUrl}/messages`);
              const actualMatchId = msgRes?.data?.matchId || chatFromUrl;

              // Re-fetch matches to get the newly created Match object
              const refreshRes = await apiGet("/matches");
              mapped = refreshRes?.data?.matches ?? mapped;

              setActiveChatId(actualMatchId);
            } catch (e) {
              console.warn("[chat] could not initialize match for chatFromUrl:", e.message);
            }
          } else {
            const matchObj = mapped.find(
              (c) => c.id === chatFromUrl || c.matchId === chatFromUrl || c.userId === chatFromUrl
            );
            if (matchObj) {
              setActiveChatId(matchObj.id);
            }
          }
        }

        // Show conversations that have messages or if URL explicitly requests it
        const filtered = mapped.filter(
          (c) => (c.lastMessage && c.lastMessage.trim() !== "") || (chatFromUrl && (c.id === chatFromUrl || c.userId === chatFromUrl || c.matchId === chatFromUrl))
        );

        setChats(filtered.length > 0 ? filtered : mapped);
      })
      .catch((err) => console.error("[chat] failed to load matches:", err.message))
      .finally(() => { if (!cancelled) setIsLoadingChats(false); });

    return () => { cancelled = true; };
  }, [chatFromUrl]);

  // ── Load messages when active chat changes ─────────────────
  useEffect(() => {
    if (!activeChatId) return;
    let cancelled = false;
    setIsLoadingMsgs(true);
    setIsPartnerTyping(false);

    apiGet(`/matches/${activeChatId}/messages`)
      .then((data) => {
        if (cancelled) return;
        setMessages(data?.data?.messages ?? []);
        
        // Mark messages as read
        apiPost(`/matches/${activeChatId}/read`).catch(() => {});
        const socket = getSocket();
        socket?.emit("chat:mark_read", { matchId: activeChatId });
        
        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId
              ? { ...c, unreadCount: 0 }
              : c
          )
        );
      })
      .catch((err) => console.error("[chat] failed to load messages:", err.message))
      .finally(() => { if (!cancelled) setIsLoadingMsgs(false); });

    return () => { cancelled = true; };
  }, [activeChatId]);

  // ── Socket.IO: Connect + Join Match Room + Listen for Events ────────
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = connectSocket(token);

    // Join room for active chat
    if (activeChatId && socket) {
      socket.emit("chat:join_match", { matchId: activeChatId }, (res) => {
        if (res?.success && res.matchId && res.matchId !== activeChatId) {
          setActiveChatId(res.matchId);
        }
      });
    }

    // Listen for new incoming real-time messages
    const handleNewMessage = (payload) => {
      const matchId = payload?.matchId;
      const message = payload?.message || payload;
      if (!message) return;

      const senderId = message.senderId?.toString() || message.sender?.toString();
      const isForCurrentChat =
        matchId === activeChatId ||
        activeChat?.id === matchId ||
        activeChat?.matchId === matchId ||
        activeChat?.userId === matchId ||
        activeChat?.userId === senderId;

      if (isForCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          const filteredTemp = prev.filter((m) => !m._id?.toString().startsWith("temp-") || m.content !== message.content);
          return [...filteredTemp, message];
        });

        // Mark read immediately if window active
        socket.emit("chat:mark_read", { matchId: activeChatId, messageId: message._id });
        apiPost(`/matches/${activeChatId}/read`).catch(() => {});
      }

      setChats((prev) =>
        prev.map((c) => {
          const isMatch =
            c.id === matchId ||
            c.matchId === matchId ||
            c.userId === matchId ||
            c.userId === senderId;
          return isMatch
            ? {
                ...c,
                lastMessage: message.content,
                time: "Now",
                unreadCount: isForCurrentChat ? 0 : (c.unreadCount || 0) + 1,
              }
            : c;
        })
      );
    };

    const handleUserTyping = (data) => {
      const isForCurrentChat =
        data.matchId === activeChatId ||
        activeChat?.id === data.matchId ||
        activeChat?.matchId === data.matchId ||
        activeChat?.userId === data.userId;

      if (isForCurrentChat && data.userId !== user?._id?.toString()) {
        setIsPartnerTyping(!!data.typing);
      }
    };

    const handleMessageRead = (data) => {
      const isForCurrentChat =
        data.matchId === activeChatId ||
        activeChat?.id === data.matchId ||
        activeChat?.matchId === data.matchId;

      if (isForCurrentChat) {
        setMessages((prev) =>
          prev.map((m) => ({
            ...m,
            readAt: m.readAt || new Date().toISOString(),
          }))
        );
      }
    };

    const handleOnlineStatus = (data) => {
      setChats((prev) =>
        prev.map((c) =>
          c.userId === data.userId || c.user?._id === data.userId
            ? { ...c, isOnline: data.isOnline }
            : c
        )
      );
    };

    socket?.on("chat:new_message", handleNewMessage);
    socket?.on("chat:user_typing", handleUserTyping);
    socket?.on("chat:message_read", handleMessageRead);
    socket?.on("user:online_status", handleOnlineStatus);

    return () => {
      socket?.off("chat:new_message", handleNewMessage);
      socket?.off("chat:user_typing", handleUserTyping);
      socket?.off("chat:message_read", handleMessageRead);
      socket?.off("user:online_status", handleOnlineStatus);
    };
  }, [activeChatId, activeChat, user]);

  // ── Typing emitters ─────────────────────────────────────────
  const handleTypingStart = useCallback(() => {
    if (!activeChatId) return;
    const socket = getSocket();
    socket?.emit("chat:typing_start", { matchId: activeChatId });
  }, [activeChatId]);

  const handleTypingStop = useCallback(() => {
    if (!activeChatId) return;
    const socket = getSocket();
    socket?.emit("chat:typing_stop", { matchId: activeChatId });
  }, [activeChatId]);

  // ── Send message ───────────────────────────────────────────
  const handleSendMessage = useCallback((content) => {
    if (!activeChatId || !content.trim()) return;

    const trimmed = content.trim();
    const socket = getSocket();

    // Optimistic message update
    const currentUserId = user?._id || user?.id;
    const tempMsg = {
      _id:       `temp-${Date.now()}`,
      matchId:   activeChatId,
      senderId:  currentUserId,
      content:   trimmed,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setChats((prev) =>
      prev.map((c) =>
        (c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId)
          ? { ...c, lastMessage: trimmed, time: "Just now" }
          : c
      )
    );

    if (socket?.connected) {
      socket.emit("chat:send_message", { matchId: activeChatId, content: trimmed }, (res) => {
        if (res?.success && res.data?.message) {
          const realMsg = res.data.message;
          setMessages((prev) =>
            prev.map((m) => (m._id === tempMsg._id ? realMsg : m))
          );
        } else if (res?.error) {
          console.error("[chat] send message error:", res.message || res.error);
        }
      });
    } else {
      // Fallback: REST API
      apiPost(`/matches/${activeChatId}/messages`, { content: trimmed })
        .then((res) => {
          if (res?.data?.message) {
            const realMsg = res.data.message;
            setMessages((prev) =>
              prev.map((m) => (m._id === tempMsg._id ? realMsg : m))
            );
          }
        })
        .catch(console.error);
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

  // ── Meetup updates ────────────────────────────────────────
  const handleMeetupSent = useCallback((newMeetup) => {
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId || c.matchId === activeChatId || c.userId === activeChatId
          ? { ...c, meetup: newMeetup || { status: "proposed" } }
          : c
      )
    );
  }, [activeChatId]);

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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50/80 p-3 sm:p-6 lg:p-8">

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* MAIN FRAME */}
      <div className="mx-auto flex h-[calc(100vh-6.5rem)] max-w-[1400px] gap-4 overflow-hidden">

        {/* 1. CHAT LIST */}
        <div
          className={`fixed inset-y-0 left-0 z-50 h-full w-[280px] transform transition-transform duration-300 ease-in-out md:static md:z-auto md:h-full md:w-[280px] md:shrink-0 md:translate-x-0 ${
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
        <div className="flex h-full min-w-0 flex-1">
          <ChatWindow
            chat={activeChat ? { ...activeChat, messages } : null}
            currentUserId={user?._id || user?.id}
            isLoadingMessages={isLoadingMsgs}
            isPartnerTyping={isPartnerTyping}
            onSendMessage={handleSendMessage}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
            onMeetupSent={handleMeetupSent}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenMeetups={() => setIsMeetupOpen(true)}
          />
        </div>

        {/* 3. DESKTOP MEETUP PANEL */}
        <aside className="hidden w-[290px] shrink-0 flex-col items-center overflow-y-auto rounded-3xl border border-gray-100 bg-white p-4 shadow-sm h-full md:flex">
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
          <div className="fixed inset-x-4 top-1/2 z-[70] max-h-[85vh] -translate-y-1/2 overflow-y-auto rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl md:hidden">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Meetups</h2>
                <p className="text-[10px] text-gray-400">
                  Meetup proposals with {activeChat?.name ?? "..."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMeetupOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
              >
                ✕
              </button>
            </div>
            <MeetupCard
              {...(activeChat?.meetup ?? { status: "none" })}
              onAccept={() => setMeetupAction("accept")}
              onDecline={() => setMeetupAction("decline")}
            />
          </div>
        </>
      )}

      {/* CONFIRM / DECLINE MEETUP MODAL */}
      {meetupAction && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-xl text-center">
            <h3 className="text-sm font-bold text-gray-900">
              {meetupAction === "accept" ? "Accept Meetup Proposal?" : "Decline Meetup Proposal?"}
            </h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              {meetupAction === "accept"
                ? "This will confirm the meetup request and notify your match."
                : "This will decline the meetup proposal."}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelMeetupAction}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={meetupAction === "accept" ? handleAcceptMeetup : handleDeclineMeetup}
                className={`rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition ${
                  meetupAction === "accept"
                    ? "bg-[#2274A5] hover:bg-[#1b5e87]"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatLayout;