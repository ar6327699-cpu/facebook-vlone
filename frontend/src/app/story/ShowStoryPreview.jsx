"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { X, Heart, Trash2 } from "lucide-react";
import React, { useEffect, useRef } from "react";

const ShowStoryPreview = ({
  file,
  fileType,
  onClose,
  onPost,
  username,
  avatar,
  isLoading,
  isOwner,
  hasLiked,
  likeCount,
  onDelete,
  onLike,
}) => {
  const userPlaceholder = username?.split(" ").map((name) => name[0]).join("");

  // Block any clicks for the first 500ms to prevent accidental triggers
  const blockRef = useRef(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      blockRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (blockRef.current) return;
    onDelete();
  };

  const handleLike = (e) => {
    e.stopPropagation();
    if (blockRef.current) return;
    onLike();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Modal — click inside nahi jaana chahiye to parent (close) */}
      <div
        className="relative w-full max-w-md h-[75vh] flex flex-col bg-white dark:bg-gray-800 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          className="absolute top-3 right-3 z-20 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          variant="ghost"
          size="icon"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* User Info */}
        <div className="absolute top-3 left-3 z-20 flex items-center">
          <Avatar className="w-9 h-9 mr-2">
            {avatar ? (
              <AvatarImage src={avatar} alt={username} />
            ) : (
              <AvatarFallback>{userPlaceholder}</AvatarFallback>
            )}
          </Avatar>
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {username}
          </span>
        </div>

        {/* Media */}
        <div className="flex-grow overflow-hidden rounded-lg">
          {fileType === "image" ? (
            <img
              src={file}
              alt="story_preview"
              className="w-full h-full object-contain bg-gray-100 dark:bg-gray-900"
            />
          ) : (
            <video
              src={file}
              controls
              autoPlay
              className="w-full h-full object-contain bg-gray-900"
            />
          )}
        </div>

        {/* Action Buttons — OUTSIDE overflow container, at bottom of modal */}
        {!onPost && (
          <div className="flex justify-end items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-b-lg border-t dark:border-gray-700">
            {isOwner ? (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4" />
                Delete Story
              </Button>
            ) : (
              <button
                onClick={handleLike}
                className="flex flex-col items-center gap-1 group"
              >
                <Heart
                  className={`h-7 w-7 transition-all ${
                    hasLiked
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 group-hover:text-red-400"
                  }`}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {likeCount || 0}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Share Button — new story */}
        {onPost && (
          <div className="flex justify-center py-3 bg-white dark:bg-gray-800 rounded-b-lg border-t dark:border-gray-700">
            <Button
              onClick={onPost}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8"
            >
              {isLoading ? "Saving..." : "Share Story"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowStoryPreview;
