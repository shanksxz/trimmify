"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type VideoTrimmerProps = {
  onProcessVideo: () => void | Promise<void>;
  duration: string[]; 
  setDuration: (duration: string[]) => void; 
  processing: boolean;
}

export default function VideoTrimmer({ onProcessVideo, duration, setDuration, processing } : VideoTrimmerProps) {

  //TODO: validate input
  const handleDurationChange = (index: number, value: string) => {
    const newDuration = [...duration];
    newDuration[index] = value;
    setDuration(newDuration);
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
          </div>
        </CardContent>
      </Card>
      <Button onClick={onProcessVideo} size="lg" disabled={processing}>
        {processing ? 'Processing...' : 'Download Edited Video'}
      </Button>
    </div>
  );
};

