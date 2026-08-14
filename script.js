// Lightbox logic
const lightbox = document.getElementById("lightbox");
const lightboxClose = document.getElementById("lightboxClose");
const mediaContainer = document.getElementById("lightboxMediaContainer");
const downloadLink = document.getElementById("downloadLink");

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const type = item.dataset.type;
    const src = item.dataset.src;

    mediaContainer.innerHTML = "";

    if (type === "image") {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "Wedding media";
      mediaContainer.appendChild(img);
    } else if (type === "video") {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      mediaContainer.appendChild(video);
    }

    downloadLink.href = src;
    lightbox.classList.add("active");
  });
});

lightboxClose.addEventListener("click", () => {
  lightbox.classList.remove("active");
  mediaContainer.innerHTML = "";
});

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop")) {
    lightbox.classList.remove("active");
    mediaContainer.innerHTML = "";
  }
});

// Request access form -> mailto
const requestForm = document.getElementById("requestForm");

requestForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(requestForm);
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  // TODO: replace with your real email address
  const to = "youremail@example.com";

  const subject = encodeURIComponent("Wedding Gallery Access Request");
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  const mailtoUrl = `mailto:${to}?subject=${subject}&body=${body}`;
  window.location.href = mailtoUrl;
});
