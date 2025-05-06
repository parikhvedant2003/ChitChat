import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/message/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.on("newMessage", async (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId?._id === selectedUser?._id || // If senderId is an object
        newMessage.senderId === selectedUser?._id || // If senderId is a string
        newMessage.receiverId?._id === selectedUser?._id || // If receiverId is an object
        newMessage.receiverId === selectedUser?._id;

      if (!isMessageSentFromSelectedUser) return;
      // Check if senderId and receiverId are populated
      if (typeof newMessage.senderId === "string") {
        try {
          // Fetch sender details if not populated
          const senderRes = await axiosInstance.get(
            `/user/${newMessage.senderId}`
          );
          newMessage.senderId = senderRes.data;

          // Fetch receiver details if not populated
          const receiverRes = await axiosInstance.get(
            `/user/${newMessage.receiverId}`
          );
          newMessage.receiverId = receiverRes.data;
        } catch (error) {
          console.error("Error fetching user details for newMessage:", error);
          return;
        }
      }

      // Add the new message to the messages array
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
