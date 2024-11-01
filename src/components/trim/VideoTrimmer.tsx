"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

type VideoTrimmerProps = {
  onProcessVideo: () => void | Promise<void>
  duration: string[]
  setDuration: (duration: string[]) => void
  processing: boolean
  onPreviewVideo: () => void
  clearPreviewUrl: () => void
  currentTime: number
}

export default function VideoTrimmer({
  onProcessVideo,
  duration,
  setDuration,
  processing,
  onPreviewVideo,
  clearPreviewUrl,
  currentTime,
}: VideoTrimmerProps) {
  const [error, setError] = useState<string | null>(null)

  const validateTime = (time: string): boolean => {
    const timeRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/
    return timeRegex.test(time)
  }

  const handleDurationChange = (index: number, value: string) => {
    if (validateTime(value)) {
      const newDuration = [...duration]
      newDuration[index] = value
      setDuration(newDuration)
      clearPreviewUrl()
      setError(null)
    } else {
      setError("Invalid time format. Please use HH:MM:SS")
    }
  }

  useEffect(() => {
    const formatTime = (time: number) => {
      const hours = Math.floor(time / 3600)
      const minutes = Math.floor((time % 3600) / 60)
      const seconds = Math.floor(time % 60)
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    }

    const formattedTime = formatTime(currentTime)
    setDuration([formattedTime, duration[1]])
  }, [currentTime, setDuration])

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
                value={duration[0]}
                onChange={(e) => handleDurationChange(0, e.target.value)}
              />
            </Label>
            <Label>
              End Time
              <Input
                className="mt-2 w-full"
                type="text"
                value={duration[1]}
                onChange={(e) => handleDurationChange(1, e.target.value)}
              />
            </Label>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button size="lg" onClick={onPreviewVideo} disabled={processing}>
          Preview
        </Button>
        <Button onClick={onProcessVideo} size="lg" disabled={processing || !!error}>
          Download Edited Video
        </Button>
      </div>
    </div>
  )
}