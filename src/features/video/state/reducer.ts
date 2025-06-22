import { VIDEO_QUALITIES } from "../constants";
import type { VideoPlayerAction, VideoPlayerState } from "./types";

export const initialVideoPlayerState: VideoPlayerState = {
	startTime: 0,
	endTime: 0,
	currentTime: 0,
	videoDuration: 0,
	processing: false,
	previewUrl: null,
	muted: false,
	selectedQuality: VIDEO_QUALITIES[0],
};

export function videoPlayerReducer(
	state: VideoPlayerState,
	action: VideoPlayerAction,
): VideoPlayerState {
	switch (action.type) {
		case "SET_TIMES":
			return {
				...state,
				...action.payload,
			};
		case "SET_DURATION":
			return {
				...state,
				videoDuration: action.payload,
				endTime: action.payload,
			};
		case "SET_PROCESSING":
			return {
				...state,
				processing: action.payload,
			};
		case "SET_PREVIEW_URL":
			return {
				...state,
				previewUrl: action.payload,
			};
		case "SET_MUTED":
			return {
				...state,
				muted: action.payload,
			};
		case "SET_QUALITY":
			return {
				...state,
				selectedQuality: action.payload,
			};
		case "INITIALIZE_VIDEO":
			return {
				...state,
				videoDuration: action.payload.duration,
				endTime: action.payload.duration,
				muted: action.payload.muted,
			};
		case "CLEAR_PREVIEW":
			return {
				...state,
				previewUrl: null,
			};
		default:
			return state;
	}
}
