import { Button } from "@/components/ui/button";
import { FileInfo } from "@/features/uploads/components/file-info";
import VideoPlayer from "@/features/video/components/video-player";

export function Editor({
	file,
	videoUrl,
	onBack,
}: {
	file: File;
	videoUrl: string;
	onBack: () => void;
}) {
	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-2">
				<Button
					variant="outline"
					className="sm:w-auto text-sm sm:text-base"
					onClick={onBack}
				>
					← Back
				</Button>
				<FileInfo name={file.name} size={file.size} />
			</div>
			<VideoPlayer videoUrl={videoUrl} />
		</div>
	);
}
