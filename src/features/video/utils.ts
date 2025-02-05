import type { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";

export async function processVideo(
	ffmpeg: FFmpeg,
	videoUrl: string,
	options: {
		startTime: string;
		endTime: string;
		mute: boolean;
		isPreview?: boolean;
	},
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
			"-c",
			"copy",
			...(options.mute ? ["-an"] : []),
			outputFileName,
		];

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
