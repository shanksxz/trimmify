import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type React from "react";
import { VIDEO_CONFIG } from "../../drag-drop/constants";
import { UploadIcon } from "./upload-icon";

export function UploadZone({
	isDragging,
	onDragOver,
	onDragLeave,
	onDrop,
	inputRef,
	onFileChange,
}: {
	isDragging: boolean;
	onDragOver: (e: React.DragEvent) => void;
	onDragLeave: () => void;
	onDrop: (e: React.DragEvent) => void;
	inputRef: React.RefObject<HTMLInputElement>;
	onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<div
			className={`w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center space-y-4 text-muted-foreground ${isDragging ? "border-primary bg-primary/10" : "hover:border-primary"} transition-colors`}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
		>
			<UploadIcon className="w-16 h-16" />
			<p className="text-lg text-center p-2">
				Drag and drop, paste, or click to upload a video
				<br />
				<span className="text-sm text-muted-foreground">
					Supported format: MP4
				</span>
			</p>
			<Input
				ref={inputRef}
				type="file"
				className="hidden"
				id="file-upload"
				accept={VIDEO_CONFIG.acceptType}
				onChange={onFileChange}
			/>
			<Button className="mt-4" onClick={() => inputRef.current?.click()}>
				Select Video
			</Button>
		</div>
	);
}
