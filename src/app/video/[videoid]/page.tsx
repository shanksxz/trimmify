"use client"
import { useEffect, useRef, useState } from "react"
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        const totalSeconds = Math.floor(videoRef.current!.duration);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setDuration(["00:00:00", `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`]);
      };
    }
  }, [loaded, duration]);

  if (!loaded) {
    return <div>Loading FFmpeg...</div>
  }

  const processVideo = async (isPreview: boolean) => {
    if (isPreview && previewUrl) {
      console.log("Using existing preview");
      if (videoRef.current) {
        videoRef.current.src = previewUrl;
        videoRef.current.load();
      }
      return;
    }

    console.log(isPreview ? "Generating preview..." : "Processing video...");
    console.log("Duration:", duration);
    setProcessing(true);
    const url = `blob:${process.env.NEXT_PUBLIC_SITE_URL}/${params.videoid}`;
    try {
      const video = await fetchFile(url);
      await ffmpeg.writeFile("input.mp4", video);

      const outputFileName = isPreview ? "preview.mp4" : "output.mp4";
      const args = [
        "-i", "input.mp4",
        "-ss", duration[0],
        "-to", duration[1],
        "-c", "copy", "-an",
        outputFileName
      ];

      console.log(`Executing FFmpeg command for ${isPreview ? 'preview' : 'processing'}:`, args.join(' '));
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputFileName);
      console.log(`${isPreview ? 'Preview' : 'Trimmed'} video data:`, data);

      const blob = new Blob([data], { type: 'video/mp4' });
      const blobUrl = URL.createObjectURL(blob);

      if (isPreview) {
        setPreviewUrl(blobUrl);
        if (videoRef.current) {
          videoRef.current.src = blobUrl;
          videoRef.current.load();
        }
      } else {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'trimmed_video.mp4';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error(`Error ${isPreview ? 'generating preview' : 'processing video'}:`, error);
    } finally {
      setProcessing(false);
    }
  }

  return (
    loaded && (<div className="grid lg:grid-cols-[1fr_400px] gap-6 p-6">
      <div className="relative rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full aspect-video"
          controls
          src={`blob:${process.env.NEXT_PUBLIC_SITE_URL}/${params.videoid}`}
        />
      </div>
      <VideoTrimmer
        clearPreviewUrl={() => setPreviewUrl(null)}
        onProcessVideo={() => processVideo(false)}
        onPreviewVideo={() => processVideo(true)}
        duration={duration}
        setDuration={setDuration}
        processing={processing}
      />
    </div>)
  )
}