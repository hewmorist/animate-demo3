# Mandelbrot high-resolution demo

Experimental higher-detail variant of [animate-demo2](https://github.com/hewmorist/animate-demo2). The animation and SoundCloud playback are inherited from r14, including iPhone first-tap and pause/resume handling. `index.html` embeds the same recipe as `mandelbrot-demo.json`, so the page runs as a standalone static file.

The procedural renderer now computes at 320–384 pixels per side (previously 192–256), then displays the result on the 800×800 canvas. This is roughly 2.25–2.8× the pixels per render, so some devices may update the detail less frequently. This is a real-time experiment, not the offline supersampled rendering used by Wikipedia’s Mandelbrot GIF.

The Play button uses the public SoundCloud track [Planet Mandelbrot (Animation)](https://soundcloud.com/hewmorist/mandelbrot-techno). Add `?testAudio=1` to the page URL to try a private SoundCloud embed during development.

On the `player2` branch, `?frames=motion` experiments with moving each completed frame along the camera path. It calculates an 18% border at the same pixel scale and crops that border during playback. If the camera outruns the available border, it holds the last covered position until the next render arrives. The transition then moves both complete images through intermediate camera positions, with a longer handoff when frames are farther apart at the deep turn. Compare with `?frames=blend` (short screen-space dissolve), `?frames=complete` (hard cuts), or no `frames` parameter (projected mode).

`?frames=precache` is a browser-only experiment. After SoundCloud reports the track duration, a background worker calculates full frames for roughly 1:58–3:30 at one-second intervals, plus half-second frames around the fastest part of the deep turn. It keeps about 105 RGBA frames (roughly 60 MiB) in memory and projects a pair into the current camera view. The live `motion` renderer remains the fallback when a needed frame has not been calculated; it resumes near the end. `&debug=1` shows how many frames are ready. No video or frame pixels are downloaded with the page.
