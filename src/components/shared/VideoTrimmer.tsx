"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type VideoTrimmerProps = {
  onProcessVideo: () => void | Promise<void>;
  duration: string[]; 
  setDuration: (duration: string[]) => void; 
  processing: boolean;
  onPreviewVideo: () => void;  
  clearPreviewUrl: () => void; 
}

export default function VideoTrimmer({ 
  onProcessVideo, 
  duration, 
  setDuration, 
  processing, 
  onPreviewVideo,  
  clearPreviewUrl
}: VideoTrimmerProps) {
  const [error, setError] = useState<string | null>(null);

  const validateTime = (time: string): boolean => {
    const timeRegex = /^(?:(?:([01]?\d|2[0-3]):)?([0-5]?\d):)?([0-5]?\d)$/;
    return timeRegex.test(time);
  };

  const handleDurationChange = (index: number, value: string) => {
    if (validateTime(value)) {
      const newDuration = [...duration];
      newDuration[index] = value;
      setDuration(newDuration);
      clearPreviewUrl(); 
      setError(null);
    } else {
      setError("Invalid time format. Please use HH:MM:SS");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trim Video</CardTitle>
          <CardDescription>Adjust the start and end times of the video.</CardDescription>
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
              />
            </Label>
            <Label>
              End Time
              <Input
                className="mt-2 w-full"
                type="text"
                value={duration[1]}
                onChange={(e) => handleDurationChange(1, e.target.value)}
              />
            </Label>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </CardContent>
      </Card>
      <Button size="lg" onClick={onPreviewVideo} disabled={processing}> 
        Preview
      </Button>
      <Button onClick={onProcessVideo} size="lg" disabled={processing || !!error}>
        Download Edited Video
      </Button>
    </div>
  );
};