import { useState } from "react";
import { cloneDeep } from "lodash";

import { useSocket } from "@/context/Socket";
import { useRouter } from "next/navigation";

type Player = {
  url: MediaStream;
  muted: boolean;
  playing: boolean;
};

const usePlayer = (myId: string, roomId: string, peer: any) => {
  const socket = useSocket()?.socket;
  const router = useRouter();

  const [players, setPlayers] = useState<Record<string, Player>>({});

  const highlightedPlayer: Record<string, Player> = {};
  const nonHighlightedPlayer = players[myId];

  Object.keys(players).forEach((key) => {
    if (key !== myId) {
      highlightedPlayer[key] = players[key];
    }
  });

  const leaveRoom = () => {
    socket?.emit("user-leave", myId, roomId);
    peer?.disconnect();
    router.push("/");
  };

  const toggleAudio = () => {
    console.log("I toggled my audio");
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if (copy[myId]) {
        copy[myId].muted = !copy[myId].muted;
      }
      return { ...copy };
    });

    if (socket) {
      socket.emit("user-toggle-audio", myId, roomId);
    } else {
      console.warn("Socket is not connected"); // Warn if socket is not available
    }
  };

  const toggleVideo = () => {
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if (copy[myId]) {
        copy[myId].playing = !copy[myId].playing; // Toggle the playing status
      }
      return { ...copy }; // Return the updated state
    });

    if (socket) {
      socket.emit("user-toggle-video", myId, roomId);
    } else {
      console.warn("Socket is not connected"); // Warn if socket is not available
    }
  };
  return {
    players,
    setPlayers,
    highlightedPlayer,
    nonHighlightedPlayer,
    toggleAudio,
    toggleVideo,
    leaveRoom,
  };
};

export default usePlayer;
