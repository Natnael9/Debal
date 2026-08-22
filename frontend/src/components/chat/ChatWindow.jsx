import { useEffect, useRef, useState } from "react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ReportModal from "./ReportModal";
import BlockModal from "./BlockModal";
import MeetupRequestModal from "./MeetupRequestModal";

function ChatWindow({
  chat,
  currentUserId,
  isLoadingMessages = false,
  isPartnerTyping = false,
  onSendMessage,
  onTypingStart,
  onTypingStop,
  onMeetupSent,
  onOpenSidebar,
  onOpenMeetups,
  onDeleteChatHistory,
  onBlockUser,
  onUnblockUser,
}) {
  const [showActions, setShowActions] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);   
  const [showMeetupRequest, setShowMeetupRequest] = useState(false);
  const [showMeetupSuccess, setShowMeetupSuccess] = useState(false);   
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      <div className="flex flex-1 h-full min-h-[350px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-[#2274A5]">
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
            className="mt-5 rounded-xl bg-[#2274A5] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#1b5e87] md:hidden"
          >
            View Messages
          </button>
        )}
      </div>
    );
  }

  const isBlockedByMe = !!chat.isBlockedByMe;
  const isBlockedByPartner = !!chat.isBlockedByPartner;
  const isBlocked = !!chat.isBlocked || isBlockedByMe || isBlockedByPartner;

  const messagesList = chat.messages || [];
  const hasMessages = messagesList.length > 0;
  const hasPartnerReplied = hasMessages && messagesList.some((m) => {
    const sender = String(m.senderId?._id || m.senderId || m.sender || "");
    return sender !== String(currentUserId);
  });
  const isInputDisabled = isBlocked || (hasMessages && !hasPartnerReplied);
  const disabledReason = isBlockedByMe
    ? "You have blocked this candidate. Unblock to send messages."
    : isBlockedByPartner || isBlocked
    ? "You cannot message this user."
    : `Waiting for ${chat.name || 'candidate'} to reply to your request before continuing...`;

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDeleteChatHistory?.(chat.matchId || chat.id);
    } catch (err) {
      console.error("Failed to delete chat history:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="flex flex-1 h-full min-h-0 min-w-0 flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-[#2274A5] shadow-xs">
              {chat.avatarText || (chat.name ? chat.name[0].toUpperCase() : "U")}
            </div>

            {isBlocked ? (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500 shadow-xs" title="Blocked" />
            ) : chat.isOnline ? (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            ) : null}
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-xs font-bold leading-tight text-gray-800">
              {chat.name || "Chat"}
            </h1>

            <p className={`text-[10px] leading-none ${isBlocked ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
              {isBlocked ? "Blocked" : chat.isOnline ? "Online" : "Offline"}
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
                    setShowDeleteModal(true);
                  }}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-700">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M14.8 2.5c.6-.6 1.6-.6 2.2 0l1.5 1.5c.6.6.6 1.6 0 2.2l-3 3-3.7-3.7 3-3z" />
                      <path d="M9.2 6.8c.4-.4 1.2-.4 1.6 0l6.2 6.2c.4.4.4 1.2 0 1.6l-1.6 1.6-7.8-7.8 1.6-1.6z" />
                      <path d="M7.2 9.2l7.6 7.6c-.6 2.2-2 4.4-4.8 5.7-1.8.8-3.4.6-4.5.1l1.8-3.6-3.8.7c-.8-1.5-.7-3.2.1-4.8l3.6-5.7z" />
                    </svg>
                  </div>
                  <span>Clear History</span>
                </button>

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

                {isBlockedByMe ? (
                  <button
                    type="button"
                    onClick={async () => {
                      setShowActions(false);
                      try {
                        await onUnblockUser?.(chat.userId || chat.id);
                      } catch (err) {
                        console.error("Failed to unblock user:", err);
                      }
                    }}
                    className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[11px] font-medium text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span>Unblock Candidate</span>
                  </button>
                ) : (
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
                    <span>Block Candidate</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messagesList}
        currentUserId={currentUserId}
        partnerAvatarText={chat.avatarText || (chat.name ? chat.name[0].toUpperCase() : 'P')}
        isTyping={isPartnerTyping}
        isLoading={isLoadingMessages}
      />

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        onTyping={onTypingStart}
        onStopTyping={onTypingStop}
        disabled={isInputDisabled}
        disabledReason={disabledReason}
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
          onBlocked={(userId) => onBlockUser?.(userId)}
        />
      )}

      {/* Meetup Request Modal */}
      {showMeetupRequest && (
        <MeetupRequestModal
          matchId={chat.matchId || chat.id}
          user={{
            id: chat.userId || chat.id,
            name: chat.name,
          }}
          onClose={() => setShowMeetupRequest(false)}
          onSent={(newMeetup) => {
            onMeetupSent?.(newMeetup);
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

      {/* Clear Chat History Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-3">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14.8 2.5c.6-.6 1.6-.6 2.2 0l1.5 1.5c.6.6.6 1.6 0 2.2l-3 3-3.7-3.7 3-3z" />
                <path d="M9.2 6.8c.4-.4 1.2-.4 1.6 0l6.2 6.2c.4.4.4 1.2 0 1.6l-1.6 1.6-7.8-7.8 1.6-1.6z" />
                <path d="M7.2 9.2l7.6 7.6c-.6 2.2-2 4.4-4.8 5.7-1.8.8-3.4.6-4.5.1l1.8-3.6-3.8.7c-.8-1.5-.7-3.2.1-4.8l3.6-5.7z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900">Clear Chat History?</h3>
            <p className="mt-2 text-xs text-gray-500 leading-relaxed">
              This will permanently clear all messages in this conversation. This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60 shadow-2xs transition"
              >
                {isDeleting ? "Clearing..." : "Clear History"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatWindow;