"use client"

import { useEffect, useState } from "react"
import { fetchFile } from "@ffmpeg/util"
import VideoTrimmer from "@/components/trim/VideoTrimmer"
import { useFfmpeg } from "@/utils/context"
import VideoPlayer from "@/components/video/VideoPlayer"

export default function VideoLayout({ src }: { src: string }) {
    const { ffmpeg, loaded } = useFfmpeg()
    const [end, setEnd] = useState(0)
    const [processing, setProcessing] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [mute, setMute] = useState(false)

    console.log("rendering VideoLayout")

    if (!loaded) {
        return <div>Loading FFmpeg...</div>
    }

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600)
        const minutes = Math.floor((time % 3600) / 60)
        const seconds = Math.floor(time % 60)
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`
    }

    const processVideo = async (start : number , end : number, isPreview: boolean) => {
        console.log("Start time : ", formatTime(start))
        console.log("End time : ", formatTime(end))
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
                formatTime(start),
                "-to",
                formatTime(end),
                "-c",
                "copy",
                ...(mute ? ["-an"] : []),
                outputFileName,
            ]
            await ffmpeg.exec(args)
            const data = await ffmpeg.readFile(outputFileName)
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
                    end = {end}
                    setEnd = {setEnd}
                    onMuteChange={setMute}
                />
            </div>
            <VideoTrimmer
                clearPreviewUrl={() => setPreviewUrl(null)}
                onProcessVideo={(start : number, end : number) => processVideo(start, end, false)}
                onPreviewVideo={(start : number, end : number) => processVideo(start, end, true)}
                end={end}
                setEnd={setEnd}
                processing={processing}
            />
        </div>
    )
}