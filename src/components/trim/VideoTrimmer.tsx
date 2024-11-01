"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { formatTime } from "@/utils"
import { toast } from "sonner"

type VideoTrimmerProps = {
  end: number
  setEnd: (end: number) => void
  onProcessVideo: (start: number, end: number, isPreview: boolean) => void
  processing: boolean
  onPreviewVideo: (start: number, end: number, isPreview: boolean) => void
  clearPreviewUrl: () => void
}

export default function VideoTrimmer({
  onProcessVideo,
  end,
  setEnd,
  processing,
  onPreviewVideo,
  clearPreviewUrl,
}: VideoTrimmerProps) {
  const [localDuration, setLocalDuration] = useState(formatTime(end))
  const [localCurrentTime, setLocalCurrentTime] = useState(formatTime(0))

  useEffect(() => {
    console.log("Setting local duration")
    console.log("End time : ", end)
    setLocalDuration(formatTime(end))
    setLocalCurrentTime(formatTime(0))
  }, [end])

  const parseTimeToSeconds = (value: string): number => {
    const time = value.split(":").map(Number)
    if (time.length !== 3 || time.some(isNaN)) {
      throw new Error("Invalid time format. Use HH:MM:SS.")
    }
    return time[0] * 3600 + time[1] * 60 + time[2]
  }

  const validateTimes = (): { startTime: number, endTime: number } | null => {
    try {
      const startTime = parseTimeToSeconds(localCurrentTime)
      const endTime = parseTimeToSeconds(localDuration)

      if (startTime < 0) {
        toast.error("Start time cannot be negative.")
        return null
      }

      if (endTime > end) {
        toast.error(`End time cannot exceed video duration of ${formatTime(end)}`)
        return null
      }

      if (startTime >= endTime) {
        toast.error("Start time must be before end time.")
        return null
      }

      return { startTime, endTime }
    } catch (err) {
      toast.error("Invalid time format. Use HH:MM:SS.")
      return null
    }
  }

  const handlePreview = () => {
    const validatedTimes = validateTimes();
    clearPreviewUrl();
    if (validatedTimes) {
      const start = parseTimeToSeconds(localCurrentTime) || 0
      const ee = parseTimeToSeconds(localDuration) || end
      onPreviewVideo(start, ee, true)
    }
  }

  const handleProcessVideo = () => {
    const validatedTimes = validateTimes()
    const start = parseTimeToSeconds(localCurrentTime) || 0 
    const ee = parseTimeToSeconds(localDuration) || end
    if (validatedTimes) {
      onProcessVideo(start, ee, false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trim Video</CardTitle>
          <CardDescription>Adjust the start and end times of the video.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Label>
              Start Time
              <Input
                className="mt-2 w-full"
                type="text"
                value={localCurrentTime}
                onChange={(e) => setLocalCurrentTime(e.target.value)}
                placeholder="HH:MM:SS"
              />
            </Label>
            <Label>
              End Time
              <Input
                className="mt-2 w-full"
                type="text"
                value={localDuration}
                onChange={(e) => setLocalDuration(e.target.value)}
                placeholder="HH:MM:SS"
              />
            </Label>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          size="lg"
          onClick={handlePreview}
          disabled={processing}
        >
          Preview
        </Button>
        <Button
          onClick={handleProcessVideo}
          size="lg"
          disabled={processing}
        >
          Download Edited Video
        </Button>
      </div>
    </div>
  )
}