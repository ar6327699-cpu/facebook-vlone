import { ChevronDown, ChevronUp, Send, ThumbsUp, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import userStore from "@/store/userStore";
import { Input } from "@/components/ui/input";
import { formateDate } from "@/lib/utils";
import { likeComment, addCommentReply } from "@/service/post.service";
import toast from "react-hot-toast";

const PostComments = ({ post, onComment, commentInputRef }) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [localComments, setLocalComments] = useState(post?.comments || []);
  const { user } = userStore();

  React.useEffect(() => {
    setLocalComments(post?.comments || []);
  }, [post?.comments]);

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      const newComment = {
        _id: Date.now().toString(), // Temporary ID
        user: { _id: user?._id, username: user?.username, profilePicture: user?.profilePicture },
        text: commentText,
        createdAt: new Date().toISOString(),
        likes: [],
        replies: []
      };
      setLocalComments([...localComments, newComment]);
      onComment({ text: commentText });
      setCommentText("");
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await likeComment(commentId);
      // Ideally update parent state or refetch
      toast.success("Comment liked");
    } catch (error) {
      toast.error("Failed to like comment");
    }
  };

  const handleReplySubmit = async (commentId) => {
    if (replyText.trim()) {
      const newReply = {
        user: { _id: user?._id, username: user?.username, profilePicture: user?.profilePicture },
        text: replyText,
        createdAt: new Date().toISOString()
      };

      setLocalComments(localComments.map(c =>
        c._id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
      ));

      try {
        await addCommentReply(commentId, { text: replyText });
        setReplyText("");
        setActiveReplyId(null);
        toast.success("Reply added");
      } catch (error) {
        toast.error("Failed to add reply");
      }
    }
  };

  const visibleComments = showAllComments
    ? localComments
    : localComments?.slice(0, 2);

  const userPlaceholder = user?.username
    ?.split(" ")
    .map((name) => name[0])
    .join("");
  return (
    // comemts section list
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      <div className="max-h-60 overflow-y-auto pr-2">
        {visibleComments?.map((comment, index) => (
          <div key={index} className="flex items-start space-x-2 mb-2">
            <Avatar className="w-8 h-8">
              {comment?.user?.profilePicture ? (
                <AvatarImage
                  src={comment?.user?.profilePicture}
                  alt={comment?.user?.username}
                />
              ) : (
                <AvatarFallback className="dark:bg-gray-400">
                  {comment?.user?.username
                    ?.split(" ")
                    .map((name) => name[0])
                    .join(" ")}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col">
              <div className="rounded-lg p-2">
                <p className="font-bold text-sm">{comment?.user?.username}</p>
                <p className="text-sm">{comment?.text}</p>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-400 gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleLikeComment(comment._id)} className={comment.likes?.includes(user?._id) ? "text-blue-500" : ""}>
                  <ThumbsUp className="h-3 w-3 mr-1" /> Like {comment.likes?.length > 0 && comment.likes.length}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveReplyId(comment._id)}>
                  <MessageSquare className="h-3 w-3 mr-1" /> Reply
                </Button>
                <span>{formateDate(comment.createdAt)}</span>
              </div>

              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="ml-4 mt-2 space-y-2 border-l-2 border-gray-100 dark:border-gray-700 pl-4">
                  {comment.replies.map((reply, rIdx) => (
                    <div key={rIdx} className="flex items-start space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={reply.user?.profilePicture} alt={reply.user?.username} />
                        <AvatarFallback className="text-[10px]">{reply.user?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 flex-1">
                        <p className="font-bold text-xs">{reply.user?.username}</p>
                        <p className="text-xs">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeReplyId === comment._id && (
                <div className="flex items-center space-x-2 mt-2 ml-4">
                  <Input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="h-8 text-xs rounded-full"
                    autoFocus
                  />
                  <Button size="sm" onClick={() => handleReplySubmit(comment._id)}>
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
        {post?.comments?.length > 2 && (
          <p
            className="w-40 mt-2 text-blue-500 dark:text-gray-300 cursor-pointer"
            onClick={() => setShowAllComments(!showAllComments)}
          >
            {showAllComments ? (
              <>
                Show Less <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Show All Comments <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <Avatar className="w-8 h-8">
          {user?.profilePicture ? (
            <AvatarImage src={user?.profilePicture} alt={user?.username} />
          ) : (
            <AvatarFallback className="dark:bg-gray-400">{userPlaceholder}</AvatarFallback>
          )}
        </Avatar>
        <Input
          value={commentText}
          ref={commentInputRef}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
          placeholder="Write a comment..."
          className="flex-grow cursor-pointer rounded-full h-12 dark:bg-[rgb(58,59,60)] "
        />
        <Button variant="ghost" size="icon" className="hover:bg-transparent"
          onClick={handleCommentSubmit}
        >
          <Send className="h-5 w-5 text-blue-500" />
        </Button>
      </div>
    </div>
  );
};

export default PostComments;
