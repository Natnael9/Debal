import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function MessageList({ messages = [], currentUserId, isTyping = false, isLoading = false }) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50/40 p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="text-[11px] font-semibold text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50/40 p-3.5 sm:p-4">
      {safeMessages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-gray-700">No messages yet</p>
          <p className="mt-0.5 text-[10px] text-gray-400">Send a greeting to start the conversation!</p>
        </div>
      ) : (
        <>
          {safeMessages.map((message, index) => (
            <MessageBubble
              key={message._id || message.id || `msg-${index}`}
              message={message}
              isOwn={message.senderId === currentUserId || message.sender === currentUserId}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </>
      )}
    </div>
  );
}

export default MessageList;