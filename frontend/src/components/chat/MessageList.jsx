import MessageBubble from "./MessageBubble";

function MessageList({ messages, currentUserId }) {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-900">
            💬
          </div>
          <p className="mt-2 text-sm font-medium text-gray-700">
            No messages yet
          </p>
          <p className="text-xs text-gray-400">
            Start the conversation with Abebe below.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))
      )}
    </div>
  );
}

export default MessageList;