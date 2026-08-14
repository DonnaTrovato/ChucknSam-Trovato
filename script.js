const API_KEY = "AIzaSyCRadR3Kb12_d-SVAnrwlgd7_Q-fnsE4nc";
const FOLDER_ID = "1WDhCqyQKCMtg-Y9RRWca6Z1VS-USCCmq";

async function loadDriveFiles() {
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink)`;

  const response = await fetch(url);
  const data = await response.json();

  const gallery = document.getElementById("galleryGrid");

  data.files.forEach(file => {
    const isVideo = file.mimeType.includes("video");
    const thumb = file.thumbnailLink || "";

    const item = document.createElement("img");
    item.src = thumb;
    item.className = "gallery-item";

    item.onclick = () => openLightbox(file);

    gallery.appendChild(item);
  });
}

function openLightbox(file) {
  const lightbox = document.getElementById("lightbox");
  const content = document.getElementById("lightbox-content");
  const downloadBtn = document.getElementById("download-btn");

  lightbox.classList.remove("hidden");
  content.innerHTML = "";

  const isVideo = file.mimeType.includes("video");

  if (isVideo) {
    const video = document.createElement("video");
    video.src = file.webContentLink;
    video.controls = true;
    content.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = file.webContentLink;
    content.appendChild(img);
  }

  downloadBtn.href = file.webContentLink;
}

document.getElementById("lightbox-close").onclick = () => {
  document.getElementById("lightbox").classList.add("hidden");
};

loadDriveFiles();
