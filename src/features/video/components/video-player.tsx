"use client";

import { useFfmpeg } from "@/utils/context";
import { useLayoutEffect, useRef, useState } from "react";
import { downloadVideo, formatTime, processVideo } from "../utils";
import VideoTrimmer from "./video-trimmer";

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
		} finally {
			setProcessing(false);
		}
	};

	return (
		<div className="grid lg:grid-cols-[1fr_400px] gap-6">
			<div className="relative rounded-lg overflow-hidden">
				<video
					ref={videoRef}
					className="w-full aspect-video"
					controls
					src={videoUrl}
				/>
			</div>
			<VideoTrimmer
				clearPreviewUrl={() => setPreviewUrl(null)}
				onProcessVideo={() => handleProcessVideo(false)}
				onPreviewVideo={() => handleProcessVideo(true)}
				duration={duration}
				setDuration={setDuration}
				processing={processing}
			/>
		</div>
	);
}
