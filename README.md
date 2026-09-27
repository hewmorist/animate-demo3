# Planet Julia — flight experiment

This branch adapts the `player2` spiral descent, one deep circle, and spiral ascent to a quadratic Julia set. It keeps the segment times, zooms, orbit angles, radial motion, palette, timeline scrubber, SoundCloud transport, and browser frame cache. The Julia iteration uses `z → z² + c` with fixed `c = −0.7269 + 0.1889i`; the camera targets a repelling period-two point near `−0.2108571523 − 0.3266551490i`.

`index.html` embeds the recipe from `julia-demo.json`, so the static page does not fetch the JSON. The default rendering mode is `precache`, calculating 105 frames in a background worker for about 1:58–3:30, with live rendering elsewhere. `?frames=motion` remains available for comparison.

The SoundCloud track remains [Planet Mandelbrot](https://soundcloud.com/hewmorist/mandelbrot-techno) as temporary timing audio for this experiment. The visible revision is `Planet Julia r1`.
