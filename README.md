# Planet Mandelbrot — player2

This branch combines the latest renderer and SoundCloud playback handling with the full flight: spiral descent, one fast enlarged circle at maximum depth, and spiral ascent. The standalone `index.html` embeds the route from `mandelbrot-demo.json` and needs no JSON fetch.

The page shows a canvas, timeline scrubber with elapsed/total time, and Play/Pause button. Drag the scrubber to preview a position; releasing it seeks the SoundCloud track and pauses playback until Play is pressed. The player calculates fractal pixels in browser workers, including the newly exposed edges during ascent.

The track is [Planet Mandelbrot (Animation)](https://soundcloud.com/hewmorist/mandelbrot-techno). GitHub Pages can be switched to this `player2` branch for device testing. The app revision is in the HTML `app-revision` meta tag.

## Straight-path comparison

Open the Pages URL with `?path=straight` to remove the camera orbit while preserving the same zoom schedule, render quality, and audio. The ordinary URL retains the full spiral and circle. This is a controlled test of whether sideways camera motion causes the blur and glitches seen around 0:27. The comparison option is in the HTML only; `mandelbrot-demo.json` remains the full flight.

## Complete-frame comparison

Open the Pages URL with `?frames=complete` to display only finished Mandelbrot renders. It holds each full frame until the next worker result and never projects or crossfades an intermediate image. The ordinary URL retains smooth projected motion. Compare the two spiral modes around 0:27–0:37 for sharpness versus choppiness. The option can be combined with `path=straight` if needed.

## Finished-frame blend comparison

Open the Pages URL with `?frames=blend` to hold complete renders and dissolve from the previous finished image for 120 ms when a new one arrives. This leaves the fractal fully rendered between updates while softening the cut. Compare with `?frames=complete` (hard cuts) and the ordinary URL (continuous projection).
