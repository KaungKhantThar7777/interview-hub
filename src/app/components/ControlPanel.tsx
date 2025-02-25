import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import React from "react";

type Props = {
  muted: boolean;
  playing: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  leaveRoom: () => void;
};

const ControlPanel = (props: Props) => {
  const { muted, playing, toggleAudio, toggleVideo, leaveRoom } = props;

  return (
    <div className="w-full h-full text-center text-white px-4 pb-4 ">
      <div className="w-fit max-w-md h-fit mx-auto gap-6 flex items-center justify-around">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full h-fit transition-all ease-in duration-300 w-fit hover:opacity-75 
                    ${
                      muted
                        ? "bg-red-200  text-rose-800"
                        : " bg-neutral-700  text-neutral-200"
                    }`}
        >
          {muted ? <MicOff className="" /> : <Mic className=" " />}
        </button>

        <button
          onClick={leaveRoom}
          className="p-4 bg-rose-600 transition-all ease-in duration-300 shadow-md shadow-rose-900 hover:opacity-75 rounded-3xl"
        >
          <PhoneOff />
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full h-fit transition-all ease-in duration-300 w-fit hover:opacity-75 
                    ${
                      playing
                        ? "bg-neutral-700  text-neutral-200"
                        : "bg-red-200  text-rose-800 "
                    }`}
        >
          {playing ? <Video className="" /> : <VideoOff className=" " />}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
