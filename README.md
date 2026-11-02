# Saints 1899 Team Hub

The team site at https://hamza-abdalla.github.io/saints-hub/ . Data lives in Firebase (Auth and Firestore). No names or rosters are ever stored in this repository.

## Layout

| Path | What it is |
|---|---|
| `src/index.html` | Page shell (header, empty app container) with markers where the CSS and JS are inserted |
| `src/styles.css` | All styles |
| `src/js/*.js` | The app, split by area. Files are joined in filename order into ONE module, so they share variables. Keep the numeric prefixes |
| `assets/logo.png` | Team logo, inlined into the page at build time |
| `firebase-config.js` | Public Firebase web settings (loaded by the page, not secret) |
| `firebase/firestore.rules` | Firestore security rules. Source of truth, **not** published with the site |
| `scripts/build.mjs` | Joins everything into `dist/index.html` (no dependencies) |
| `.github/workflows/pages.yml` | Builds on every push and pull request, deploys to GitHub Pages from `main` |

## Working on it

```
node scripts/build.mjs      # writes dist/index.html and dist/firebase-config.js
```

Open `dist/index.html` through any local web server (for example `npx serve dist`); opening the file directly will not run it.

## Deploying the site

One time: in the repository go to **Settings, Pages, Build and deployment, Source** and choose **GitHub Actions**. After that, every push to `main` builds and publishes the site.

## Firestore rules

`firebase/firestore.rules` is kept here so changes can be reviewed. For now, publish it by hand: Firebase console, Firestore Database, Rules, paste, Publish. Automated deployment can be added later.

Rules need to change when a feature saves to a new collection, adds a field to an existing document, changes who may do something, or changes what values are allowed. Layout, wording and display-only changes do not need a rules change.
