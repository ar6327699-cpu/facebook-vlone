"use client";
import React, { useEffect, useState } from "react";
import LeftSideBar from "../components/LeftSideBar";
import { FriendCardSkeleton, NoFriendsMessage } from "@/lib/Skeleten";
import FriendRequest from "./FriendRequest";
import FriendsSuggestion from "./FriendsSuggestion";
import { userFriendStore } from "@/store/userFriendsStore";
import userStore from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";


const Page = () => {
  const { followUser, loading, UnfollowUser, fetchFriendRequest, fetchFriendSuggestion, deleteUserFromRequest, fetchMutualFriends, friendRequest, friendSuggestion, mutualFriends, unfriendUser, blockUser, unblockUser, blockedUsers, fetchBlockedUsers } = userFriendStore()

  const { user } = userStore();

  useEffect(() => {
    fetchFriendRequest();
    fetchFriendSuggestion();
    fetchBlockedUsers(); // fetch blocked users
    if (user?._id) {
      fetchMutualFriends(user._id);
    }
  }, [user?._id, fetchFriendRequest, fetchFriendSuggestion, fetchMutualFriends, fetchBlockedUsers]);

  const handleAction = async (action, userId) => {
    if (action === "confirm") {
      toast.success("friend added successfully")
      await followUser(userId);
      fetchFriendRequest()
      fetchFriendSuggestion()
    } else if (action === "delete") {
      await UnfollowUser(userId);
      fetchFriendRequest()
      fetchFriendSuggestion()
    } else if (action === "unfriend") {
      await unfriendUser(userId);
      fetchFriendSuggestion()
      if (user?._id) fetchMutualFriends(user._id);
    } else if (action === "block") {
      await blockUser(userId);
      fetchFriendRequest()
      fetchFriendSuggestion()
      fetchBlockedUsers() // refresh blocked
      if (user?._id) fetchMutualFriends(user._id);
    } else if (action === "unblock") {
      await unblockUser(userId);
      fetchFriendSuggestion() // they might show up in suggestions now
    }
  }


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[rgb(36,37,38)] ">
      <LeftSideBar />
      <main className="ml-0 md:ml-64 mt-16 p-6">
        <h1 className="text-2xl font-bold mb-6">Friends Requests</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6  ">
          {loading ? (
            <FriendCardSkeleton />
          ) : friendRequest.length === 0 ? (
            <NoFriendsMessage
              text="No Friend Requests"
              description="Looks like you are all caught up! Why not explore and connect with new people?"
            />
          ) : (
            friendRequest?.map((friend) => <FriendRequest key={friend._id} friend={friend} loading={loading} onAction={handleAction} />)
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6">People you may know</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6  ">
          {loading ? (
            <FriendCardSkeleton />
          ) : friendSuggestion.length === 0 ? (
            <NoFriendsMessage
              text="No Friend Suggestion"
              description="Looks like you are all caught up! Why not explore and connect with new people?"
            />
          ) : (
            friendSuggestion?.map((friend) => (
              <FriendsSuggestion key={friend._id} friend={friend} loading={loading} onAction={handleAction} />
            ))
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6 mt-10">All Friends</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ">
          {loading ? (
            <FriendCardSkeleton />
          ) : mutualFriends.length === 0 ? (
            <NoFriendsMessage
              text="No Friends Yet"
              description="Start connecting with people to see them here!"
            />
          ) : (
            mutualFriends?.map((friend) => (
              <div key={friend._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarImage src={friend.profilePicture} alt={friend.username} />
                  <AvatarFallback>{friend.username?.[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-2">{friend.username}</h3>
                <div className="flex gap-2 w-full mt-auto">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAction("unfriend", friend._id)}>Unfriend</Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleAction("block", friend._id)}>Block</Button>
                </div>
              </div>
            ))
          )}
        </div>

        <h1 className="text-2xl font-bold mb-6 mt-10 text-red-600">Blocked Users</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            <FriendCardSkeleton />
          ) : blockedUsers.length === 0 ? (
            <NoFriendsMessage
              text="No Blocked Users"
              description="You haven't blocked anyone yet."
            />
          ) : (
            blockedUsers?.map((friend) => (
              <div key={friend._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center">
                <Avatar className="w-20 h-20 mb-4 opacity-50">
                  <AvatarImage src={friend.profilePicture} alt={friend.username} />
                  <AvatarFallback>{friend.username?.[0]}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-2">{friend.username}</h3>
                <div className="flex gap-2 w-full mt-auto">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleAction("unblock", friend._id)}>Unblock</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Page;
