"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { DefaultEventsMap } from "@socket.io/component-emitter";

interface SocketContextType {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null;

  error: string | null;
}

// Create a context for the Socket instance
const SocketContext = createContext<SocketContextType | null>(null);

const useSocket = () => {
  return useContext(SocketContext);
};

const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket<
    DefaultEventsMap,
    DefaultEventsMap
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socketConnection = io();
    setSocket(socketConnection);
  }, []);

  socket?.on("connect_error", async (err) => {
    setError(err.message);
    console.log("Error establishing socket", err.message);

    await fetch("/api/socket");
  });

  return (
    <SocketContext.Provider value={{ socket, error }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider, useSocket };
