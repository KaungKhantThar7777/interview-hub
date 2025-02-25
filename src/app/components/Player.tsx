import { CircleUserRound, Mic, MicOff, Video, VideoOff } from "lucide-react";
import ReactPlayer from "react-player";
import { SourceProps } from "react-player/base";

type Props = {
  url: string | MediaStream | string[] | SourceProps[] | undefined;
  playerId: string;
  muted: boolean;
  playing: boolean;
  isActive: boolean;
  className?: string;
};

const Player = (props: Props) => {
  const { url, playerId, muted, playing, isActive, className } = props;

  return (
    <div
      className={`w-full h-full overflow-hidden bg-neutral-800 rounded-2xl relative ${className}`}
    >
      <div className="w-full h-full relative">
        {playing ? (
          <ReactPlayer
            className="z-0"
            width="100%"
            height="100%"
            url={url}
            key={playerId}
            muted={muted}
            playing={playing}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-around p-6">
            <CircleUserRound className="w-24 h-24 bg-neutral-700 p-4 rounded-full text-neutral-800" />
          </div>
        )}

        <div className="absolute text-white bottom-3 left-3 p-2 rounded-full bg-neutral-700/40 flex gap-3 backdrop-blur-md">
          {isActive ? (
            muted ? (
              <MicOff className="z-10 text-neutral-400" />
            ) : (
              <Mic className="z-2" />
            )
          ) : undefined}
          {isActive ? (
            playing ? (
              <Video className="z-10" />
            ) : (
              <VideoOff className="z-2 text-neutral-400" />
            )
          ) : undefined}
        </div>
      </div>
    </div>
  );
};

export default Player;
