import React, { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, MoreHorizontal, Share2, ThumbsUp, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import PostComments from "./PostComments";
import { formateDate } from "@/lib/utils";
import { usePostStore } from "@/store/usePostStore";
import userStore from "@/store/userStore";

const PostCard = ({ post, isLiked, onShare, onComment, onLike }) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const commentInputRef = useRef(null);
  const { handleDeletePost } = usePostStore();
  const currentUser = userStore((state) => state.user);
  const isOwner = currentUser?._id === post?.user?._id;

  const handleCommentClick = () => {
    setShowComments(true);
    setTimeout(() => {
      commentInputRef?.current?.focus();
    }, 0)
  }
  const userPostPlaceholder = post?.user?.username
    ?.split(" ")
    .map((name) => name[0])
    .join("");

  const generateSharedLink = () => {
    return `${window.location.origin}/posts/${post?._id}`;
  };

  const handleShare = (platform) => {
    // Post ka content + media URL (Cloudinary) directly share karo
    const postContent = post?.content || "";
    const mediaUrl = post?.mediaUrl || "";   // Cloudinary URL — publicly accessible hai
    const authorName = post?.user?.username || "Someone";

    // Share message banaao
    const shareText = [
      postContent ? `"${postContent}"` : "",
      `— ${authorName} posted on our app`,
      mediaUrl ? `\n🖼️ ${mediaUrl}` : ""
    ].filter(Boolean).join("\n");

    const encodedText = encodeURIComponent(shareText);
    const encodedMedia = encodeURIComponent(mediaUrl);

    let shareUrl;
    switch (platform) {
      case "facebook":
        // Facebook sirf registered domain URLs share karta hai, media URL share karo
        shareUrl = mediaUrl
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedMedia}&quote=${encodeURIComponent(postContent)}`
          : `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
        break;
      case "linkedin":
        shareUrl = mediaUrl
          ? `https://www.linkedin.com/shareArticle?mini=true&url=${encodedMedia}&title=${encodeURIComponent(postContent)}`
          : `https://www.linkedin.com/shareArticle?mini=true&summary=${encodedText}`;
        break;
      case "copy":
        // Copy karo content + media link
        const copyText = [postContent, mediaUrl].filter(Boolean).join("\n");
        navigator.clipboard.writeText(copyText);
        setIsShareDialogOpen(false);
        return;
      default:
        return;
    }
    window.open(shareUrl, "_blank");
    setIsShareDialogOpen(false);
  };
  return (
    <motion.div
      key={post?._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent className="p-6  dark:text-white">
          <div className="flex items-center justify-between mb-4">
            <div
              className="flex items-center space-x-3 cursor-pointer"

            >
              <Avatar>
                {post?.user?.profilePicture && post.user.profilePicture !== "" ? (
                  <AvatarImage
                    src={post?.user?.profilePicture}
                    alt={post?.user?.username}
                  />
                ) : (
                  <AvatarFallback className="dark:bg-gray-400">{userPostPlaceholder}</AvatarFallback>
                )}



              </Avatar>
              <div>
                <p className="font-semibold dark:text-white">
                  {post?.user?.username}
                </p>
                <p className="font-sm text-gray-500">
                  {formateDate(post?.createdAt)}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="dark:hover:bg-gray-500">
                  <MoreHorizontal className="dark:text-white h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwner && (
                  <DropdownMenuItem
                    className="text-red-500 cursor-pointer focus:text-red-500"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Post
                  </DropdownMenuItem>
                )}
                {!isOwner && (
                  <DropdownMenuItem className="text-gray-500">
                    Report Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Custom Delete Confirmation Dialog for Post */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            {currentUser?.username ? `${currentUser.username}, kya ap waqayi yeh post delete karna chahte hain?` : "Kya ap is post ko delete karna chahte hain?"}
                            <br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-end mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => {
                            handleDeletePost(post._id);
                            setIsDeleteDialogOpen(false);
                        }} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
          </div>
          <p className="mb-4">{post?.content}</p>
          {post?.mediaUrl && post.mediaType === "image" && (
            <img
              src={post?.mediaUrl}
              alt="post_image"
              className="w-full h-auto rounded-lg mb-4"
            />
          )}
          {post?.mediaUrl && post.mediaType === "video" && (
            <video controls className="w-full h-[500px] rounded-lg mb-4">
              <source src={post?.mediaUrl} type="video/mp4" />
              Your browser does not support the video tag
            </video>
          )}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400 hover:border-b-2 border-gray-400 cursor-pointer ">
              {post?.likeCount} likes
            </span>
            <div className="flex gap-3">
              <span
                className="text-sm text-gray-500 dark:text-gray-400 hover:border-b-2 border-gray-400 cursor-pointer "
                onClick={() => setShowComments(!showComments)}
              >
                {post?.commentCount} comments
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hover:border-b-2 border-gray-400 cursor-pointer ">
                {post?.shareCount} share
              </span>
            </div>
          </div>
          <Separator className="mb-2 dark:bg-gray-400" />
          <div className="flex justify-between mb-2">
            <Button
              variant="ghost"
              className={`flex-1 dark:hover:bg-gray-600 ${isLiked ? "text-blue-600" : ""}`}
              onClick={onLike}
            >
              <ThumbsUp className="mr-2 h-4 w-4" /> Like
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 dark:hover:bg-gray-600 `}
              onClick={handleCommentClick}
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Comment
            </Button>
            <Dialog
              open={isShareDialogOpen}
              onOpenChange={setIsShareDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex-1 dark:hover:bg-gray-500"
                  onClick={onShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share This Post</DialogTitle>
                  <DialogDescription>
                    Choose how you want to share this post
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col space-y-3 mt-2">
                  <Button
                    onClick={() => handleShare("facebook")}
                    className="bg-[#1877F2] hover:bg-[#166fe5] text-white"
                  >
                    Share on Facebook
                  </Button>
                  <Button
                    onClick={() => handleShare("twitter")}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Share on X (Twitter)
                  </Button>
                  <Button
                    onClick={() => handleShare("whatsapp")}
                    className="bg-[#25D366] hover:bg-[#1ebe5b] text-white"
                  >
                    Share on WhatsApp
                  </Button>
                  <Button
                    onClick={() => handleShare("linkedin")}
                    className="bg-[#0A66C2] hover:bg-[#084fa4] text-white"
                  >
                    Share on LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare("copy")}
                  >
                    📋 Copy Link
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Separator className="mb-2 dark:bg-gray-400" />
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <PostComments
                  post={post}
                  onComment={onComment}
                  commentInputRef={commentInputRef}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PostCard;
