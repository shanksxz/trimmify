import { Button } from "@/components/ui/button";
import { FileInfo } from "../../uploads/components/file-info";

export function Preview({
	file,
	videoUrl,
	onDiscard,
	onConfirm,
}: {
	file: File;
	videoUrl: string;
	onDiscard: () => void;
	onConfirm: () => void;
}) {
	return (
		<div className="p-2 max-w-4xl mx-auto h-dvh flex flex-col justify-center gap-4">
			<div className="flex flex-col gap-2">
				<FileInfo name={file.name} size={file.size} />
				<div className="relative rounded-lg overflow-hidden">
					<video className="w-full aspect-video" controls src={videoUrl} />
				</div>
			</div>
			<div className="flex justify-center gap-4">
				<Button variant="outline" onClick={onDiscard}>
					Discard
				</Button>
				<Button onClick={onConfirm}>Continue</Button>
			</div>
		</div>
	);
}
