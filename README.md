# Charlie & Sam's Wedding Gallery

A simple static site for sharing and collecting Charlie and Sam's wedding
photos and videos. Guests can browse/download everything in the gallery, and
drop off their own photos and videos to be added later.

**Live site:** https://donnatrovato.github.io/ChucknSam-Trovato/

## How it works

This is a plain HTML/CSS/JS site hosted on GitHub Pages — no backend, no
build step.

- **Gallery** ([index.html](index.html), [script.js](script.js)): on page
  load, the script calls the Google Drive API (v3 `files.list`) to list
  everything in a specific public Drive folder, then renders a thumbnail grid.
  Clicking a thumbnail opens a lightbox — photos show a larger rendition via
  Drive's thumbnail endpoint, videos play through Drive's embeddable preview
  player (`drive.google.com/file/d/<id>/preview`) so they stream instead of
  downloading first. Every item also has a direct download link/button.
- **Upload** ([index.html](index.html)): the "Upload Photos & Videos" button
  links out to a Dropbox File Request — guests can drag/drop or use their
  phone's camera roll with no Dropbox account needed. Uploaded files land in
  a Dropbox folder that has to be manually reviewed and moved into the Google
  Drive folder to appear in the gallery (no auto-sync).
- **Styling** ([style.css](style.css)): plain CSS, mobile-first, no framework.

## Configuration

Both the API key and the Drive folder ID live at the top of
[script.js](script.js):

```js
const API_KEY = "...";
const FOLDER_ID = "...";
```

- **`FOLDER_ID`** — the Google Drive folder guests' final photos/videos live
  in. Must be shared as **"Anyone with the link — Viewer"**, since the site
  reads it with only an API key (no user login).
- **`API_KEY`** — a Google Cloud API key restricted to the **Google Drive
  API** and to the **HTTP referrer** `https://donnatrovato.github.io/*`.
  Manage it at [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).

  ⚠️ The referrer restriction must be the bare origin with a wildcard
  (`https://donnatrovato.github.io/*`), **not** a path-specific pattern like
  `.../ChucknSam-Trovato/*` — browsers send only the origin (no path) as the
  referrer on cross-origin API calls like this one, so a path-restricted
  pattern will block every real request with a 403
  (`API_KEY_HTTP_REFERRER_BLOCKED`).

The Dropbox File Request link is hardcoded in [index.html](index.html) —
update the `href` on the upload button if the request link ever changes or
expires.

Gallery ordering is controlled by the `orderBy` param in `fetchAllFiles()`
in [script.js](script.js) — currently `name_natural` (sorts by filename,
e.g. `IMG_0081` before `IMG_0100`). Swap to `createdTime desc` for
upload-order, or sort by `mediaMetadata.creationTime` if you want true
photo-taken-date order instead of filename order.

## Local development

Since the gallery calls Google's API with a referrer-restricted key, opening
`index.html` directly as a local file (`file://...`) will fail with a 403 —
browsers send no referrer at all for local files, which doesn't match the
allowed pattern. To test changes before pushing, either:

- Temporarily add `http://localhost:*` (or your local dev server's origin)
  to the API key's allowed referrers and serve the folder with a local
  static server, or
- Push to `main` and test on the live GitHub Pages URL (simplest for a
  small personal site like this one).

## Known limitations

- Free Google account storage (15 GB, shared with Gmail/Photos) can fill up
  faster than expected with guest-uploaded videos — worth checking Drive
  storage occasionally as more files come in.
- The Dropbox File Request (free plan) caps *received* storage at 2GB
  total, cumulative until cleared. Moving reviewed files into Drive does
  **not** free that space — the originals also need to be deleted from
  Dropbox once they're safely copied over. If guests upload enough to hit
  the cap, a free fallback is a Google Form with a file-upload question
  pointed at the Drive folder (draws from the 15GB Google quota instead),
  though it requires guests to sign into a Google account to upload, unlike
  Dropbox's no-account file request.
- The Drive API returns up to 100 files per request; `fetchAllFiles()`
  already pages through additional results automatically, so this isn't a
  practical limit.
- No automatic moderation — anything moved into the Drive folder shows up
  on the site immediately, and anything guests submit via Dropbox stays
  private until manually reviewed and moved over.
