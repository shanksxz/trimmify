import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import dynamic from "next/dynamic";

const FfmpegProvider = dynamic(() => import("@/utils/context"), { ssr: false });
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "trim-video",
	description: "A simple video trimmer using FFmpeg",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<main>
					<FfmpegProvider>{children}</FfmpegProvider>
				</main>
				<Toaster />
			</body>
		</html>
	);
}
