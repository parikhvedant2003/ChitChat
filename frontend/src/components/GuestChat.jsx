import { useEffect, useRef, useState } from "react";
import { useGuestStore } from "../store/useGuestStore";
import { formatMessageTime } from "../lib/utils";
import FileMessage from "./FileMessage";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Paperclip, Send, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const GuestChat = () => {
  const {
    messages,
    isLoading,
    guestName,
    guestRoomUserCount,
    sendTextMessage,
    sendFile,
    clearGuest,
    fetchMessages,
  } = useGuestStore();

  const [text, setText] = useState("");
  const fileInputRef = useRef(null);
  const messageEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendTextMessage(text.trim());
    setText("");
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await sendFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <MessageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-4 border-b border-base-300 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Guest Room</h2>
          <p className="text-sm text-zinc-400">{guestRoomUserCount} guest{guestRoomUserCount !== 1 ? "s" : ""} online</p>
        </div>
        <button
          onClick={clearGuest}
          className="btn btn-sm btn-ghost gap-2"
          title="Leave room"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderName === guestName ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className="chat-header mb-1">
              <span className="text-xs font-medium">{message.senderName}</span>
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.fileUrl && (
                <FileMessage
                  fileUrl={message.fileUrl}
                  fileName={message.fileName}
                  fileType={message.fileType}
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 w-full">
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="hidden sm:flex btn btn-circle text-zinc-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip size={20} />
            </button>
          </div>
          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim()}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestChat;
