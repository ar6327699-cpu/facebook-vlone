"use client";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import LeftSideBar from "../components/LeftSideBar";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import { useChatStore } from "@/store/chatStore";
import userStore from "@/store/userStore";

const ChatPage = () => {
    const { initSocket, fetchConversations } = useChatStore();
    const { user } = userStore();

    useEffect(() => {
        if (user?._id) {
            initSocket(user._id);
            fetchConversations();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-[rgb(36,37,38)]">
            <Header />
            <div className="flex pt-16 h-screen">
                <LeftSideBar />
                <main className="flex-1 ml-0 md:ml-64 flex overflow-hidden">
                    <ChatList />
                    <ChatWindow />
                </main>
            </div>
        </div>
    );
};

export default ChatPage;
