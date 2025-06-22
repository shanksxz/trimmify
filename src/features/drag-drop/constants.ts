export { VIDEO_CONFIG } from "@/utils/constants";

export const DRAG_DROP_STATES = {
	IDLE: "idle",
	DRAGGING: "dragging",
	DROPPED: "dropped",
} as const;

export const ALLOWED_FILE_TYPES = ["video/mp4"] as const;
