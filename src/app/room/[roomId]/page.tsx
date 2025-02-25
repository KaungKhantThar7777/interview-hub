"use client";

import ControlPanel from "@/app/components/ControlPanel";
import CopyId from "@/app/components/CopyId";
import Player from "@/app/components/Player";
import { useSocket } from "@/context/Socket";
import { useMediaStream } from "@/hooks/use-media-stream";
import { usePeer } from "@/hooks/use-peer";
import usePlayer from "@/hooks/use-player";
import { cloneDeep } from "lodash";
import { useParams, useSearchParams } from "next/navigation";
import { MediaConnection } from "peerjs";
import React, { useEffect, useState } from "react";

const Room = () => {
  const socket = useSocket()?.socket;

  const params = useParams<{ roomId: string }>();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "";

  const { peer, myId } = usePeer(roomId);
  const { stream } = useMediaStream();
  const [users, setUsers] = useState<Record<string, MediaConnection>>({});
  const {
    players,
    setPlayers,
    toggleAudio,
    toggleVideo,
    leaveRoom,
    highlightedPlayer,
    nonHighlightedPlayer,
  } = usePlayer(myId, roomId, peer);

  useEffect(() => {
    // Set up a listener for user connections
    console.log({ socket, peer, stream, roomId });
    if (!socket || !peer || !stream || !roomId) return;

    // Add your own stream first
    setPlayers((prev) => ({
      ...prev,
      [myId]: {
        url: stream,
        muted: true, // Mute your own audio to prevent feedback
        playing: true,
      },
    }));

    const handleUserConnected = (newUser: string) => {
      console.log(`new user ${newUser} joined the room - ${roomId}`);

      const call = peer.call(newUser, stream);

      call.on("stream", (incomingStream: MediaStream) => {
        console.log(`Incoming stream from ${newUser}`);

        setPlayers((prev) => ({
          ...prev,
          [newUser]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [newUser]: call,
        }));
      });
    };

    socket?.on("user-connected", handleUserConnected);

    return () => {
      socket?.off("user-connected", handleUserConnected);
    };
  }, [socket, peer, stream, roomId, myId, setPlayers]);

  useEffect(() => {
    if (!peer || !stream || !setPlayers) return;
    console.log({ peer, stream, setPlayers });

    peer.on("call", (call: MediaConnection) => {
      const { peer: callerId } = call;
      call.answer(stream);

      call.on("stream", (incomingStream: MediaStream) => {
        console.log(`Incoming stream from ${callerId}`);
        setPlayers((prev) => ({
          ...prev,
          [callerId]: {
            url: incomingStream,
            muted: false,
            playing: true,
          },
        }));

        setUsers((prev) => ({
          ...prev,
          [callerId]: call,
        }));
      });
    });
  }, [peer, stream, setPlayers]);

  useEffect(() => {
    if (!socket || !setPlayers) return;

    const handleToggleAudio = (userId: string) => {
      console.log(`user with id ${userId} toggled audio`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          copy[userId].muted = !copy[userId].muted;
        }
        return { ...copy };
      });
    };

    const handleToggleVideo = (userId: string) => {
      console.log(`user with id ${userId} toggled video`);
      setPlayers((prev) => {
        const copy = cloneDeep(prev);
        if (copy[userId]) {
          copy[userId].playing = !copy[userId].playing;
        }
        return { ...copy };
      });
    };

    const handleLeaveRoom = (userId: string) => {
      console.log(`User with ${userId} is leaving the room`);
      users[userId]?.close();
      const playersCopy = cloneDeep(players);
      delete playersCopy[userId];
      setPlayers(playersCopy);
    };

    // Listen for toggle and leave events
    socket.on("user-toggle-audio", handleToggleAudio);
    socket.on("user-toggle-video", handleToggleVideo);
    socket.on("user-leave", handleLeaveRoom);

    // Clean up event listeners on unmount
    return () => {
      socket.off("user-toggle-video", handleToggleVideo);
      socket.off("user-toggle-audio", handleToggleAudio);
      socket.off("user-leave", handleLeaveRoom);
    };
  }, [socket, setPlayers, users, players]);

  const newMemberJoined =
    highlightedPlayer && Object.keys(highlightedPlayer).length > 0;

  return (
    <div className="w-full h-screen bg-neutral-950 ">
      <div className="flex h-[90vh]">
        {highlightedPlayer &&
          Object.keys(highlightedPlayer).map((playerId) => {
            const { url, muted, playing } = highlightedPlayer[playerId];
            return (
              <div
                key={playerId}
                className="w-full p-4 transition-all duration-1000 ease-in-out"
              >
                <Player
                  url={url}
                  playerId={playerId}
                  key={playerId}
                  muted={muted}
                  playing={playing}
                  isActive
                />
              </div>
            );
          })}
        <div
          className={` transition-all p-4 duration-1000 ease-in-out ${
            newMemberJoined
              ? "w-1/2 xs:w-1/4 sm:w-1/3 md:w-1/4 lg:w-1/5 h-fit absolute top-5 right-5 md:top-10 md:right-10 hover:scale-110 duration-500"
              : "w-full "
          }`}
        >
          {nonHighlightedPlayer && (
            <Player
              className={`shadow-xl ${
                newMemberJoined &&
                " hover:border-[3px] border-blue-500 transition-all duration-500 ease-in-out"
              }`}
              url={nonHighlightedPlayer.url}
              muted={nonHighlightedPlayer.muted}
              playerId={"1"}
              key={1}
              playing={nonHighlightedPlayer.playing}
              isActive
            />
          )}
        </div>
      </div>
      <div className="h-[10vh] w-full ">
        <CopyId roomId={roomId} />
        <ControlPanel
          muted={nonHighlightedPlayer?.muted}
          playing={nonHighlightedPlayer?.playing}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          leaveRoom={leaveRoom}
        />
      </div>
    </div>
  );
};

export default Room;
