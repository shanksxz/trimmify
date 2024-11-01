"use client"

import { Button } from "@/components/ui/button"
import { Maximize, Minimize, Play, Settings, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { Pause } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { formatTime } from "@/utils"

interface VideoControlsProps {
    isPlaying: boolean
    togglePlay: () => void
    skip: (seconds: number) => void
    isMuted: boolean
    toggleMute: () => void
    volume: number
    handleVolumeChange: (newVolume: number) => void
    currentTime: number
    duration: number
    showSettings: boolean
    setShowSettings: (show: boolean) => void
    playbackSpeed: number
    changePlaybackRate: (speed: number) => void
    isFullscreen: boolean
    toggleFullscreen: () => void
}

export default function VideoControls({
    isPlaying,
    togglePlay,
    skip,
    isMuted,
    toggleMute,
    volume,
    handleVolumeChange,
    currentTime,
    duration,
    showSettings,
    setShowSettings,
    playbackSpeed,
    changePlaybackRate,
    isFullscreen,
    toggleFullscreen,
}: VideoControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-2 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white">
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skip(-10)} className="text-white hidden sm:inline-flex">
                    <SkipBack className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => skip(10)} className="text-white hidden sm:inline-flex">
                    <SkipForward className="h-6 w-6" />
                </Button>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white">
                        {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                    </Button>
                    <Slider
                        color=""
                        value={[isMuted ? 0 : volume]}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-20 sm:w-24"
                        onValueChange={(value) => handleVolumeChange(value[0])}
                    />
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div className="relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowSettings(!showSettings)}
                        className={`text-white hover:bg-white/20 ${showSettings ? "bg-white/20" : ""}`}
                        title="Settings"
                    >
                        <Settings className="h-6 w-6" />
                    </Button>
                    {showSettings && (
                        <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg shadow-lg p-2 min-w-[160px] text-white z-50">
                            <div className="text-sm font-bold mb-2 px-2">Playback Speed</div>
                            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                                <button
                                    key={speed}
                                    className={`block w-full text-left px-4 py-1 hover:bg-white/20 rounded ${playbackSpeed === speed ? "bg-white/20" : ""
                                        }`}
                                    onClick={() => changePlaybackRate(speed)}
                                >
                                    {speed === 1 ? "Normal" : `${speed}x`}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="text-white hover:bg-white/20"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize className="h-6 w-6" /> : <Maximize className="h-6 w-6" />}
                </Button>
            </div>
        </div>
    )
}