"use client";
import React from "react";
import { useChatStore } from "@/store/chatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import userStore from "@/store/userStore";

const ChatList = () => {
    const { conversations, setActiveChat, activeConversationId, friends, fetchFriends, fetchConversations, initSocket, fetchBlockedUsers, blockedUsers } = useChatStore();
    const { user } = userStore();

    React.useEffect(() => {
        if (user?._id) {
            initSocket(user._id);
            fetchFriends(user._id);
            fetchBlockedUsers(); // Fetch blocked users
            fetchConversations();
        }
    }, [user, fetchFriends, fetchConversations, initSocket, fetchBlockedUsers]);

    // Filter friends who already have a conversation
    const conversationParticipants = new Set(
        conversations?.flatMap(conv => conv.participants?.map(p => p?._id) || []) || []
    );
    const availableFriends = (friends || []).filter(friend => !conversationParticipants.has(friend?._id));

    // Segregate Conversations
    const recentChats = [];
    const restrictedChats = [];

    conversations.forEach(conv => {
        const participant = conv.participants.find(p => p._id !== user?._id) || conv.participants[0];
        const isFriend = friends.some(f => f._id === participant._id);
        const isBlocked = blockedUsers?.some(b => b._id === participant._id);

        if (isFriend && !isBlocked) {
            recentChats.push({ conv, participant });
        } else {
            restrictedChats.push({ conv, participant });
        }
    });

    const renderChat = (conv, participant) => (
        <div
            key={conv._id}
            onClick={() => setActiveChat(participant, conv._id)}
            className={`p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors ${activeConversationId === conv._id ? 'bg-blue-50 dark:bg-gray-700' : ''}`}
        >
            <Avatar className="h-12 w-12 border-2 border-transparent hover:border-blue-400">
                {participant.profilePicture ? (
                    <AvatarImage src={participant.profilePicture} />
                ) : (
                    <AvatarFallback>{participant.username?.[0]}</AvatarFallback>
                )}
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold truncate">{participant.username}</p>
                    {conv.lastMessage && (
                        <span className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                    )}
                </div>
                <p className="text-xs text-gray-500 truncate">
                    {conv.lastMessage?.text || (conv.lastMessage?.imageUrl ? "📷 Image" : conv.lastMessage?.videoUrl ? "🎥 Video" : "Started a conversation")}
                </p>
            </div>
        </div>
    );

    return (
        <div className="w-80 border-r dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col h-full">
            <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold italic text-blue-600">Messenger</h2>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {recentChats.length > 0 && (
                        <>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Recent Chats</h3>
                            {recentChats.map(({ conv, participant }) => renderChat(conv, participant))}
                        </>
                    )}

                    {restrictedChats.length > 0 && (
                        <>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-2">Restricted / Others</h3>
                            {restrictedChats.map(({ conv, participant }) => renderChat(conv, participant))}
                        </>
                    )}

                    {availableFriends.length > 0 ? (
                        <>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-2">Friends</h3>
                            {availableFriends.map((friend) => (
                                <div
                                    key={friend._id}
                                    onClick={() => setActiveChat(friend)}
                                    className="p-3 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                >
                                    <Avatar className="h-12 w-12">
                                        {friend.profilePicture ? (
                                            <AvatarImage src={friend.profilePicture} />
                                        ) : (
                                            <AvatarFallback>{friend.username?.[0]}</AvatarFallback>
                                        )}
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold truncate">{friend.username}</p>
                                        <p className="text-xs text-green-500">Active connection</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : conversations.length === 0 && (
                        <div className="p-4 text-center mt-10">
                            <p className="text-sm text-gray-500 italic">No friends found yet.</p>
                            <p className="text-xs text-blue-500 mt-2">Use the search bar above to find and add friends!</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
};

export default ChatList;
