"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { fetchFile } from "@ffmpeg/util"
import { useFfmpeg } from "@/utils/useFfmpeg"
import VideoTrimmer from "@/components/shared/VideoTrimmer"

export default function Page({ params }: {
  params: {
    videoid: string
  }
}) {
  const { ffmpeg, loaded } = useFfmpeg();
  const [duration, setDuration] = useState(["00:00:00", "00:00:00"]);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const totalSeconds = Math.floor(videoRef.current!.duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setDuration(["00:00:00", `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`]);
      };
    }
    console.log("Video loaded");
    console.log("Duration:", duration);
  }, [videoRef]);

  if (!loaded) {
    return <div>Loading FFmpeg...</div>
  }

  const main = async () => {

    console.log("Processing video...");
    console.log("Duration:", duration);

    setProcessing(true);
    const url = `blob:http://localhost:3000/${params.videoid}`;

    try {
      // fetching the video file
      const video = await fetchFile(url);
      await ffmpeg.writeFile("input.mp4", video);

      // args
      const args = [
        "-i", "input.mp4",
        "-ss", duration[0],
        "-to", duration[1],
        "-c", "copy",
        "-an",
        "output.mp4"
      ];

      console.log("Executing FFmpeg command:", args.join(' '));
      await ffmpeg.exec(args);

      // read the output file
      const data = await ffmpeg.readFile("output.mp4");
      console.log("Trimmed video data:", data);

      // create a download link
      const blob = new Blob([data], { type: 'video/mp4' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'trimmed_video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error processing video:", error);
    } finally {
      setProcessing(false);
    }
  }
  
  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-6 p-6">
        <div className="relative rounded-lg overflow-hidden">
        <video 
          ref={videoRef}
          className="w-full aspect-video"
          controls
          src={`blob:http://localhost:3000/${params.videoid}`}
        />
      </div>
      <VideoTrimmer
        onProcessVideo={main}
        duration={duration}
        setDuration={setDuration}
        processing={processing}
      />
    </div>
  )
}