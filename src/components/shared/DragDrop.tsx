"use client"

import { useRef, useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function DragDrop() {

    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleChange = (
        file : File | undefined
    ) => {
        if (file && file.type.startsWith("video")) {
            const url = URL.createObjectURL(file);
            router.push(`/video/${url.split("/").pop()}`);
            return;
        }
        toast.error("Invalid file type. Please upload a video file.");
    }

    return (
        <div className="h-dvh p-5 flex justify-center items-center">
            <div
                className="border-2 border-dashed border-gray-300 w-full h-full flex justify-center items-center"
                onDragOver={
                    (e: React.DragEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        console.log("dragging over");
                        setIsDragging(true);
                    }
                }
                onDragLeave={() => setIsDragging(false)}
                onDrop={
                    (e: React.DragEvent<HTMLDivElement>) => {
                        console.log("dropped");
                        e.preventDefault();
                        setIsDragging(false);
                        const file = e.dataTransfer.files[0];
                        handleChange(file);
                    }
                }
            >

                <Input
                    ref={ref}
                    type="file"
                    className="hidden"
                    id="file-upload"
                    typeof="video/*"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0];
                        handleChange(file);
                    }}
                />
                {!isDragging &&
                    <Button
                        onClick={() => ref.current?.click()}
                        className="flex items-center" 
                    >
                        <UploadIcon className="mr-2 h-5 w-5" />
                        Upload File
                    </Button>
                }
            </div>
        </div>
    )
}


function UploadIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" x2="12" y1="3" y2="15" />
        </svg>
    )
}
