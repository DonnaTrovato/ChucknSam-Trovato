const API_KEY = "AIzaSyCRadR3Kb12_d-SVAnrwlgd7_Q-fnsE4nc";
const FOLDER_ID = "1WDhCqyQKCMtg-Y9RRWca6Z1VS-USCCmq";

async function loadDriveFiles() {
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)`;

  const response = await fetch(url);
  const data = await response.json();

  const gallery = document.getElementById("galleryGrid");

  data.files.forEach(file => {
    // ⭐ Reliable video detection
    const isVideo =
      file.mimeType.startsWith("video") ||
      file.name.match(/\.(mp4|mov|m4v|avi|webm)$/i);

    const thumb = file.thumbnailLink || file.webContentLink;

    // Thumbnail image
    const item = document.createElement("img");
    item.src = thumb;
    item.loading = "lazy"; // ⭐ Lazy loading
    item.className = "gallery-item";

    // ⭐ Hybrid click behavior
    item.onclick = () => {
      if (isVideo) {
        openLightbox(file); // videos play inline
      } else {
        const url = `https://drive.google.com/uc?export=view&id=${file.id}`;
        window.open(url, "_blank"); // images open fast in new tab
      }
    };

    // ⭐ Add video badge overlay
    if (isVideo) {
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";

      const badge = document.createElement("div");
      badge.className = "video-badge";
      badge.textContent = "▶ Play Video";

      wrapper.appendChild(item);
      wrapper.appendChild(badge);
      gallery.appendChild(wrapper);
    } else {
      gallery.appendChild(item);
    }
  });
}

function openLightbox(file) {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");
  const downloadBtn = document.getElementById("download-btn");

  lightbox.classList.remove("hidden");
  content.innerHTML = "";

  // ⭐ Videos only — Drive allows inline playback inside <video>
  const video = document.createElement("video");
  video.src = `https://drive.google.com/uc?export=download&id=${file.id}`;
  video.controls = true;
  video.autoplay = false;
  content.appendChild(video);

  // Download button
  downloadBtn.href = file.webContentLink;
}

document.getElementById("lightbox-close").onclick = () => {
  document.getElementById("lightbox").classList.add("hidden");
};

loadDriveFiles();
