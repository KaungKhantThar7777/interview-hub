import { useEffect, useRef, useState } from "react";

export const useMediaStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const isStreamSet = useRef(false);

  useEffect(() => {
    if (isStreamSet.current) return;

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        setStream(stream);
        isStreamSet.current = true;
      });
  }, []);

  return { stream };
};
