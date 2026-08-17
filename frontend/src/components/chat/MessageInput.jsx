import { useState } from "react";

function MessageInput({ onSend, onTyping, onStopTyping }) {
  const [message, setMessage] = useState("");


  const handleChange = (e) => {
  const value = e.target.value;

        setMessage(value);

        if (value.trim()) {
          onTyping?.();
        } else {
          onStopTyping?.();
        }
      };
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSend(trimmedMessage);
    setMessage("");
    onStopTyping?.();
  };

  return (
    <div className="bg-transparent p-0 sm:mb-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
      >
        <button
          type="button"
          className="text-gray-400 transition hover:text-gray-600"
          title="Attach file"
        >
          📎
        </button>

        <input
          type="text"
          value={message}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 bg-transparent px-2 py-1.5 text-sm text-gray-800 placeholder-gray-400 outline-none"
        />

        <button
          type="button"
          className="text-gray-400 transition hover:text-gray-600"
          title="Voice message"
        >
          🎙️
        </button>

        <button
          type="submit"
          disabled={!message.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

export default MessageInput;