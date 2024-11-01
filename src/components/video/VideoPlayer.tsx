"use client"

import { useEffect, useRef, useState } from "react"
import VideoControls from "./VideoControls"
import VideoProgress from "./VideoProgress"

interface VideoPlayerProps {
  src: string
  onDurationChange: (duration: number) => void
  onTimeUpdate: (currentTime: number) => void
  onMuteChange: (isMuted: boolean) => void
}

export default function VideoPlayer({ src, onDurationChange, onTimeUpdate, onMuteChange }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [playBackRate, setPlayBackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      onDurationChange(video.duration)
    }
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate(video.currentTime)
    }

    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
    }
  }, [onDurationChange, onTimeUpdate])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    const newMutedState = !isMuted
    videoRef.current.muted = newMutedState
    setIsMuted(newMutedState)
    onMuteChange(newMutedState)
    if (newMutedState) {
      videoRef.current.volume = volume
    }
  }

  const toggleFullScreen = async () => {
    if (!playerRef.current) return
    try {
      if (!isFullScreen) {
        await playerRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
      setIsFullScreen(!isFullScreen)
    } catch (error) {
      console.error("Failed to toggle full screen", error)
    }
  }

  const skip = (amount: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + amount))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    onTimeUpdate(newTime)
  }

  const handleSeek = (time: number) => {
    if (!videoRef.current) return
    videoRef.current.currentTime = time
    setCurrentTime(time)
    onTimeUpdate(time)
  }

  const changePlaybackRate = (rate: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = rate
    setPlayBackRate(rate)
    setShowSettings(false)
  }

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
      onMuteChange(true)
    } else if (isMuted) {
      setIsMuted(false)
      onMuteChange(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    switch (e.key.toLowerCase()) {
      case " ":
      case "k":
        e.preventDefault()
        togglePlay()
        break
      case "f":
        e.preventDefault()
        toggleFullScreen()
        break
      case "arrowleft":
        e.preventDefault()
        skip(-10)
        break
      case "arrowright":
        e.preventDefault()
        skip(10)
        break
      case "m":
        e.preventDefault()
        toggleMute()
        break
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => {
      document.removeEventListener("keydown", handleKeyPress)
    }
  }, [duration])

  return (
    <div
      ref={playerRef}
      className="relative w-full max-w-4xl bg-black group"
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => {
        if (!showSettings) {
          setIsControlsVisible(false)
        }
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <VideoProgress onSeek={handleSeek} currentTime={currentTime} duration={duration} />
        <VideoControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          skip={skip}
          isMuted={isMuted}
          toggleMute={toggleMute}
          volume={volume}
          setShowSettings={setShowSettings}
          handleVolumeChange={handleVolumeChange}
          currentTime={currentTime}
          duration={duration}
          showSettings={showSettings}
          changePlaybackRate={changePlaybackRate}
          isFullscreen={isFullScreen}
          playbackSpeed={playBackRate}
          toggleFullscreen={toggleFullScreen}
        />
      </div>
    </div>
  )
}