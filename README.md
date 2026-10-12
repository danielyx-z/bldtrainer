# BLD/PAIRS

I'm learning 3x3 blindfolded and didn't enjoy keeping an Excel sheet for my letter pairs, so this helps solve it.
All 552 Speffz pairs are in there with preset words. You can edit anything you don't like with your own words, saved on browser with import/export. 

Visit the live site [here](https://bldtrainer-sigma.vercel.app/).
![trainer](demo/trainer.png)
![revealed card](demo/revealed.png)
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
AD: Advertisement
```

The app reads the file directly. Edit it and reload.

## Good to know

No account, no server. Your words, progress, and settings sit in localStorage. A background photo sits in IndexedDB on the same machine and never gets exported. Moving machines? Settings has export/import JSON.

