"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { validateTimeFormat, validateTimeRange } from "../utils";

export default function VideoTrimmer({
	onProcessVideo,
	duration,
	setDuration,
	processing,
	onPreviewVideo,
	clearPreviewUrl,
	quality,
	onQualityChange,
	qualities,
	muted,
	onMuteToggle,
}: {
	onProcessVideo: () => void | Promise<void>;
	onPreviewVideo: () => void;
	clearPreviewUrl: () => void;
	duration: [string, string];
	setDuration: (duration: [string, string]) => void;
	processing: boolean;
	quality: VideoQuality;
	onQualityChange: (quality: VideoQuality) => void;
	qualities: VideoQuality[];
	muted: boolean;
	onMuteToggle: (muted: boolean) => void;
}) {
	const [error, setError] = useState<string | null>(null);

	const handleDurationChange = (index: 0 | 1, value: string) => {
		if (!validateTimeFormat(value)) {
			setError("Invalid time format. Please use HH:MM:SS");
			return;
		}

		const newDuration: [string, string] = [...duration] as [string, string];
		newDuration[index] = value;

		if (!validateTimeRange(newDuration[0], newDuration[1])) {
			setError("End time must be after start time");
			return;
		}

		setDuration(newDuration);
		clearPreviewUrl();
		setError(null);
	};

	return (
		<div className="flex flex-col gap-4">
			<Card className="border-none shadow-none bg-white/50">
				<CardHeader className="pb-4">
					<CardTitle className="text-lg font-medium">Video Settings</CardTitle>
					<CardDescription className="text-sm text-muted-foreground">
						Adjust video quality and trim settings
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-4">
						<div className="space-y-2">
							<div className="flex flex-col gap-2">
								<Label className="text-sm font-medium">Video Quality</Label>
								<p className="text-sm text-yellow-600">
									⚠️ Warning: Client-side video processing speed depends on your
									device's capabilities. Higher quality settings (e.g., 1080p)
									may take significantly longer to process on less powerful
									devices.
								</p>
								<Select
									value={quality.label}
									onValueChange={(value) => {
										const newQuality = qualities.find((q) => q.label === value);
										if (newQuality) onQualityChange(newQuality);
									}}
								>
									<SelectTrigger className="w-full bg-white">
										<SelectValue placeholder="Select quality" />
									</SelectTrigger>
									<SelectContent>
										{qualities.map((q) => (
											<SelectItem key={q.label} value={q.label}>
												{q.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="flex items-center justify-between">
							<Label className="text-sm font-medium">Mute Video</Label>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onMuteToggle(!muted)}
								className={muted ? "bg-red-100" : ""}
							>
								{muted ? "Unmute" : "Mute"}
							</Button>
						</div>
						<div className="space-y-2">
							<Label className="text-sm font-medium">Start Time</Label>
							<Input
								className="w-full bg-white"
								type="text"
								value={duration[0]}
								onChange={(e) => handleDurationChange(0, e.target.value)}
								placeholder="00:00:00"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-sm font-medium">End Time</Label>
							<Input
								className="w-full bg-white"
								type="text"
								value={duration[1]}
								onChange={(e) => handleDurationChange(1, e.target.value)}
								placeholder="00:00:00"
							/>
						</div>
						{error && <p className="text-sm text-destructive">{error}</p>}
					</div>
				</CardContent>
			</Card>
			<Button
				size="lg"
				onClick={onPreviewVideo}
				disabled={processing || !!error}
				variant="default"
				className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
			>
				{processing ? "Processing..." : "Preview"}
			</Button>
			<Button
				onClick={onProcessVideo}
				size="lg"
				disabled={processing || !!error}
				variant="default"
				className="w-full bg-zinc-900 hover:bg-zinc-800 text-white"
			>
				{processing ? "Processing..." : "Download Edited Video"}
			</Button>
		</div>
	);
}
