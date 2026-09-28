# Planet Cubic Julia — flight experiment

This branch reuses the `planet-julia` flight: the same twelve time markers, zoom schedule, spiral angles, orbit radii, one deep circle, spiral ascent, palette, scrubber, SoundCloud transport and browser frame cache. The camera coordinates are translated to a detailed boundary point near `−0.3348691278 − 0.4897725872i`. The opening view shows the three-lobed cubic Julia set.

The renderer iterates `z → z³ + c` with fixed `c = 0.45 + 0.55i` from the earlier cubic Julia demo. `index.html` embeds the recipe in `cubic-julia-demo.json`; the separate JSON is included for editing. The default `precache` mode calculates 105 frames in the browser worker for roughly 1:58–3:30, with live rendering elsewhere.

The existing [Planet Mandelbrot](https://soundcloud.com/hewmorist/mandelbrot-techno) track remains as timing audio for this experiment. The visible revision is `Planet Cubic Julia r1`.
