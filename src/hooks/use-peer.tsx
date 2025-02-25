"use client";

import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { useSocket } from "@/context/Socket";

export const usePeer = (roomId: string) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [myId, setMyId] = useState("");
  const isPeerSet = useRef(false);
  const socket = useSocket()?.socket;

  useEffect(() => {
    if (isPeerSet.current || !roomId || !socket) return;

    const peer = new Peer();
    setPeer(peer);
    isPeerSet.current = true;

    peer.on("open", (id) => {
      setMyId(id);
      socket.emit("join-room", roomId, id);
    });
  }, [roomId, socket]);

  return { peer, myId };
};
