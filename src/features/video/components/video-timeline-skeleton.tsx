import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function TimelineSkeleton() {
	return (
		<div className="w-full space-y-4">
			<Card className="relative w-full h-20 overflow-hidden border-0 shadow-sm">
				<CardContent className="p-0 h-full">
					<div className="flex h-full">
						{Array.from({ length: 10 }, (_, index) => (
							<div
								key={index}
								className="flex-1 h-full border-r border-border relative"
								style={{ minWidth: "20px" }}
							>
								<Skeleton className="w-full h-full" />

								<div className="absolute inset-0 flex items-center justify-center">
									<div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
								</div>
							</div>
						))}
					</div>

					<div className="absolute top-0 left-8 right-8 h-full bg-primary/20 border-t-2 border-b-2 border-primary/30">
						<div className="w-full h-full bg-gradient-to-r from-primary/5 to-primary/5" />
					</div>

					<div className="absolute top-0 left-8 w-4 h-full bg-primary/60 rounded-l-md border-l-2 border-primary">
						<div className="w-full h-full flex items-center justify-center">
							<div className="w-0.5 h-6 bg-primary-foreground rounded-sm opacity-70" />
						</div>
					</div>

					<div className="absolute top-0 right-8 w-4 h-full bg-primary/60 rounded-r-md border-r-2 border-primary">
						<div className="w-full h-full flex items-center justify-center">
							<div className="w-0.5 h-6 bg-primary-foreground rounded-sm opacity-70" />
						</div>
					</div>

					<div className="absolute top-0 left-1/3 w-0.5 h-full bg-destructive/60">
						<div className="absolute -top-3 -left-2 w-4 h-4 bg-destructive/60 rounded-full opacity-70" />
					</div>

					<div className="absolute bottom-0 left-0 right-0 h-4 bg-muted/50">
						{Array.from({ length: 6 }, (_, i) => (
							<Skeleton
								key={i}
								className="absolute bottom-0 h-2 w-8"
								style={{ left: `${i * 20}%` }}
							/>
						))}
					</div>
				</CardContent>
			</Card>

			<div className="flex justify-between items-center">
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="opacity-50">
						<Skeleton className="h-3 w-12" />
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="opacity-50">
						<Skeleton className="h-3 w-16" />
					</Badge>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="opacity-50">
						<Skeleton className="h-3 w-12" />
					</Badge>
				</div>
			</div>

			<Card className="border-0 shadow-sm">
				<CardContent className="p-4">
					<div className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
							<div className="flex-1">
								<p className="text-sm font-medium">
									Generating video thumbnails...
								</p>
								<p className="text-xs text-muted-foreground">
									This may take a few moments depending on video length
								</p>
							</div>
						</div>
						<Progress value={33} className="h-2" />
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Processing frames...</span>
							<Badge variant="secondary" className="text-xs">
								FFmpeg
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
