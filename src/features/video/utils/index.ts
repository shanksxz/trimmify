import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";
import { DEFAULT_THUMBNAIL_COUNT, DEFAULT_THUMBNAIL_SIZE } from "../constants";
import type {
	ThumbnailGenerationOptions,
	VideoProcessingOptions,
} from "../types";

export async function processVideo(
	ffmpeg: FFmpeg,
	videoUrl: string,
	options: VideoProcessingOptions,
): Promise<string> {
	try {
		const video = await fetchFile(videoUrl);
		await ffmpeg.writeFile("input.mp4", video);

		const outputFileName = options.isPreview ? "preview.mp4" : "output.mp4";
		const args = [
			"-i",
			"input.mp4",
			"-ss",
			options.startTime,
			"-to",
			options.endTime,
		];

		if (options.quality && options.quality.width !== -1) {
			args.push(
				"-vf",
				`scale=${options.quality.width}:${options.quality.height}`,
				"-b:v",
				options.quality.bitrate,
			);
		} else {
			args.push("-c:v", "copy");
		}

		if (options.mute) {
			args.push("-an");
		} else {
			args.push("-c:a", "aac");
		}

		args.push(outputFileName);

		await ffmpeg.exec(args);
		const videoData = await ffmpeg.readFile(outputFileName);
		const videoBlob = new Blob([videoData], { type: "video/mp4" });
		return URL.createObjectURL(videoBlob);
	} catch (error) {
		toast.error("Error processing video");
		console.error("Error processing video:", error);
		throw error;
	}
}

const TIME_REGEX = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;

export function validateTimeFormat(time: string): boolean {
	return TIME_REGEX.test(time);
}

export function validateTimeRange(start: string, end: string): boolean {
	const [startHours, startMinutes, startSeconds] = start.split(":").map(Number);
	const [endHours, endMinutes, endSeconds] = end.split(":").map(Number);

	const startTotal = startHours * 3600 + startMinutes * 60 + startSeconds;
	const endTotal = endHours * 3600 + endMinutes * 60 + endSeconds;

	return startTotal < endTotal;
}

export function formatTime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const remainingSeconds = Math.floor(seconds % 60);

	const pad = (num: number) => num.toString().padStart(2, "0");

	return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

export function downloadVideo(url: string, originalFileName: string) {
	const a = document.createElement("a");
	a.href = url;
	a.download = `trimmed-${originalFileName}`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

export async function generateThumbnails(
	ffmpeg: FFmpeg,
	videoUrl: string,
	options: ThumbnailGenerationOptions & { videoDuration: number },
): Promise<string[]> {
	try {
		const video = await fetchFile(videoUrl);
		await ffmpeg.writeFile("input.mp4", video);

		const {
			count = DEFAULT_THUMBNAIL_COUNT,
			width = DEFAULT_THUMBNAIL_SIZE.width,
			height = DEFAULT_THUMBNAIL_SIZE.height,
			videoDuration,
		} = options;

		// Use a much more efficient approach: generate all thumbnails in one command
		// Calculate fps to get exactly the number of thumbnails we want
		const fps = count / videoDuration;

		// Generate all thumbnails at once using fps filter
		await ffmpeg.exec([
			"-i",
			"input.mp4",
			"-vf",
			`fps=${fps},scale=${width}:${height}`,
			"-q:v",
			"2",
			"thumb_%03d.jpg",
		]);

		// Read all generated thumbnails
		const thumbnails: string[] = [];

		// First, let's see what files were actually created
		try {
			const files = await ffmpeg.listDir("/");
			console.log("Available files after thumbnail generation:", files);
		} catch (error) {
			console.warn("Could not list files:", error);
		}

		for (let i = 1; i <= count; i++) {
			try {
				const outputName = `thumb_${i.toString().padStart(3, "0")}.jpg`;
				console.log(`Attempting to read: ${outputName}`);
				const thumbnailData = await ffmpeg.readFile(outputName);
				const thumbnailBlob = new Blob([thumbnailData], {
					type: "image/jpeg",
				});
				const thumbnailUrl = URL.createObjectURL(thumbnailBlob);
				thumbnails.push(thumbnailUrl);
				console.log(`Successfully read thumbnail ${i}`);
			} catch (error) {
				console.warn(`Could not read thumbnail ${i}:`, error);
				// Continue without this thumbnail
			}
		}

		console.log(`Total thumbnails loaded: ${thumbnails.length}`);

		return thumbnails;
	} catch (error) {
		console.error("Error generating thumbnails:", error);
		toast.error("Failed to generate video thumbnails");
		throw error;
	}
}

export async function generateThumbnailAtTime(
	ffmpeg: FFmpeg,
	videoUrl: string,
	timeInSeconds: number,
	options: {
		width?: number;
		height?: number;
	} = {},
): Promise<string> {
	try {
		const video = await fetchFile(videoUrl);
		await ffmpeg.writeFile("input.mp4", video);

		const { width = 160, height = 90 } = options;
		const outputName = "preview_thumb.jpg";

		await ffmpeg.exec([
			"-i",
			"input.mp4",
			"-ss",
			timeInSeconds.toString(),
			"-vframes",
			"1",
			"-s",
			`${width}x${height}`,
			"-q:v",
			"2",
			outputName,
		]);

		const thumbnailData = await ffmpeg.readFile(outputName);
		const thumbnailBlob = new Blob([thumbnailData], { type: "image/jpeg" });
		return URL.createObjectURL(thumbnailBlob);
	} catch (error) {
		console.error("Error generating thumbnail:", error);
		throw error;
	}
}
