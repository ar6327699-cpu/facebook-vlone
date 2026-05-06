import {
  createPost,
  getAllPosts,
  getAllStory,
  getAllUserPosts,
  likePost,
  sharePost,
  createStory,
  commentsPost,
  deletePost,
  deleteStory,
  likeStory
} from "@/service/post.service";
import toast from "react-hot-toast";
import { create } from "zustand";

export const usePostStore = create((set) => ({
  posts: [],
  userPosts: [],
  story: [],
  loading: false,
  error: null,

  //fetchPost
  fetchPost: async () => {
    set({ loading: true });
    try {
      const posts = await getAllPosts();
      set({ posts, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  //fetch user posts
  fetchUserPost: async (userId) => {
    set({ loading: true });
    try {
      const userPosts = await getAllUserPosts(userId);
      set({ userPosts, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  //fetch all story
  fetchStoryPost: async () => {
    set({ loading: true });
    try {
      const story = await getAllStory();
      set({ story, loading: false });
    } catch (error) {
      set({ error, loading: false });
    }
  },

  //create a new post
  handleCreatePost: async (postData) => {
    set({ loading: true });
    try {
      const newPost = await createPost(postData);
      set((state) => ({
        posts: [newPost, ...state.posts],
        loading: false,
      }));
      toast.success("Post created successfully");
    } catch (error) {
      set({ error, loading: false });
      toast.error("failed to create a post");
    }
  },

  //create a new story
  handleCreateStory: async (storyData) => {
    set({ loading: true });
    try {
      const newStory = await createStory(storyData);
      set((state) => ({
        story: [newStory, ...state.story],
        loading: false,
      }));
      toast.success("Story created successfully");
    } catch (error) {
      set({ error, loading: false });
      toast.error("failed to create a story");
    }
  },

  // Handle like post with optimistic update
  handleLikePost: async (postId) => {
    const storedUser = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const currentUserId = storedUser?.state?.user?._id;

    set((state) => {
      const updatePosts = (posts) => posts.map((post) => {
        if (post._id === postId) {
          const likes = post.likes || [];
          const isLiked = currentUserId ? likes.includes(currentUserId) : false;

          let newLikes;
          if (isLiked) {
            newLikes = likes.filter(id => id !== currentUserId);
          } else {
            newLikes = [...likes, currentUserId].filter(Boolean);
          }

          return {
            ...post,
            likes: newLikes,
            likeCount: isLiked ? Math.max(0, post.likeCount - 1) : post.likeCount + 1
          };
        }
        return post;
      });

      return {
        posts: updatePosts(state.posts),
        userPosts: updatePosts(state.userPosts)
      };
    });

    try {
      await likePost(postId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like");
    }
  },

  handleCommentPost: async (postId, text) => {
    set({ loading: true });
    try {
      const newComments = await commentsPost(postId, { text });
      const newCommentData = {
        _id: newComments._id || Math.random().toString(),
        ...newComments
      };

      const updatePosts = (posts) => posts.map((post) =>
        post?._id === postId
          ? {
            ...post,
            comments: [...(post.comments || []), newCommentData],
            commentCount: (post.commentCount || 0) + 1
          }
          : post
      );

      set((state) => ({
        posts: updatePosts(state.posts),
        userPosts: updatePosts(state.userPosts),
        loading: false
      }));
      toast.success("Comments added successfully");
    } catch (error) {
      set({ error, loading: false });
      toast.error("failed to add comments");
    }
  },

  handleSharePost: async (postId) => {
    set({ loading: true });
    try {
      await sharePost(postId);

      const updatePosts = (posts) => posts.map((post) =>
        post?._id === postId
          ? { ...post, shareCount: (post.shareCount || 0) + 1 }
          : post
      );

      set((state) => ({
        posts: updatePosts(state.posts),
        userPosts: updatePosts(state.userPosts),
        loading: false
      }));

      toast.success("post share successfully");
    } catch (error) {
      set({ error, loading: false });
      toast.error('failed to share this post');
    }
  },

  // post delete — UI se bhi hatao turant
  handleDeletePost: async (postId) => {
    try {
      await deletePost(postId);
      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
        userPosts: state.userPosts.filter((post) => post._id !== postId),
      }));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    }
  },

  // story delete
  handleDeleteStory: async (storyId) => {
    try {
      await deleteStory(storyId);
      set((state) => ({
        story: state.story.filter((s) => s._id !== storyId),
      }));
      toast.success("Story deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete story");
    }
  },

  // story like (optimistic update)
  handleLikeStory: async (storyId) => {
    const storedUser = JSON.parse(localStorage.getItem("user-storage") || "{}");
    const currentUserId = storedUser?.state?.user?._id;

    set((state) => {
      const updateStories = (stories) => stories.map((s) => {
        if (s._id === storyId) {
          const likes = s.likes || [];
          const isLiked = currentUserId ? likes.includes(currentUserId) : false;

          let newLikes;
          if (isLiked) {
            newLikes = likes.filter(id => id !== currentUserId);
          } else {
            newLikes = [...likes, currentUserId].filter(Boolean);
          }

          return {
            ...s,
            likes: newLikes,
            likeCount: isLiked ? Math.max(0, (s.likeCount || 0) - 1) : (s.likeCount || 0) + 1
          };
        }
        return s;
      });

      return {
        story: updateStories(state.story)
      };
    });

    try {
      await likeStory(storyId);
    } catch (error) {
      console.error(error);
      toast.error("Failed to react to story");
    }
  },
}));
