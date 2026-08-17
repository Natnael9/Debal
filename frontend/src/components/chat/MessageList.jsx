import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

function MessageList({ messages, currentUserId, isTyping = false,}) {
  
  return (
    <div className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50/40 p-3.5 sm:p-4">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-[11px] text-gray-400">No messages yet. Say hello!</p>
        </div>
      ) : (

        <>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}

        {isTyping && <TypingIndicator />}
        </>
      )}
       
    </div>
  );
}

export default MessageList;