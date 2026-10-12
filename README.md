# bldtrainer

I'm learning 3x3 blindfolded and kept blanking on my letter pairs, so I built this to drill them. A pair pops up, you picture your image, hit space, and mark got it or still learning. The ones you miss come back first.

![trainer](demo/trainer.png)
![revealed card](demo/revealed.png)

All 552 Speffz pairs are in there with preset words. Anything you don't like, click the pair and write your own. Yours always win.

![library](demo/pairs.png)

## Running it

```sh
npm install
npm run dev
```

## Pairs live here

`src/assets/pairs.txt`, one per line:

```
UF: UFO
AD: Addison (friend of mine), Addicted
```

The app reads the file directly. Edit it and reload.

## Good to know

No account, no server. Your words, progress, and settings sit in localStorage. A background photo sits in IndexedDB on the same machine and never gets exported. Moving machines? Settings has export/import JSON.

Deploying somewhere real? Set `NEXT_PUBLIC_SITE_URL` to your domain at build time, otherwise the canonical URLs and sitemap point at a placeholder.
