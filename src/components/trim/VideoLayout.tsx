"use client"

import { useState } from "react"
import { fetchFile } from "@ffmpeg/util"
import VideoTrimmer from "@/components/trim/VideoTrimmer"
import { useFfmpeg } from "@/utils/context"
import VideoPlayer from "@/components/video/VideoPlayer"

export default function VideoLayout({ src }: { src: string }) {
  const { ffmpeg, loaded } = useFfmpeg()
  const [duration, setDuration] = useState(["00:00:00", "00:00:00"])
  const [processing, setProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mute, setMute] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  if (!loaded) {
    return <div>Loading FFmpeg...</div>
  }

  const handleDurationChange = (videoDuration: number) => {
    const hours = Math.floor(videoDuration / 3600)
    const minutes = Math.floor((videoDuration % 3600) / 60)
    const seconds = Math.floor(videoDuration % 60)
    setDuration([
      "00:00:00",
      `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`,
    ])
  }

  const processVideo = async (isPreview: boolean) => {
    if (isPreview && previewUrl) {
      console.log("Using existing preview")
      return
    }
    console.log(isPreview ? "Generating preview..." : "Processing video...")
    console.log("Duration:", duration)
    setProcessing(true)
    try {
      const video = await fetchFile(src)
      await ffmpeg.writeFile("input.mp4", video)
      const outputFileName = isPreview ? "preview.mp4" : "output.mp4"
      console.log("mute", mute)
      const args = [
        "-i",
        "input.mp4",
        "-ss",
        duration[0],
        "-to",
        duration[1],
        "-c",
        "copy",
        ...(mute ? ["-an"] : []),
        outputFileName,
      ]
      console.log("args", args)
      console.log(`Executing FFmpeg command for ${isPreview ? "preview" : "processing"}:`, args.join(" "))
      await ffmpeg.exec(args)
      const data = await ffmpeg.readFile(outputFileName)
      console.log(`${isPreview ? "Preview" : "Trimmed"} video data:`, data)
      const blob = new Blob([data], { type: "video/mp4" })
      const blobUrl = URL.createObjectURL(blob)
      if (isPreview) {
        setPreviewUrl(blobUrl)
      } else {
        const a = document.createElement("a")
        a.href = blobUrl
        a.download = `trimmed.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)
      }
    } catch (error) {
      console.error(`Error ${isPreview ? "generating preview" : "processing video"}:`, error)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[2fr_400px] gap-6 p-6">
      <div className="relative rounded-lg overflow-hidden">
        <VideoPlayer
          src={previewUrl || src}
          onDurationChange={handleDurationChange}
          onTimeUpdate={setCurrentTime}
          onMuteChange={setMute}
        />
      </div>
      <VideoTrimmer
        clearPreviewUrl={() => setPreviewUrl(null)}
        onProcessVideo={() => processVideo(false)}
        onPreviewVideo={() => processVideo(true)}
        duration={duration}
        setDuration={setDuration}
        processing={processing}
        currentTime={currentTime}
      />
    </div>
  )
}