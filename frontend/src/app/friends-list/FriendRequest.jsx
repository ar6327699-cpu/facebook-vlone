import { AnimatePresence } from "framer-motion";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

const FriendRequest = ({ friend, onAction }) => {
  const userPlaceholder = friend?.username
    ?.split(" ")
    .map((name) => name[0])
    .join("");
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white mb-4 dark:bg-gray-800 p-4 shadow rounded-lg"
      >
        <Avatar className="h-32 w-32 rounded mx-auto mb-4">
          {friend?.profilePicture ? (
            <AvatarImage src={friend?.profilePicture} alt={friend?.username} />
          ) : (
            <AvatarFallback className="dark:bg-gray-400">
              {userPlaceholder}
            </AvatarFallback>
          )}
        </Avatar>
        <h3 className="text-lg font-semibold text-center mb-4 ">
          {friend?.username}
        </h3>

        <div className="flex flex-col justify-between">
          <button
            onClick={() => onAction("confirm", friend._id)}
            className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Confirm
          </button>
          <button
            onClick={() => onAction("delete", friend._id)}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition mt-2"
          >
            Delete
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onAction("block", friend._id)}
            className="flex-1 text-xs text-red-500 hover:underline"
          >
            Block User
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FriendRequest;
