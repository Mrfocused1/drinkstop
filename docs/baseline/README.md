# Visual baseline

Reference screenshots of the site as it stood immediately before the de-branding
rebuild (branch `debrand`). These are the visual contract: the rebuild replaces the
stylesheet, the animation layer and the doodle artwork, but the rendered page is
meant to stay the same.

Captured with `shot.js` (in this directory) against `python3 -m http.server 8777`
served from the site root.

| | |
|---|---|
| `desk-0..7.png` | 1440×900, scrolled in 8 steps |
| `mob-0..7.png` | 390×844, scrolled in 8 steps |

Page height at capture: **21188 px** desktop, **17949 px** mobile. A large delta on
re-capture usually means a CSS deletion took live rules with it.

## Re-capture

```bash
python3 -m http.server 8777      # from the site root
node docs/baseline/shot.js       # writes into the scratchpad, then diff by eye
```

`shot.js` resolves `puppeteer` from this repo's `node_modules`, and waits ~6 s after
load plus 1.8 s per scroll step so the intro splash and the scrubbed ScrollTrigger
sequences have settled before each frame.
