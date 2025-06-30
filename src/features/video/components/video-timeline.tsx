"use client";

import { Badge } from "@/components/ui/badge";
import { useFfmpeg } from "@/hooks/use-ffmpeg";
import { useCallback, useEffect, useRef, useState } from "react";
import type { VideoTimelineProps } from "../types";
import { formatTime, generateThumbnails } from "../utils";
import TimelineSkeleton from "./video-timeline-skeleton";

export default function VideoTimeline({
	videoUrl,
	duration,
	startTime,
	endTime,
	onStartTimeChange,
	onEndTimeChange,
	onSeek,
	currentTime,
}: VideoTimelineProps) {
	const { ffmpeg, loaded } = useFfmpeg();
	const [thumbnails, setThumbnails] = useState<string[]>([]);
	const [isGeneratingThumbnails, setIsGeneratingThumbnails] = useState(false);
	const [isDraggingStart, setIsDraggingStart] = useState(false);
	const [isDraggingEnd, setIsDraggingEnd] = useState(false);
	const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
	const [timelineWidth, setTimelineWidth] = useState(0);
	const timelineRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!loaded || !videoUrl || duration <= 0) return;

		const generateThumbs = async () => {
			setIsGeneratingThumbnails(true);
			try {
				console.log("Generating thumbnails for video duration:", duration);
				const thumbs = await generateThumbnails(ffmpeg, videoUrl, {
					count: 10,
					width: 120,
					height: 68,
					videoDuration: duration,
				});
				console.log("Generated thumbnails:", thumbs.length);
				setThumbnails(thumbs);
			} catch (error) {
				console.error("Failed to generate thumbnails:", error);
			} finally {
				setIsGeneratingThumbnails(false);
			}
		};

		generateThumbs();
	}, [ffmpeg, loaded, videoUrl, duration]);

	useEffect(() => {
		const updateTimelineWidth = () => {
			if (timelineRef.current) {
				setTimelineWidth(timelineRef.current.offsetWidth);
			}
		};

		updateTimelineWidth();
		window.addEventListener("resize", updateTimelineWidth);

		const timeoutId = setTimeout(updateTimelineWidth, 100);

		return () => {
			window.removeEventListener("resize", updateTimelineWidth);
			clearTimeout(timeoutId);
		};
	}, [thumbnails]);

	const timeToPixel = useCallback(
		(time: number) => {
			if (!timelineWidth || duration <= 0) return 0;
			return (time / duration) * timelineWidth;
		},
		[duration, timelineWidth],
	);

	const pixelToTime = useCallback(
		(pixel: number) => {
			if (!timelineWidth || duration <= 0) return 0;
			return (pixel / timelineWidth) * duration;
		},
		[duration, timelineWidth],
	);

	const handleMouseDown =
		(type: "start" | "end" | "playhead") => (e: React.MouseEvent) => {
			e.preventDefault();
			if (type === "start") setIsDraggingStart(true);
			else if (type === "end") setIsDraggingEnd(true);
			else setIsDraggingPlayhead(true);
		};

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (
				!timelineRef.current ||
				(!isDraggingStart && !isDraggingEnd && !isDraggingPlayhead)
			)
				return;

			const rect = timelineRef.current.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const time = pixelToTime(x);
			const clampedTime = Math.max(0, Math.min(duration, time));

			if (isDraggingStart) {
				const maxStartTime = endTime - 0.5;
				onStartTimeChange(Math.min(clampedTime, maxStartTime));
			} else if (isDraggingEnd) {
				const minEndTime = startTime + 0.5;
				onEndTimeChange(Math.max(clampedTime, minEndTime));
			} else if (isDraggingPlayhead) {
				onSeek(clampedTime);
			}
		},
		[
			isDraggingStart,
			isDraggingEnd,
			isDraggingPlayhead,
			pixelToTime,
			duration,
			startTime,
			endTime,
			onStartTimeChange,
			onEndTimeChange,
			onSeek,
		],
	);

	const handleMouseUp = useCallback(() => {
		setIsDraggingStart(false);
		setIsDraggingEnd(false);
		setIsDraggingPlayhead(false);
	}, []);

	useEffect(() => {
		if (isDraggingStart || isDraggingEnd || isDraggingPlayhead) {
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
			return () => {
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseup", handleMouseUp);
			};
		}
	}, [
		isDraggingStart,
		isDraggingEnd,
		isDraggingPlayhead,
		handleMouseMove,
		handleMouseUp,
	]);

	const handleTimelineClick = (e: React.MouseEvent) => {
		if (!timelineRef.current) return;
		const rect = timelineRef.current.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const time = pixelToTime(x);
		onSeek(Math.max(0, Math.min(duration, time)));
	};

	if (isGeneratingThumbnails) {
		return <TimelineSkeleton />;
	}

	return (
		<div className="w-full space-y-4">
			<div
				ref={timelineRef}
				className="relative w-full h-20 bg-muted rounded-lg overflow-hidden cursor-pointer"
				onClick={handleTimelineClick}
			>
				<div className="flex h-full">
					{thumbnails.map((thumb, index) => (
						<div
							key={index}
							className="flex-1 h-full bg-cover bg-center border-r border-border"
							style={{
								backgroundImage: `url(${thumb})`,
								minWidth: "20px",
							}}
						/>
					))}
				</div>

				{timelineWidth > 0 && (
					<>
						<div
							className="absolute top-0 h-full bg-primary/20 border-t-2 border-b-2 border-primary"
							style={{
								left: `${timeToPixel(startTime)}px`,
								width: `${timeToPixel(endTime) - timeToPixel(startTime)}px`,
							}}
						>
							<div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/10" />
						</div>

						<div
							className={`absolute top-0 w-4 h-full cursor-ew-resize transition-colors rounded-l-md border-l-2 z-20 ${
								isDraggingStart
									? "bg-primary/90 border-primary shadow-lg"
									: "bg-primary border-primary hover:bg-primary/80"
							}`}
							style={{ left: `${timeToPixel(startTime)}px` }}
							onMouseDown={handleMouseDown("start")}
						>
							<div className="w-full h-full flex items-center justify-center">
								<div className="w-0.5 h-6 bg-primary-foreground rounded-sm" />
							</div>
							<div className="absolute -top-8 left-0 text-xs text-primary font-medium whitespace-nowrap bg-background px-1 rounded border">
								{formatTime(startTime)}
							</div>
						</div>

						<div
							className={`absolute top-0 w-4 h-full cursor-ew-resize transition-colors rounded-r-md border-r-2 z-20 ${
								isDraggingEnd
									? "bg-primary/90 border-primary shadow-lg"
									: "bg-primary border-primary hover:bg-primary/80"
							}`}
							style={{ left: `${Math.max(0, timeToPixel(endTime) - 16)}px` }}
							onMouseDown={handleMouseDown("end")}
						>
							<div className="w-full h-full flex items-center justify-center">
								<div className="w-0.5 h-6 bg-primary-foreground rounded-sm" />
							</div>
							<div className="absolute -top-8 right-0 text-xs text-primary font-medium whitespace-nowrap bg-background px-1 rounded border">
								{formatTime(endTime)}
							</div>
						</div>

						<div
							className="absolute top-0 w-0.5 h-full bg-destructive cursor-ew-resize z-10"
							style={{ left: `${timeToPixel(currentTime)}px` }}
							onMouseDown={handleMouseDown("playhead")}
						>
							<div className="absolute -top-3 -left-2 w-4 h-4 bg-destructive rounded-full cursor-ew-resize shadow-lg border-2 border-background" />
							<div className="absolute -top-8 -left-6 text-xs text-destructive font-medium whitespace-nowrap bg-background px-1 rounded border">
								{formatTime(currentTime)}
							</div>
						</div>

						<div className="absolute bottom-0 left-0 right-0 h-4 bg-background/50">
							{Array.from({ length: 11 }, (_, i) => {
								const time = (duration / 10) * i;
								return (
									<div
										key={i}
										className="absolute text-xs text-foreground"
										style={{ left: `${timeToPixel(time)}px` }}
									>
										{formatTime(time)}
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>

			<div className="flex flex-wrap justify-between items-center gap-2">
				<Badge variant="outline" className="text-xs">
					Start: {formatTime(startTime)}
				</Badge>
				<Badge variant="secondary" className="text-xs">
					Current: {formatTime(currentTime)}
				</Badge>
				<Badge variant="outline" className="text-xs">
					End: {formatTime(endTime)}
				</Badge>
			</div>
		</div>
	);
}
