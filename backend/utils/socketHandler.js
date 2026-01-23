const { Server } = require("socket.io");

const socketHandler = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true
        }
    });

    let onlineUsers = new Map();

    io.on("connection", (socket) => {
        console.log("A user connected", socket.id);

        socket.on("register", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`User registered: ${userId} with socket: ${socket.id}`);
        });

        socket.on("sendMessage", (data) => {
            const { receiverId, message } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", message);
            }
        });

        socket.on("sendFriendRequest", (data) => {
            const { receiverId, senderInfo } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("friendRequestReceived", senderInfo);
            }
        });

        socket.on("disconnect", () => {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            console.log("A user disconnected", socket.id);
        });
    });

    return io;
};

module.exports = socketHandler;
