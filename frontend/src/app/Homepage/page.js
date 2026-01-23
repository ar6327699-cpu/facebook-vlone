"use client"
import React, { useEffect, useState } from "react";
import LeftSideBar from "../components/LeftSideBar";
import RightSideBar from "../components/RightSideBar";
import StorySection from "@/app/story/StorySection";
import NewPostForm from "../posts/NewPostForm";
import PostCard from "../posts/PostCard";
import { usePostStore } from "@/store/usePostStore";
import toast from "react-hot-toast";

const HomePage = () => {
  const [isPostFormOpen, setIsPostFormOpen] = useState(false);
  const { posts, fetchPost, handleLikePost, handleCommentPost, handleSharePost } = usePostStore();
  const storedUser = JSON.parse(localStorage.getItem("user-storage") || "{}");

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  useEffect(() => {
    const saveLikes = localStorage.getItem('likePosts');
    if (saveLikes) {
      setLikePosts(new Set(JSON.parse(saveLikes)));
    }
  }, []);


  const handleLike = async (postId) => {
    try {
      await handleLikePost(postId);
    } catch (error) {
      console.error(error);
      toast.error('failed to like or unlike the post')
    }
  }


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex flex-1 pt-16">
        <LeftSideBar />
        <div className="flex-1 px-4 py-6 md:ml-64 lg:mr-64 lg:max-w-2xl xl:max-w-3xl mx-auto">
          <div className="lg:ml-2 xl:ml-28">
            <StorySection />
            <NewPostForm

              isPostFormOpen={isPostFormOpen}
              setIsPostFormOpen={setIsPostFormOpen}
            />
            <div className="mt-6 space-y-6 mb-4">
              {posts?.map((post) => (
                <PostCard key={post._id}
                  post={post}
                  isLiked={post.likes?.includes(storedUser?.state?.user?._id)}
                  onLike={() => handleLike(post?._id)}
                  onComment={async (comment) => {
                    await handleCommentPost(post?._id, comment.text);
                  }}
                  onShare={async () => {
                    await handleSharePost(post?._id)
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-64 xl:w-80 fixed right-0 top-16 bottom-0 overflow-y-auto p-4">
          <RightSideBar />
        </div>
      </main>
    </div>
  );
};

export default HomePage;
