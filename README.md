# Planet Mandelbrot — player2

This branch combines the latest renderer and SoundCloud playback handling with the full flight: spiral descent, one fast enlarged circle at maximum depth, and spiral ascent. The standalone `index.html` embeds the route from `mandelbrot-demo.json` and needs no JSON fetch.

The page shows a canvas, timeline scrubber, and Play/Pause button. Drag the scrubber to preview a position; releasing it seeks the SoundCloud track and pauses playback until Play is pressed. The player calculates fractal pixels in browser workers, including the newly exposed edges during ascent.

The track is [Planet Mandelbrot (Animation)](https://soundcloud.com/hewmorist/mandelbrot-techno). GitHub Pages can be switched to this `player2` branch for device testing. The app revision is in the HTML `app-revision` meta tag.
