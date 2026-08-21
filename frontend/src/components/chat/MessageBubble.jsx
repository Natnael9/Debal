function MessageBubble({ message, isOwn, partnerAvatarText = "P" }) {
  const content = message?.content || message?.text || "";
  const time = message?.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const isRead = !!message?.readAt;

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold shadow-xs ${
          isOwn
            ? "bg-[#2274A5] text-white"
            : "border border-blue-200 bg-blue-100 text-[#2274A5]"
        }`}
      >
        {isOwn ? "Me" : partnerAvatarText}
      </div>

      <div className={`flex max-w-[70%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
            isOwn
              ? "rounded-2xl rounded-br-xs bg-[#2274A5] text-white"
              : "rounded-2xl rounded-bl-xs border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {content}
        </div>

        <div className="mt-0.5 flex items-center gap-1 px-1">
          {time && <span className="text-[9px] text-gray-400">{time}</span>}
          {isOwn && (
            isRead ? (
              <svg className="h-3 w-3 text-[#2274A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7M11 13l4 4L23 7" />
              </svg>
            ) : (
              <svg className="h-2.5 w-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;