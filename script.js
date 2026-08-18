const API_KEY = "AIzaSyCRadR3Kb12_d-SVAnrwlgd7_Q-fnsE4nc";
const FOLDER_ID = "1WDhCqyQKCMtg-Y9RRWca6Z1VS-USCCmq";

const state = {
  items: [],
  currentIndex: -1,
};

// ---------- Data loading ----------

async function fetchAllFiles() {
  let files = [];
  let pageToken = null;

  do {
    const url = new URL("https://www.googleapis.com/drive/v3/files");
    url.searchParams.set("q", `'${FOLDER_ID}' in parents and trashed = false`);
    url.searchParams.set("key", API_KEY);
    url.searchParams.set(
      "fields",
      "nextPageToken, files(id,name,mimeType,webContentLink,createdTime)"
    );
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("orderBy", "name_natural");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Drive API error: ${response.status}`);
    }
    const data = await response.json();
    files = files.concat(data.files || []);
    pageToken = data.nextPageToken || null;
  } while (pageToken);

  return files;
}

function isVideoFile(file) {
  return (
    file.mimeType.startsWith("video/") ||
    /\.(mp4|mov|m4v|avi|webm)$/i.test(file.name)
  );
}

function driveThumbUrl(id, size) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

function buildItem(file) {
  return {
    id: file.id,
    name: file.name,
    isVideo: isVideoFile(file),
    gridThumb: driveThumbUrl(file.id, 500),
    largeThumb: driveThumbUrl(file.id, 1600),
    embedUrl: `https://drive.google.com/file/d/${file.id}/preview`,
    videoSrc: `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${API_KEY}`,
    downloadUrl:
      file.webContentLink ||
      `https://drive.google.com/uc?export=download&id=${file.id}`,
  };
}

// ---------- Rendering ----------

function renderGallery(items) {
  const grid = document.getElementById("galleryGrid");
  const status = document.getElementById("galleryStatus");
  grid.innerHTML = "";

  if (!items.length) {
    status.textContent = "No photos or videos yet — be the first to share!";
    return;
  }

  status.hidden = true;
  grid.hidden = false;

  items.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const thumbBtn = document.createElement("button");
    thumbBtn.type = "button";
    thumbBtn.className = "thumb";
    thumbBtn.setAttribute(
      "aria-label",
      item.isVideo ? "Play video" : "View photo"
    );
    thumbBtn.addEventListener("click", () => openLightbox(index));

    const img = document.createElement("img");
    img.src = item.gridThumb;
    img.loading = "lazy";
    img.alt = item.isVideo ? "Wedding video thumbnail" : "Wedding photo";
    img.onerror = () => {
      img.onerror = null;
      img.src = item.downloadUrl;
    };
    thumbBtn.appendChild(img);

    if (item.isVideo) {
      const badge = document.createElement("span");
      badge.className = "play-badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = "▶";
      thumbBtn.appendChild(badge);
    }

    const downloadLink = document.createElement("a");
    downloadLink.className = "download-link";
    downloadLink.href = item.downloadUrl;
    downloadLink.target = "_blank";
    downloadLink.rel = "noopener";
    downloadLink.textContent = "⬇ Download";

    figure.appendChild(thumbBtn);
    figure.appendChild(downloadLink);
    grid.appendChild(figure);
  });
}

// ---------- Lightbox ----------

function openLightbox(index) {
  state.currentIndex = index;
  const item = state.items[index];
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightboxContent");
  const downloadBtn = document.getElementById("lightboxDownload");

  content.innerHTML = "";

  if (item.isVideo) {
    // Use a native <video> element so play/pause, seek, fullscreen, and
    // cast controls are rendered by the browser itself. Google's embedded
    // preview (an iframe pointing at drive.google.com) draws its own
    // control overlay inside a cross-origin page we can't restyle, and on
    // small mobile screens that overlay's play/pause button ends up
    // stacked on top of the fullscreen/cast buttons. Native controls avoid
    // that entirely.
    const video = document.createElement("video");
    video.src = item.videoSrc;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.poster = item.gridThumb;
    video.className = "lightbox-media";
    video.addEventListener(
      "error",
      () => {
        // Fall back to Google's embedded preview if direct streaming
        // fails (e.g. a very large file Drive won't serve without its
        // virus-scan interstitial).
        content.innerHTML = "";
        const iframe = document.createElement("iframe");
        iframe.src = item.embedUrl;
        iframe.className = "lightbox-media";
        iframe.allow = "autoplay; fullscreen";
        iframe.allowFullscreen = true;
        content.appendChild(iframe);
      },
      { once: true }
    );
    content.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = item.largeThumb;
    img.alt = item.name;
    img.className = "lightbox-media";
    img.onerror = () => {
      img.onerror = null;
      img.src = item.downloadUrl;
    };
    content.appendChild(img);
  }

  downloadBtn.href = item.downloadUrl;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  document.getElementById("lightbox").hidden = true;
  document.getElementById("lightboxContent").innerHTML = "";
  document.body.classList.remove("lightbox-open");
  state.currentIndex = -1;
}

function showRelative(offset) {
  if (state.currentIndex === -1 || !state.items.length) return;
  const next =
    (state.currentIndex + offset + state.items.length) % state.items.length;
  openLightbox(next);
}

document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
document
  .getElementById("lightboxPrev")
  .addEventListener("click", () => showRelative(-1));
document
  .getElementById("lightboxNext")
  .addEventListener("click", () => showRelative(1));

// Click on the dark backdrop (not the media itself) closes the lightbox
document.getElementById("lightbox").addEventListener("click", (event) => {
  if (event.target.id === "lightbox") closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (document.getElementById("lightbox").hidden) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") showRelative(-1);
  if (event.key === "ArrowRight") showRelative(1);
});

// ---------- Init ----------

async function init() {
  const status = document.getElementById("galleryStatus");
  try {
    const files = await fetchAllFiles();
    state.items = files.map(buildItem);
    renderGallery(state.items);
  } catch (error) {
    console.error(error);
    status.textContent =
      "We couldn't load the gallery right now. Please refresh or try again later.";
  }
}

init();
