import { useEffect, useRef, useState } from "react";
import { useGuestStore } from "../store/useGuestStore";
import { formatMessageTime } from "../lib/utils";
import FileMessage from "./FileMessage";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { Paperclip, Send, LogOut, X } from "lucide-react";

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const GuestChat = () => {
  const {
    messages,
    isLoading,
    guestName,
    guestRoomUserCount,
    sendTextMessage,
    sendFile,
    cancelUpload,
    clearGuest,
    fetchMessages,
  } = useGuestStore();

  const [text, setText] = useState("");
  const [uploadState, setUploadState] = useState(null); // { name, size, progress }
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
    setUploadState({ name: file.name, size: file.size, progress: 0 });
    await sendFile(file, (pct) =>
      setUploadState((prev) => prev && { ...prev, progress: pct })
    );
    setUploadState(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCancel = () => {
    cancelUpload();
    setUploadState(null);
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
          <p className="text-sm text-zinc-400">
            {guestRoomUserCount} guest{guestRoomUserCount !== 1 ? "s" : ""} online
          </p>
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

      {uploadState && (
        <div className="px-4 pb-3 pt-1 border-t border-base-300">
          <div className="flex items-center justify-between text-sm mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="size-4 shrink-0 text-zinc-400" />
              <span className="truncate text-zinc-300">{uploadState.name}</span>
              <span className="text-zinc-500 shrink-0">{formatBytes(uploadState.size)}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="text-primary font-medium">{uploadState.progress}%</span>
              <button
                onClick={handleCancel}
                className="btn btn-xs btn-ghost btn-circle text-error"
                title="Cancel upload"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-200"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

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
              disabled={!!uploadState}
              title={uploadState ? "Upload in progress" : "Attach file"}
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
