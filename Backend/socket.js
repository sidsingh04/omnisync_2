const { Server } = require("socket.io");

let io;

module.exports = {
    initSocket: (server) => {
        io = new Server(server, {
            cors: {
                origin: "*", // Allow cross-origin requests from frontend
                methods: ["GET", "POST", "PUT", "DELETE"]
            }
        });

        io.on("connection", (socket) => {
            console.log(`[Socket.io] Client connected: ${socket.id}`);

            socket.on("disconnect", () => {
                console.log(`[Socket.io] Client disconnected: ${socket.id}`);
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    }
};
