"use client";

import { useSocket } from "@/context/Socket";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

const Room = () => {
  const socket = useSocket()?.socket;

  const params = useParams<{ roomId: string }>();

  useEffect(() => {
    socket?.emit("join-room", params?.roomId, "kkt");
  }, [socket]);

  return <div>Room</div>;
};

export default Room;
