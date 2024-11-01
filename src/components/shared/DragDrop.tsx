"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import VideoLayout from "@/components/trim/VideoLayout"
import { LucideUpload } from "lucide-react"

export default function DragDrop() {
  const [isDragging, setIsDragging] = useState(false)
  const [url, setUrl] = useState<string>("")
  const ref = useRef<HTMLInputElement>(null)

  const handleChange = (file: File | undefined) => {
    if (file && file.type.startsWith("video")) {
      const url = URL.createObjectURL(file)
      setUrl(url)
      return
    }
    toast.error("Invalid file type. Please upload a video file.")
  }

  return (
    <>
      {!url ? (<div className="flex md:p-6 p-2 items-center justify-center border border-red-500 h-dvh w-full bg-background">
        <div
          className={`w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center space-y-4 text-muted-foreground transition-colors ${isDragging ? "border-primary" : "hover:border-primary"
            }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            handleChange(file)
          }}
        >
          <LucideUpload className="w-16 h-16" />
          <p className="text-lg text-center p-2">Drag and drop a video or click to upload</p>
          <Input
            ref={ref}
            type="file"
            className="hidden"
            id="file-upload"
            accept="video/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              handleChange(file)
            }}
          />
          <Button className="mt-4" onClick={() => ref.current?.click()}>
            Select Video
          </Button>
        </div>
      </div>) : (
        <VideoLayout src={url} />
      )}
    </>
  )
}