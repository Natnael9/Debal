function MessageBubble({ message, isOwn }) {
  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "rounded-br-md bg-blue-900 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        }`}
      >
        <p className="text-sm">
          {message.content}
        </p>

        {message.createdAt && (
          <p
            className={`mt-1 text-xs ${
              isOwn
                ? "text-blue-100"
                : "text-gray-400"
            }`}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;