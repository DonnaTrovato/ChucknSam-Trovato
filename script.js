const API_KEY = "AIzaSyCRadR3Kb12_d-SVAnrwlgd7_Q-fnsE4nc";
const FOLDER_ID = "1WDhCqyQKCMtg-Y9RRWca6Z1VS-USCCmq";

async function loadDriveFiles() {
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)`;

  const response = await fetch(url);
  const data = await response.json();

  const gallery = document.getElementById("galleryGrid");

  data.files.forEach(file => {
    const isVideo = file.mimeType.startsWith("video") || file.name.match(/\.(mp4|mov|m4v|avi|webm)$/i);
    const thumb = file.thumbnailLink || file.webContentLink;

    const item = document.createElement("img");
    item.src = thumb;
    item.className = "gallery-item";

    // ⭐ HYBRID OPTION C:
    // Images → open in new tab
    // Videos → open in lightbox
    item.onclick = () => {
      if (isVideo) {
        openLightbox(file);   // videos play inline on mobile
      } else {
        const url = `https://drive.google.com/uc?export=view&id=${file.id}`;
        window.open(url, "_blank");   // images open fast in new tab
      }
    };

    gallery.appendChild(item);
  });
}

function openLightbox(file) {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");
  const downloadBtn = document.getElementById("download-btn");

  lightbox.classList.remove("hidden");
  content.innerHTML = "";

  // ⭐ Videos only — Drive allows inline playback inside <video> on mobile
  const video = document.createElement("video");
  video.src = `https://drive.google.com/uc?export=download&id=${file.id}`;
  video.controls = true;
  video.autoplay = false;
  content.appendChild(video);

  // Download button works for both images & videos
  downloadBtn.href = file.webContentLink;
}

document.getElementById("lightbox-close").onclick = () => {
  document.getElementById("lightbox").classList.add("hidden");
};
loadDriveFiles();
