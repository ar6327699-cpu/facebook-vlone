import { create } from "zustand";
import { deleteMessage, editMessage, getConversations, getMessages, sendMessage as sendMsgApi } from "@/service/chat.service";
import io from "socket.io-client";

export const useChatStore = create((set, get) => ({
    conversations: [],
    messages: [],
    activeConversationId: null,
    receiver: null,
    socket: null,
    friends: [],
    blockedUsers: [],
    unreadMessages: [], // Stores conversation Ids with unread messages
    friendRequestCount: 0,
    loading: false,

    initSocket: (userId) => {
        if (get().socket) return;

        const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
            withCredentials: true
        });

        socket.emit("register", userId);

        socket.on("receiveMessage", (message) => {
            const { messages, activeConversationId, unreadMessages } = get();
            if (activeConversationId === message.conversationId) {
                set({ messages: [...messages, message] });
            } else {
                if (!unreadMessages.includes(message.conversationId)) {
                    set({ unreadMessages: [...unreadMessages, message.conversationId] });
                }
            }
            get().fetchConversations();
        });

        socket.on("friendRequestReceived", () => {
            set({ friendRequestCount: get().friendRequestCount + 1 });
            // Optionally trigger a toast or fetch requests if needed
        });

        socket.on("connect", () => console.log("Socket connected:", socket.id));
        socket.on("disconnect", () => console.log("Socket disconnected"));

        set({ socket });
    },

    fetchFriends: async (userId) => {
        if (!userId) return;
        set({ loading: true });
        try {
            const { getMutualFriends } = await import("@/service/user.service");
            const data = await getMutualFriends(userId);
            set({ friends: data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchBlockedUsers: async () => {
        set({ loading: true });
        try {
            const { getBlockedUsers } = await import("@/service/user.service");
            const data = await getBlockedUsers();
            set({ blockedUsers: data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchConversations: async () => {
        set({ loading: true });
        try {
            const data = await getConversations();
            set({ conversations: data.data, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    fetchMessages: async (conversationId) => {
        set({ loading: true });
        try {
            const data = await getMessages(conversationId);
            set({ messages: data.data, activeConversationId: conversationId, loading: false });
        } catch (error) {
            set({ loading: false });
        }
    },

    sendMessage: async (formData) => {
        try {
            const receiverId = formData.get("receiverId");
            const data = await sendMsgApi(formData);
            const newMessage = data.data;
            set({ messages: [...get().messages, newMessage] });
            if (get().socket) {
                get().socket.emit("sendMessage", { receiverId, message: newMessage });
            }
            get().fetchConversations();
        } catch (error) {
            console.error("Error sending message", error);
            throw error;
        }
    },

    editMessage: async (messageId, text) => {
        try {
            const res = await editMessage(messageId, text);
            set({
                messages: get().messages.map((m) => m._id === messageId ? res.data : m)
            });
        } catch (error) {
            console.error(error);
        }
    },

    deleteMessage: async (messageId) => {
        try {
            const res = await deleteMessage(messageId);
            set({
                messages: get().messages.map((m) => m._id === messageId ? res.data : m)
            });
        } catch (error) {
            console.error(error);
        }
    },

    setActiveChat: (receiver, conversationId = null) => {
        set({ receiver, activeConversationId: conversationId, messages: [] });
        // Clear unread for this chat
        if (conversationId) {
            const newUnread = get().unreadMessages.filter(id => id !== conversationId);
            set({ unreadMessages: newUnread });
            get().fetchMessages(conversationId);
        }
    },

    clearFriendRequestCount: () => {
        set({ friendRequestCount: 0 });
    },

    emitFriendRequest: (receiverId, senderInfo) => {
        const socket = get().socket;
        if (socket) {
            socket.emit("sendFriendRequest", { receiverId, senderInfo });
        }
    }
}));
