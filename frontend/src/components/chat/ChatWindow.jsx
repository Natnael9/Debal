import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ReportModal from "./ReportModal";
import BlockModal from "./BlockModal";
import MeetupRequestModal from "./MeetupRequestModal";

function ChatWindow({
  chat,
  isLoadingMessages = false,
  onSendMessage,
  onOpenSidebar,
  onOpenMeetups,
}) {
  const currentUserId = "current-user";
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);   
  const [showMeetupRequest, setShowMeetupRequest] = useState(false);
  const [showMeetupSuccess, setShowMeetupSuccess] = useState(false);   

  const actionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target)
      ) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Empty or Unselected Chat Fallback UI
  if (!chat) {
    return (
      <div className="flex flex-1 h-full min-h-[350px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-none border-0 bg-white p-8 text-center shadow-none md:rounded-3xl md:border md:border-gray-100 md:shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-sky-100 bg-sky-50 text-sky-600">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 8 4.03 8z" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-bold text-gray-800">No Conversation Selected</h3>
        <p className="mt-1 max-w-xs text-xs text-gray-400 leading-relaxed">
          Select a chat from your contacts list or connect with new roommate candidates to start messaging.
        </p>
        {onOpenSidebar && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="mt-5 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700 md:hidden"
          >
            View Messages
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-none border-0 bg-white shadow-none md:rounded-3xl md:border md:border-gray-100 md:shadow-sm">

      {/* Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">

        <div className="flex items-center gap-2.5">
          {/* Mobile Drawer Opener */}
          <button
            type="button"
            onClick={onOpenSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition hover:bg-gray-200 md:hidden"
            aria-label="Open chat list"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-900 shadow-xs">
              {chat.avatarText || (chat.name ? chat.name[0].toUpperCase() : "U")}
            </div>

            {chat.isOnline && (
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white bg-emerald-500" />
            )}
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-xs font-bold leading-tight text-gray-800">
              {chat.name || "Chat"}
            </h1>

            <p className="text-[10px] text-gray-400 leading-none">
              {chat.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 text-gray-400">
          {/* Three Dots Menu */}
          <div ref={actionsRef} className="relative">
            <button
              type="button"
              onClick={() => setShowActions((prev) => !prev)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                showActions
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              }`}
              aria-label="Chat actions"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 top-8 z-50 w-44 origin-top-right rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-slate-200/60 ring-1 ring-black/5 focus:outline-none">
                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    onOpenMeetups?.();
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-900 group-hover:bg-white">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5v12a2 2 0 002 2h14a2 2 0 002-2V7"
                      />
                    </svg>
                  </div>
                  <span>Show Meetups</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    setShowMeetupRequest(true);
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-white">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4v4M5 11h14M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5v12a2 2 0 002 2v0"
                      />
                    </svg>
                  </div>

                  <span>Send Meetup</span>
                </button>

                <div className="my-1 border-t border-gray-100" />

                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    setShowReportModal(true);
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-gray-600 transition hover:bg-amber-50 hover:text-amber-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-700">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <span>Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowActions(false);
                    setShowBlockModal(true);
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50/70 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-700">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                      />
                    </svg>
                  </div>
                  <span>Block User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={chat.messages || []}
        currentUserId={currentUserId}
        isTyping={isTyping}
        isLoading={isLoadingMessages}
      />

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        onTyping={() => setIsTyping(true)}
        onStopTyping={() => setIsTyping(false)}
      />

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          user={{
            id: chat.userId || chat.id,
            name: chat.name,
          }}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* Block Modal */}
      {showBlockModal && (
        <BlockModal
          user={{
            id: chat.userId || chat.id,
            name: chat.name,
          }}
          onClose={() => setShowBlockModal(false)}
        />
      )}

      {/* Meetup Request Modal */}
      {showMeetupRequest && (
        <MeetupRequestModal
          user={{
            id: chat.userId || chat.id,
            name: chat.name,
          }}
          onClose={() => setShowMeetupRequest(false)}
          onSent={() => {
            setShowMeetupSuccess(true);
            setTimeout(() => {
              setShowMeetupSuccess(false);
            }, 3000);
          }}
        />
      )}

      {/* Meetup Success Notification */}
      {showMeetupSuccess && (
        <div className="fixed right-4 top-4 z-[110] flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-emerald-950/5 backdrop-blur-xs transition sm:right-6 sm:top-6">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <div className="min-w-0 pr-1">
            <p className="text-xs font-bold leading-tight text-gray-900">
              Meetup request sent
            </p>
            <p className="mt-0.5 text-[10px] text-gray-500 leading-none">
              Your suggestion was sent successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;