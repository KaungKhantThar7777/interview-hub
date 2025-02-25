import { NextApiRequest, NextApiResponse } from "next";
import { Server } from "socket.io";

type CustomResponse = NextApiResponse & { socket: { server: any } };

const SocketHandler = (req: NextApiRequest, res: CustomResponse) => {
  console.log("Called Socket API");

  if (res.socket?.server?.io) {
    console.log("socket already running");
  } else {
    const io = new Server(res.socket?.server);

    console.log({ res });

    res.socket!.server!.io = io;

    io.on("connection", (socket) => {
      console.log("server is connected");

      socket?.on("join-room", (roomId, userId) => {
        console.log(`a new user ${userId} joined room - ${roomId}`);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-connected", userId);
      });

      socket?.on("user-toggle-video", (userId, roomId) => {
        console.log("user toggle video stream");

        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-video", userId);
      });

      socket?.on("user-toggle-audio", (userId, roomId) => {
        console.log("user toggle audio stream");

        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-toggle-audio", userId);
      });

      socket?.on("user-leave", (userId, roomId) => {
        console.log("user toggle audio stream");

        socket.join(roomId);
        socket.broadcast.to(roomId).emit("user-leave", userId);
      });
    });
  }

  res.end(); // End the response
};

export default SocketHandler;
