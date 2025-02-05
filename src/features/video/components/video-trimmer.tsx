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
import { useState } from "react";
import { validateTimeFormat, validateTimeRange } from "../utils";

export default function VideoTrimmer({
	onProcessVideo,
	duration,
	setDuration,
	processing,
	onPreviewVideo,
	clearPreviewUrl,
}: {
	onProcessVideo: () => void | Promise<void>;
	onPreviewVideo: () => void;
	clearPreviewUrl: () => void;
	duration: [string, string];
	setDuration: (duration: [string, string]) => void;
	processing: boolean;
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
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle>Trim Video</CardTitle>
					<CardDescription>
						Adjust the start and end times of the video.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4">
						<Label>
							Start Time
							<Input
								className="mt-2 w-full"
								type="text"
								value={duration[0]}
								onChange={(e) => handleDurationChange(0, e.target.value)}
								placeholder="00:00:00"
							/>
						</Label>
						<Label>
							End Time
							<Input
								className="mt-2 w-full"
								type="text"
								value={duration[1]}
								onChange={(e) => handleDurationChange(1, e.target.value)}
								placeholder="00:00:00"
							/>
						</Label>
						{error && <p className="text-sm text-destructive">{error}</p>}
					</div>
				</CardContent>
			</Card>
			<Button
				size="lg"
				onClick={onPreviewVideo}
				disabled={processing || !!error}
			>
				{processing ? "Processing..." : "Preview"}
			</Button>
			<Button
				onClick={onProcessVideo}
				size="lg"
				disabled={processing || !!error}
			>
				{processing ? "Processing..." : "Download Edited Video"}
			</Button>
		</div>
	);
}
