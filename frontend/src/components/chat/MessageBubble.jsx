function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold shadow-xs ${
          isOwn
            ? "bg-blue-900 text-white"
            : "border border-blue-200 bg-blue-100 text-blue-900"
        }`}
      >
        {isOwn ? "Me" : "A"}
      </div>

      <div className={`flex max-w-[70%] flex-col ${isOwn ? "items-end" : "items-start"}`}>
        <div
          className={`px-3 py-1.5 text-[11px] leading-relaxed shadow-xs ${
            isOwn
              ? "rounded-2xl rounded-br-xs bg-blue-900 text-white"
              : "rounded-2xl rounded-bl-xs border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {message.content}
        </div>

        <div className="mt-0.5 flex items-center gap-1 px-1">
          <span className="text-[9px] text-gray-400">{message.createdAt}</span>
          {isOwn && (
            <svg className="h-2.5 w-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;