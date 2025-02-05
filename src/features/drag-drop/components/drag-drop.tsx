"use client";

import { Editor } from "@/components/layout/editor";
import { VIDEO_CONFIG } from "@/features/drag-drop/constants";
import { UploadZone } from "@/features/uploads/components/upload-zone";
import { Preview } from "@/features/video/components/video-preview";
import { useEffect, useRef, useState } from "react";
import React from "react";
import { toast } from "sonner";
import { formatFileSize } from "../utils";

export default function DragDrop() {
	const [isDragging, setIsDragging] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [videoUrl, setVideoUrl] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const ref = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handlePaste = (e: ClipboardEvent) => {
			const items = e.clipboardData?.items;
			if (!items) return;

			Array.from(items).forEach((item) => {
				if (item.type === VIDEO_CONFIG.format) {
					const file = item.getAsFile();
					if (file) handleChange(file);
				}
			});
		};

		window.addEventListener("paste", handlePaste);
		return () => window.removeEventListener("paste", handlePaste);
	}, []);

	const handleChange = (file: File | undefined) => {
		if (!file) return;

		if (file.type !== VIDEO_CONFIG.format) {
			toast.error("Please upload an MP4 video file");
			return;
		}

		if (file.size > VIDEO_CONFIG.maxSize) {
			toast.error(
				`File size too large. Maximum size is ${formatFileSize(VIDEO_CONFIG.maxSize)}`,
			);
			return;
		}

		setSelectedFile(file);
		const url = URL.createObjectURL(file);
		setVideoUrl(url);
		setIsPending(true);
	};

	const handleConfirm = () => setIsPending(false);

	const handleDiscard = () => {
		if (videoUrl) URL.revokeObjectURL(videoUrl);
		setSelectedFile(null);
		setVideoUrl(null);
		setIsPending(false);
	};

	const handleBack = () => {
		setSelectedFile(null);
		setVideoUrl((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return null;
		});
	};

	if (!videoUrl || !selectedFile) {
		return (
			<div className="flex md:p-6 p-2 items-center justify-center h-dvh w-full bg-background">
				<UploadZone
					isDragging={isDragging}
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={(e) => {
						e.preventDefault();
						setIsDragging(false);
						const file = e.dataTransfer.files[0];
						handleChange(file);
					}}
					inputRef={ref}
					onFileChange={(e) => {
						const file = e.target.files?.[0];
						handleChange(file);
					}}
				/>
			</div>
		);
	}

	if (isPending && selectedFile) {
		return (
			<div className="flex md:p-6 p-2 items-center justify-center h-dvh w-full bg-background">
				<Preview
					file={selectedFile}
					videoUrl={videoUrl}
					onDiscard={handleDiscard}
					onConfirm={handleConfirm}
				/>
			</div>
		);
	}

	return (
		<div className="flex md:p-6 p-2 items-center justify-center h-dvh w-full bg-background">
			<Editor file={selectedFile} videoUrl={videoUrl} onBack={handleBack} />
		</div>
	);
}
