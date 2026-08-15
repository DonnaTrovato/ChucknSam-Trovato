const API_KEY = "AIzaSyCRadR3Kb12_d-SVAnrwlgd7_Q-fnsE4nc";
const FOLDER_ID = "1WDhCqyQKCMtg-Y9RRWca6Z1VS-USCCmq";

async function loadDriveFiles() {
  const url =
    `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)`;

  const response = await fetch(url);
  const data = await response.json();

  const gallery = document.getElementById("galleryGrid");

  data.files.forEach(file => {
    const isVideo = file.mimeType.includes("video");

    // Thumbnail fallback
    const thumb = file.thumbnailLink || file.webContentLink;

    // Wrapper for each gallery item
    const wrapper = document.createElement("div");
    wrapper.className = "gallery-item-wrapper";

    // Thumbnail image
    const item = document.createElement("img");
    item.src = thumb;
    item.className = "gallery-item";

    // Click to open file
    item.onclick = () => {
      const url = isVideo
        ? `https://drive.google.com/uc?export=download&id=${file.id}`
        : `https://drive.google.com/uc?export=view&id=${file.id}`;

      window.open(url, "_blank");
    };

    // Download button
    const downloadBtn = document.createElement("a");
    downloadBtn.className = "download-btn";
    downloadBtn.innerText = "Download";
    downloadBtn.href = `https://drive.google.com/uc?export=download&id=${file.id}`;
    downloadBtn.target = "_blank";

    // Build item
    wrapper.appendChild(item);
    wrapper.appendChild(downloadBtn);
    gallery.appendChild(wrapper);
  });
}

// Load gallery
loadDriveFiles();
