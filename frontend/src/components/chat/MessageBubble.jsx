function MessageBubble({ message, isOwn }) {
  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex items-end gap-2.5 ${
        isOwn ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          isOwn ? "bg-blue-900 text-white" : "bg-blue-100 text-blue-900"
        }`}
      >
        {isOwn ? "Me" : "A"}
      </div>

      {/* Bubble + Metadata */}
      <div
        className={`flex max-w-md flex-col ${
          isOwn ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? "rounded-2xl rounded-tr-xs bg-blue-600 text-white"
              : "rounded-2xl rounded-tl-xs border border-gray-100 bg-white text-gray-800"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp & Status */}
        <div className="mt-1 flex items-center gap-1 px-1 text-[11px] text-gray-400">
          {!isOwn && <span className="font-medium text-gray-500">Abebe •</span>}
          <span>{formattedTime}</span>
          {isOwn && (
            <span className="text-blue-600" title="Delivered">
              ✓✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;