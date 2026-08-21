import { useState, useRef } from "react";

function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [message, setMessage] = useState("");
  const typingTimeout = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!value.trim()) {
      onStopTyping?.();
      return;
    }

    onTyping?.();

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      onStopTyping?.();
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSend(trimmedMessage);
    setMessage("");
    onStopTyping?.();

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
  };

  return (
    <div className="shrink-0 border-t border-gray-100 bg-white p-3 sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-slate-50/80 px-4 py-1.5 shadow-2xs transition-all focus-within:border-[#2274A5] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2274A5]/15"
      >
        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2274A5] text-white shadow-2xs transition hover:bg-[#1b5e87] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          title="Send message"
        >
          <svg className="h-4 w-4 transform translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default MessageInput;