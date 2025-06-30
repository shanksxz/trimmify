export const VIDEO_CONFIG = {
	format: "video/mp4",
	maxSize: 500 * 1024 * 1024, // 500MB
	acceptType: "video/mp4",
} as const;

export const APP_NAME = "Trimmify";
export const MAX_FILE_SIZE_DISPLAY = "500MB";

export const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
} as const;
