import { formatFileSize } from "../../drag-drop/utils";

export function FileInfo({
	name,
	size,
}: {
	name: string;
	size: number;
}) {
	return (
		<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
			<h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
				{name}
			</h2>
			<span className="text-xs sm:text-sm font-normal text-muted-foreground">
				({formatFileSize(size)})
			</span>
		</div>
	);
}
