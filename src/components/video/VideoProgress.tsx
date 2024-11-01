"use client"

import { useRef, useState, useEffect } from "react"

interface VideoProgressProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
}

export default function VideoProgress({ currentTime, duration, onSeek }: VideoProgressProps) {
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleSeek = (clientX: number) => {
    if (!progressBarRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newTime = pos * duration
    onSeek(newTime)
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleSeek(e.clientX)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleSeek(e.clientX)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  return (
    <div
      ref={progressBarRef}
      className="relative w-full h-2 bg-gray-600 mb-4 cursor-pointer rounded-full"
      onMouseDown={handleMouseDown}
    >
      <div
        className="h-full bg-red-600 rounded-full"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      />
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-md transition-transform ${
          isDragging ? "scale-125" : "scale-100"
        }`}
        style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
      />
    </div>
  )
}