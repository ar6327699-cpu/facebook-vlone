import { blockUser, deleteUserFromRequest, followUser, getAllFriendsRequest, getAllFriendsSuggestion, getBlockedUsers, getMutualFriends, unblockUser, UnfollowUser, unfriendUser } from "@/service/user.service";
import toast from "react-hot-toast";
import { create } from "zustand";





export const userFriendStore = create((set, get) => ({
  friendRequest: [],
  friendSuggestion: [],
  mutualFriends: [],
  blockedUsers: [], // added
  loading: false,

  fetchFriendRequest: async () => {
    set({ loading: true })
    try {
      const friend = await getAllFriendsRequest();
      set({ friendRequest: friend.data, loading: false })
    } catch (error) {
      set({ error, loading: false })
    } finally {
      set({ loading: false })
    }
  },

  fetchFriendSuggestion: async () => {
    set({ loading: true })
    try {
      const friend = await getAllFriendsSuggestion();
      set({ friendSuggestion: friend.data || [], loading: false })
    } catch (error) {
      set({ error, loading: false })
    } finally {
      set({ loading: false })
    }
  },
  fetchMutualFriends: async (userId) => {
    if (!userId) return;
    set({ loading: true })
    try {
      const friend = await getMutualFriends(userId);
      set({ mutualFriends: friend || [], loading: false })
    } catch (error) {
      set({ error, loading: false })
    } finally {
      set({ loading: false })
    }
  },
  followUser: async (userId) => {
    set({ loading: true })
    try {
      await followUser(userId)
    } catch (error) {
      set({ error, loading: false })
    }
  },
  UnfollowUser: async (userId) => {
    set({ loading: true })
    try {
      await UnfollowUser(userId)
    } catch (error) {
      set({ error, loading: false })
    }
  },
  deleteUserFromRequest: async (userId) => {
    set({ loading: true })
    try {
      await deleteUserFromRequest(userId)
      toast.success("you have deleted friend successfully")
    } catch (error) {
      set({ error, loading: false })
    }
  },
  unfriendUser: async (userId) => {
    set({ loading: true })
    try {
      await unfriendUser(userId)
      toast.success("User unfriended successfully")
    } catch (error) {
      set({ error, loading: false })
    }
  },
  blockUser: async (userId) => {
    set({ loading: true })
    try {
      await blockUser(userId)
      toast.success("User blocked successfully")
    } catch (error) {
      set({ error, loading: false })
    }
  },
  unblockUser: async (userId) => {
    set({ loading: true })
    try {
      await unblockUser(userId)
      toast.success("User unblocked successfully")
      // Refresh blocked users
      const blocked = await getBlockedUsers();
      set({ blockedUsers: blocked || [], loading: false })
    } catch (error) {
      set({ error, loading: false })
    }
  },
  fetchBlockedUsers: async () => {
    set({ loading: true })
    try {
      const blocked = await getBlockedUsers();
      set({ blockedUsers: blocked || [], loading: false })
    } catch (error) {
      set({ error, loading: false })
    } finally {
      set({ loading: false })
    }
  }

}))