# Herbal Garden plant guide

A static website with one page per plant. Each plant page has its own QR code so visitors can scan a sign in the garden and land on that plant.

## Publish on GitHub Pages

1. Create a new repository on GitHub and upload everything in this folder (or push it with git).
2. In the repository go to **Settings > Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save.
3. After a minute the site is live at `https://<your-username>.github.io/<repo-name>/`.

## Make the QR codes

Open `https://<your-username>.github.io/<repo-name>/qr.html` on the live site. The codes use that address automatically.
Download each card as a PNG or press **Print all** (3 cards per row on A4).

Plant page addresses look like `.../plants/kaha/` and never change, so printed codes keep working when you edit the text.

## Edit plant text

Change `data/plants.json` (wrap a scientific name in `*stars*` inside any text to make it italic), then run:

```
node build.mjs
```

The site name is the `SITE_NAME` line at the top of `build.mjs`. Photo credits live in `data/photos.json` and must stay on the site because of the photo licences.
