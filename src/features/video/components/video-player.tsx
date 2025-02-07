"use client";

import { useFfmpeg } from "@/utils/context";
import { useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { downloadVideo, formatTime, processVideo } from "../utils";
import VideoTrimmer from "./video-trimmer";

export const VIDEO_QUALITIES: VideoQuality[] = [
	{ label: "Original", width: -1, height: -1, bitrate: "copy" },
	{ label: "1080p", width: 1920, height: 1080, bitrate: "2M" },
	{ label: "720p", width: 1280, height: 720, bitrate: "1M" },
	{ label: "480p", width: 854, height: 480, bitrate: "800k" },
	{ label: "360p", width: 640, height: 360, bitrate: "500k" },
];

export default function VideoPlayer({
	videoUrl,
}: {
	videoUrl: string;
}) {
	const { ffmpeg, loaded } = useFfmpeg();
	const [duration, setDuration] = useState<[string, string]>([
		"00:00:00",
		"00:00:00",
	]);
	const [processing, setProcessing] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [mute, setMute] = useState(false);
	const [selectedQuality, setSelectedQuality] = useState<VideoQuality>(
		VIDEO_QUALITIES[0],
	);
	const videoRef = useRef<HTMLVideoElement>(null);

	useLayoutEffect(() => {
		if (!videoRef.current) return;
		videoRef.current.onloadedmetadata = () => {
			const totalSeconds = Math.floor(videoRef.current!.duration);
			setDuration(["00:00:00", formatTime(totalSeconds)]);
			setMute(videoRef.current!.muted);
		};
	}, [loaded]);

	if (!loaded) {
		return (
			<div className="flex h-dvh justify-center items-center">
				Loading FFmpeg...
			</div>
		);
	}

	const handleProcessVideo = async (isPreview: boolean) => {
		if (isPreview && previewUrl) {
			if (videoRef.current) {
				videoRef.current.src = previewUrl;
				videoRef.current.load();
			}
			return;
		}

		setProcessing(true);
		try {
			const processedVideoUrl = await processVideo(ffmpeg, videoUrl, {
				startTime: duration[0],
				endTime: duration[1],
				mute,
				isPreview,
				quality: selectedQuality,
			});

			if (isPreview) {
				setPreviewUrl(processedVideoUrl);
				if (videoRef.current) {
					videoRef.current.src = processedVideoUrl;
					videoRef.current.load();
				}
			} else {
				downloadVideo(processedVideoUrl, videoUrl);
			}
		} catch (error) {
			console.error("Error processing video:", error);
			toast.error("Failed to process video");
		} finally {
			setProcessing(false);
		}
	};

	const handleMuteToggle = (muted: boolean) => {
		setMute(muted);
		if (videoRef.current) {
			videoRef.current.muted = muted;
		}
	};

	return (
		<div className="grid lg:grid-cols-[1fr_400px] gap-6">
			<div className="relative rounded-lg overflow-hidden bg-zinc-900">
				<video
					ref={videoRef}
					className="w-full h-full aspect-video"
					controls
					src={videoUrl}
				/>
			</div>
			<VideoTrimmer
				muted={mute}
				onMuteToggle={handleMuteToggle}
				clearPreviewUrl={() => setPreviewUrl(null)}
				onProcessVideo={() => handleProcessVideo(false)}
				onPreviewVideo={() => handleProcessVideo(true)}
				duration={duration}
				setDuration={setDuration}
				processing={processing}
				quality={selectedQuality}
				onQualityChange={setSelectedQuality}
				qualities={VIDEO_QUALITIES}
			/>
		</div>
	);
}
