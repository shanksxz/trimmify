"use client";

import { useFfmpeg } from "@/hooks/use-ffmpeg";
import { useLayoutEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import { VIDEO_QUALITIES } from "../constants";
import { initialVideoPlayerState, videoPlayerReducer } from "../state";
import { downloadVideo, formatTime, processVideo } from "../utils";
import VideoTimeline from "./video-timeline";
import VideoTrimmer from "./video-trimmer";

export default function VideoPlayer({ videoUrl }: { videoUrl: string }) {
	const { ffmpeg, loaded } = useFfmpeg();
	const [state, dispatch] = useReducer(
		videoPlayerReducer,
		initialVideoPlayerState,
	);
	const videoRef = useRef<HTMLVideoElement>(null);

	useLayoutEffect(() => {
		if (!videoRef.current) return;
		videoRef.current.onloadedmetadata = () => {
			const totalSeconds = Math.floor(videoRef.current?.duration ?? 0);
			dispatch({
				type: "INITIALIZE_VIDEO",
				payload: {
					duration: totalSeconds,
					muted: videoRef.current?.muted ?? false,
				},
			});
		};

		videoRef.current.ontimeupdate = () => {
			if (videoRef.current) {
				dispatch({
					type: "SET_TIMES",
					payload: { currentTime: videoRef.current.currentTime },
				});
			}
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
		if (isPreview && state.previewUrl) {
			if (videoRef.current) {
				videoRef.current.src = state.previewUrl;
				videoRef.current.load();
			}
			return;
		}

		dispatch({ type: "SET_PROCESSING", payload: true });
		try {
			const processedVideoUrl = await processVideo(ffmpeg, videoUrl, {
				startTime: formatTime(state.startTime),
				endTime: formatTime(state.endTime),
				mute: state.muted,
				isPreview,
				quality: state.selectedQuality,
			});

			if (isPreview) {
				dispatch({ type: "SET_PREVIEW_URL", payload: processedVideoUrl });
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
			dispatch({ type: "SET_PROCESSING", payload: false });
		}
	};

	const handleMuteToggle = (muted: boolean) => {
		dispatch({ type: "SET_MUTED", payload: muted });
		if (videoRef.current) {
			videoRef.current.muted = muted;
		}
	};

	const handleSeek = (time: number) => {
		if (videoRef.current) {
			videoRef.current.currentTime = time;
			dispatch({ type: "SET_TIMES", payload: { currentTime: time } });
		}
	};

	return (
		<div className="flex flex-col md:flex-row gap-4 lg:gap-6 h-full">
			<div className="flex-1 md:w-[70%] space-y-4 lg:space-y-6">
				<div className="relative rounded-lg overflow-hidden bg-zinc-900">
					<video
						ref={videoRef}
						className="w-full h-full aspect-video"
						controls
						src={videoUrl}
					/>
				</div>

				<VideoTimeline
					videoUrl={videoUrl}
					duration={state.videoDuration}
					startTime={state.startTime}
					endTime={state.endTime}
					currentTime={state.currentTime}
					onStartTimeChange={(time) =>
						dispatch({ type: "SET_TIMES", payload: { startTime: time } })
					}
					onEndTimeChange={(time) =>
						dispatch({ type: "SET_TIMES", payload: { endTime: time } })
					}
					onSeek={handleSeek}
				/>
			</div>

			<div className="md:w-[30%] md:min-w-[350px] w-full">
				<VideoTrimmer
					muted={state.muted}
					onMuteToggle={handleMuteToggle}
					clearPreviewUrl={() => dispatch({ type: "CLEAR_PREVIEW" })}
					onProcessVideo={() => handleProcessVideo(false)}
					onPreviewVideo={() => handleProcessVideo(true)}
					duration={[formatTime(state.startTime), formatTime(state.endTime)]}
					setDuration={(newDuration) => {
						const parseTime = (timeStr: string) => {
							const parts = timeStr.split(":").map(Number);
							return parts.length === 3
								? parts[0] * 3600 + parts[1] * 60 + parts[2]
								: 0;
						};
						dispatch({
							type: "SET_TIMES",
							payload: {
								startTime: parseTime(newDuration[0]),
								endTime: parseTime(newDuration[1]),
							},
						});
					}}
					processing={state.processing}
					quality={state.selectedQuality}
					onQualityChange={(quality) =>
						dispatch({ type: "SET_QUALITY", payload: quality })
					}
					qualities={VIDEO_QUALITIES}
				/>
			</div>
		</div>
	);
}
