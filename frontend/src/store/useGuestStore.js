import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? window.location.origin : "/";

export const useGuestStore = create((set, get) => ({
  guestName: null,
  messages: [],
  isLoading: false,
  socket: null,
  guestRoomUserCount: 0,
  uploadController: null,

  loadGuestName: () => {
    const name = localStorage.getItem("guestName");
    if (name) get().setGuestName(name);
  },

  setGuestName: (name) => {
    const trimmed = name.trim().slice(0, 50);
    if (!trimmed) return;
    localStorage.setItem("guestName", trimmed);
    set({ guestName: trimmed });
    get().connectSocket();
    get().fetchMessages();
  },

  fetchMessages: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/guest/messages");
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoading: false });
    }
  },

  sendTextMessage: async (text) => {
    const { guestName } = get();
    try {
      await axiosInstance.post("/guest/send", { guestName, text });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  },

  sendFile: async (file, onProgress) => {
    const { guestName } = get();
    const controller = new AbortController();
    set({ uploadController: controller });
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("guestName", guestName);
      await axiosInstance.post("/guest/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal: controller.signal,
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
    } catch (error) {
      if (error.code === "ERR_CANCELED") {
        toast("Upload cancelled");
      } else {
        toast.error(error.response?.data?.message || "Failed to upload file");
      }
    } finally {
      set({ uploadController: null });
    }
  },

  cancelUpload: () => {
    const { uploadController } = get();
    if (uploadController) {
      uploadController.abort();
      set({ uploadController: null });
    }
  },

  connectSocket: () => {
    const { guestName, socket } = get();
    if (!guestName || socket) return;
    const newSocket = io(BASE_URL, { query: { guestName } });
    newSocket.on("newGuestMessage", (message) => {
      set({ messages: [...get().messages, message] });
    });
    newSocket.on("guestRoomUsers", (count) => {
      set({ guestRoomUserCount: count });
    });
    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },

  clearGuest: () => {
    get().cancelUpload();
    get().disconnectSocket();
    localStorage.removeItem("guestName");
    set({ guestName: null, messages: [], guestRoomUserCount: 0 });
  },
}));
