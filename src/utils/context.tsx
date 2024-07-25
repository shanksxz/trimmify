"use client"

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { createContext, useContext, useEffect, useRef, useState } from 'react';

type FfmpegContextType = {
    ffmpeg: FFmpeg;
    loaded: boolean;
}

const FfmpegContext = createContext<FfmpegContextType>({} as FfmpegContextType);

export default function FfmpegProvider({ children }: { children: React.ReactNode }) {
    const ffmpegRef = useRef(new FFmpeg());
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            console.log('loading ffmpeg');
            const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
            const ffmpeg = ffmpegRef.current;
            ffmpeg.on("log", ({ message }) => {
                console.log(message);
            });
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            console.log('ffmpeg loaded');
            setLoaded(true);
        })()
    }, [])

    return (
        <FfmpegContext.Provider value={{ ffmpeg: ffmpegRef.current, loaded }}>
            {children}
        </FfmpegContext.Provider>
    )
}

export function useFfmpeg() {
    const context = useContext(FfmpegContext);
    if (!context) {
        throw new Error('useFfmpeg must be used within a FfmpegProvider');
    }
    return context;
}