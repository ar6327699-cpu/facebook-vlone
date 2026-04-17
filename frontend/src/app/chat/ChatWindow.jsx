"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Video, Users, MessageCircle, X, ImagePlus } from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";
import { Edit2, Trash2, Check, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import userStore from "@/store/userStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const ChatWindow = () => {
    const { messages, receiver, sendMessage, activeConversationId, editMessage, deleteMessage, friends, blockedUsers } = useChatStore();
    const [inputText, setInputText] = useState("");
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const scrollRef = useRef(null);
    const fileInputRef = useRef(null);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const currentUser = userStore((state) => state.user);

    // --- Refactored Block Logic ---
    const [isBlockedByThem, setIsBlockedByThem] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            if (!receiver?._id) return;
            try {
                // If we can't fetch their profile, we are likely blocked
                const { fetchUserProfile } = await import("@/service/user.service");
                await fetchUserProfile(receiver._id);
                setIsBlockedByThem(false);
            } catch (error) {
                if (error?.response?.status === 403 || error?.message?.includes("blocked")) {
                    setIsBlockedByThem(true);
                }
            }
        };
        checkAccess();
    }, [receiver]);

    const handleAddFriend = async () => {
        try {
            const { followUser } = await import("@/service/user.service");
            await followUser(receiver._id);

            // Emit socket event
            const senderInfo = userStore.getState().user;
            useChatStore.getState().emitFriendRequest(receiver._id, senderInfo);

            toast.success("Friend request sent!");

            // Refresh friends list
            if (senderInfo?._id) {
                useChatStore.getState().fetchFriends(senderInfo._id);
            }
        } catch (error) {
            if (error?.response?.status === 403 || error?.message?.includes("blocked")) {
                setIsBlockedByThem(true);
                toast.error("You are blocked by this user.");
            } else {
                toast.error(error?.message || "Failed to add friend.");
            }
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSend = () => {
        if ((inputText.trim() || file) && receiver) {
            const formData = new FormData();
            formData.append("receiverId", receiver._id);
            if (inputText.trim()) formData.append("text", inputText);
            if (file) formData.append("file", file);

            sendMessage(formData).then(() => {
                setInputText("");
                setFile(null);
                setPreview(null);
            }).catch(async (err) => {
                if (err?.response?.status === 403 || err?.message?.includes("blocked") || err?.message?.includes("not friends")) {
                    // Immediate UI update attempt
                    try {
                        const { fetchUserProfile } = await import("@/service/user.service");
                        // Check if we can still fetch profile (implies not blocked, maybe just unfriended)
                        await fetchUserProfile(receiver._id);

                        // If success, refresh friends to show "Add Friend"
                        // Use userStore to get the correct current user ID
                        const currentUser = userStore.getState().user;
                        if (currentUser?._id) {
                            await useChatStore.getState().fetchFriends(currentUser._id);
                        }
                    } catch (profileError) {
                        // If fetching profile fails with 403, we are blocked
                        if (profileError?.response?.status === 403 || profileError?.message?.includes("blocked")) {
                            setIsBlockedByThem(true);
                        }
                    }
                }
                toast.error(err?.message || "Failed to send message. You might be blocked or not friends.");
            });
        }
    };

    const handleEdit = (msg) => {
        const diff = differenceInMinutes(new Date(), new Date(msg.createdAt));
        if (diff > 5) {
            toast.error("You can only edit messages within 5 minutes.");
            return;
        }
        setEditingMessageId(msg._id);
        setEditingText(msg.text);
    };

    const submitEdit = async () => {
        if (editingText.trim()) {
            await editMessage(editingMessageId, editingText);
            setEditingMessageId(null);
            setEditingText("");
        }
    };

    const handleDeleteClick = (msg) => {
        setMessageToDelete(msg);
    };

    const confirmDelete = async () => {
        if (messageToDelete) {
            await deleteMessage(messageToDelete._id);
            setMessageToDelete(null);
        }
    };

    if (!receiver) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-[rgb(24,25,26)]">
                <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm max-w-sm">
                    <MessageCircle className="h-16 w-16 text-blue-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold mb-2">Messenger</h3>
                    <p className="text-gray-500">Pick a friend from the left to start a conversation.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full">
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 z-10">
                <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                        {receiver.profilePicture ? (
                            <AvatarImage src={receiver.profilePicture} />
                        ) : (
                            <AvatarFallback>{receiver.username?.[0]}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <h3 className="font-bold leading-none">{receiver.username}</h3>
                        <p className="text-xs text-green-500 font-medium">Active now</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="text-blue-500"><Video className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" className="text-blue-500"><Users className="h-5 w-5" /></Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[rgb(24,25,26)]" ref={scrollRef}>
                {messages?.map((msg, idx) => {
                    const isMe = msg?.sender !== receiver?._id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] group`}>
                                <div className={`p-3 rounded-2xl relative ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'}`}>
                                    {editingMessageId === msg._id ? (
                                        <div className="flex flex-col gap-2 min-w-[200px]">
                                            <Input
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                className="bg-white text-black h-8 text-sm"
                                            />
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingMessageId(null)} className="h-6 w-6 p-0 text-red-100 hover:text-red-500"><XCircle className="h-4 w-4" /></Button>
                                                <Button size="sm" variant="ghost" onClick={submitEdit} className="h-6 w-6 p-0 text-green-100 hover:text-green-500"><Check className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {msg.text && <p className="mb-2 whitespace-pre-wrap">{msg.text} {msg.isEdited && <span className="text-[8px] opacity-70 italic">(edited)</span>}</p>}
                                            {msg.imageUrl && (
                                                <img src={msg.imageUrl} alt="attached" className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity" />
                                            )}
                                            {msg.videoUrl && (
                                                <video controls className="rounded-lg max-w-full h-auto">
                                                    <source src={msg.videoUrl} />
                                                </video>
                                            )}
                                        </>
                                    )}

                                    {isMe && !msg.isDeleted && (
                                        <div className="absolute top-0 -left-12 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                            {differenceInMinutes(new Date(), new Date(msg.createdAt)) <= 5 && (
                                                <button onClick={() => handleEdit(msg)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-500"><Edit2 className="h-3 w-3" /></button>
                                            )}
                                            <button onClick={() => handleDeleteClick(msg)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-red-500"><Trash2 className="h-3 w-3" /></button>
                                        </div>
                                    )}
                                </div>
                                <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview */}
            {preview && (
                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center space-x-4 relative">
                    <div className="relative h-20 w-20">
                        {file?.type?.startsWith('video') ? (
                            <video className="h-20 w-20 object-cover rounded-md" src={preview} />
                        ) : (
                            <img className="h-20 w-20 object-cover rounded-md" src={preview} alt="preview" />
                        )}
                        <button
                            onClick={() => { setFile(null); setPreview(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 italic">Ready to send media...</p>
                </div>
            )}

            {/* Input Area or Restricted Message */}
            {(() => {
                // Check if blocked by ME
                const isBlockedByMe = blockedUsers?.some(user => user._id === receiver._id);

                // Check if friends
                const isFriend = friends?.some(friend => friend._id === receiver._id);

                if (isBlockedByMe) {
                    return (
                        <div className="p-4 border-t dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center">
                            <p className="text-red-500 font-medium">You have blocked this user.</p>
                            <p className="text-xs text-gray-500 mt-1">Unblock them to send messages.</p>
                        </div>
                    );
                }

                if (isBlockedByThem) {
                    return (
                        <div className="p-4 border-t dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-center">
                            <p className="text-red-500 font-medium">You have been blocked by this user.</p>
                            <p className="text-xs text-gray-500 mt-1">You cannot message this person.</p>
                        </div>
                    );
                }

                if (!isFriend) {
                    return (
                        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-3">
                            <p className="text-gray-600 dark:text-gray-400 font-medium">You can't text this person because you are not friends.</p>
                            <Button
                                onClick={handleAddFriend}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6"
                            >
                                Add Friend
                            </Button>
                        </div>
                    );
                }

                // Default Input Area
                return (
                    <div className="p-4 border-t dark:border-gray-700 flex items-center space-x-2 bg-white dark:bg-gray-800">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/*"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <ImagePlus className="h-5 w-5" />
                        </Button>
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Aa"
                            className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full h-10 px-4 focus-visible:ring-1 focus-visible:ring-blue-500"
                        />
                        <Button
                            onClick={handleSend}
                            disabled={!inputText.trim() && !file}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-10 w-10 p-0 flex items-center justify-center transition-all duration-200 active:scale-90"
                        >
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                );
            })()}

            {/* Custom Delete Confirmation Dialog */}
            <Dialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Message</DialogTitle>
                        <DialogDescription>
                            {currentUser?.username ? `${currentUser.username}, are you sure you want to delete this message?` : "Are you sure you want to delete this message?"}
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setMessageToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatWindow;
