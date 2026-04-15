"use client";

import { useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

let preloadStarted = false;

export function WasmPreloader() {
    useEffect(() => {
        if (preloadStarted) return;
        preloadStarted = true;

        // Wait a few seconds after the page loads before silently fetching the 30MB WASM file
        const timer = setTimeout(async () => {
            try {
                const baseURL = window.location.origin + "/wasm";
                const ffmpeg = new FFmpeg();
                // Since we are loading from the same origin, the browser will cache these files.
                // The next time the user clicks "Brew", `getFFmpeg` will be near-instant.
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                });
                console.log("WASM preloaded successfully in background");
            } catch (e) {
                console.error("Failed to preload WASM:", e);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
