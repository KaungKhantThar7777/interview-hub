import { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";

type CustomResponse = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: IOServer;
    };
  };
};

const SocketHandler = (req: NextApiRequest, res: CustomResponse) => {
  if (res.socket?.server?.io) {
    console.log("Socket already running");
    return res.end();
  }

  const io = new IOServer(res.socket?.server, {
    // Add CORS and other configurations if needed
    path: "/api/socket",
  });
  res.socket!.server!.io = io;

  const rooms = new Map(); // Track room participants

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("join-room", (roomId, userId) => {
      // Join the room
      socket.join(roomId);

      // Track room participants
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(userId);

      console.log(`User ${userId} joined room ${roomId}`);
      console.log(
        `Room ${roomId} participants:`,
        Array.from(rooms.get(roomId))
      );

      // Notify others in the room
      socket.to(roomId).emit("user-connected", userId);
    });

    socket.on("user-toggle-video", (userId, roomId) => {
      if (rooms.get(roomId)?.has(userId)) {
        console.log(`User ${userId} toggled video in room ${roomId}`);
        // Broadcast to everyone in the room including sender
        io.in(roomId).emit("user-toggle-video", userId);
      }
    });

    socket.on("user-toggle-audio", (userId, roomId) => {
      if (rooms.get(roomId)?.has(userId)) {
        console.log(`User ${userId} toggled audio in room ${roomId}`);
        // Broadcast to everyone in the room including sender
        io.in(roomId).emit("user-toggle-audio", userId);
      }
    });

    socket.on("user-leave", (userId, roomId) => {
      if (rooms.get(roomId)?.has(userId)) {
        console.log(`User ${userId} left room ${roomId}`);
        // Remove user from room tracking
        rooms.get(roomId).delete(userId);
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
        // Notify others
        io.in(roomId).emit("user-leave", userId);
        socket.leave(roomId);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
      // Clean up rooms if needed
    });
  });

  console.log("Socket server initialized");
  res.end();
};

export default SocketHandler;
