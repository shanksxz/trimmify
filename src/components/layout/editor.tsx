import { Button } from "@/components/ui/button";
import { FileInfo } from "@/features/uploads/components/file-info";
import VideoPlayer from "@/features/video/components/video-player";
import { ArrowLeftIcon } from "lucide-react";

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
		<div className="w-full h-full flex flex-col gap-4 lg:gap-6 p-4">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4 sm:gap-2">
				<Button
					variant="ghost"
					className="sm:w-auto flex items-center gap-2 text-sm sm:text-base hover:bg-transparent hover:text-zinc-600 p-0"
					onClick={onBack}
				>
					<ArrowLeftIcon className="w-4 h-4" /> Back
				</Button>
				<FileInfo name={file.name} size={file.size} />
			</div>
			<div className="flex-1 min-h-0">
				<VideoPlayer videoUrl={videoUrl} />
			</div>
		</div>
	);
}
