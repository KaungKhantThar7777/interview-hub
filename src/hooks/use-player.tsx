import { useState, useEffect } from "react";
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

  console.log("usePlayer players:", players);

  const playersCopy = cloneDeep(players);

  const nonHighlightedPlayer = playersCopy[myId];

  delete playersCopy[myId];

  const highlightedPlayer = playersCopy;

  const toggleAudio = () => {
    if (!socket || !myId) return;

    // Update local state first
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if (copy[myId]) {
        copy[myId].muted = !copy[myId].muted;
      }
      return copy;
    });

    // Emit event
    socket.emit("user-toggle-audio", myId, roomId);
  };

  const toggleVideo = () => {
    if (!socket || !myId) return;

    // Update local state first
    setPlayers((prev) => {
      const copy = cloneDeep(prev);
      if (copy[myId]) {
        copy[myId].playing = !copy[myId].playing;
      }
      return copy;
    });

    // Emit event
    socket.emit("user-toggle-video", myId, roomId);
  };

  // Listen for remote toggle events
  useEffect(() => {
    if (!socket || !setPlayers) return;

    const handleRemoteToggleAudio = (userId: string) => {
      console.log("Remote audio toggle for:", userId);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          copy[userId].muted = !copy[userId].muted;
        }
        return copy;
      });
    };

    const handleRemoteToggleVideo = (userId: string) => {
      console.log("Remote video toggle for:", userId);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          copy[userId].playing = !copy[userId].playing;
        }
        return copy;
      });
    };

    socket.on("user-toggle-audio", handleRemoteToggleAudio);
    socket.on("user-toggle-video", handleRemoteToggleVideo);

    return () => {
      socket.off("user-toggle-audio", handleRemoteToggleAudio);
      socket.off("user-toggle-video", handleRemoteToggleVideo);
    };
  }, [socket, setPlayers]);

  const leaveRoom = () => {
    if (socket) {
      socket.emit("user-leave", myId, roomId);
    }
    peer?.disconnect();
    router.push("/");
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
