const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const carousel = document.getElementById("carousel");

const modal = document.createElement("div");
modal.className = "modal";
modal.innerHTML = `
  <div class="modal-content">
    <h2 id="modal-title">Photo Captured</h2>
    <img id="modal-image" src="" alt="Captured">
    <br />
    <button id="close-modal">Close</button>
  </div>
`;
document.body.appendChild(modal);

const modalTitle = document.getElementById("modal-title");
const modalImage = document.getElementById("modal-image");

const filters = [
  { name: "anime", src: "filters/anime.jpg" },
  { name: "cyberpunk", src: "filters/cyberpunk.jpg" },
  { name: "old painting", src: "filters/oldpainting.jpg" },
  { name: "ghibli", src: "filters/ghibli.jpg" }
];

const loadingGifs = [
  "filters/loading1.gif",
  "filters/loading2.gif",
  "filters/loading3.gif",
  "filters/loading4.gif",
  "filters/loading5.gif"
];

const prompts = {
  anime: "high quality anime-style portrait, sharp lines, clean shading, vivid colors, detailed eyes, background blur, soft lighting, professional anime art",
  cyberpunk: "cyberpunk portrait, neon lights, glowing eyes, futuristic city in background, techwear outfit, moody lighting, vibrant colors, cinematic atmosphere",
  "old painting": "classic oil painting portrait, renaissance art style, dramatic lighting, realistic textures, fine brush strokes, muted earthy tones, vintage background",
  ghibli: "ghibli-style portrait, soft pastel colors, whimsical background, expressive eyes, warm lighting, hand-painted feel, peaceful mood"
};

const negativePrompt = "blurry, lowres, worst quality, bad anatomy, bad hands, distorted face, watermark, nudity, nsfw, extra limbs, cropped head, mutated, deformed, jpeg artifacts";

let selectedFilter = filters[0].name;

// Load webcam
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => {
    alert("Camera access denied");
    console.error(err);
  });

// Populate carousel
filters.forEach((filter, index) => {
  const div = document.createElement("div");
  div.classList.add("filter-option");
  if (index === 0) div.classList.add("selected");
  div.dataset.filter = filter.name;
  div.innerHTML = `<img src="${filter.src}" alt="${filter.name}"><span>${filter.name}</span>`;
  carousel.appendChild(div);
});

// Filter selection
carousel.addEventListener("click", (e) => {
  const option = e.target.closest(".filter-option");
  if (!option) return;
  document.querySelectorAll(".filter-option").forEach(opt => opt.classList.remove("selected"));
  option.classList.add("selected");
  selectedFilter = option.dataset.filter;
});

// Capture logic
captureBtn.addEventListener("click", async () => {
  const size = 768;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const cropSize = Math.min(video.videoWidth, video.videoHeight);
  const offsetX = (video.videoWidth - cropSize) / 2;
  const offsetY = (video.videoHeight - cropSize) / 2;

  // Flip horizontally
  ctx.translate(size, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, offsetX, offsetY, cropSize, cropSize, 0, 0, size, size);
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

  const imageData = canvas.toDataURL("image/jpeg");

  modalTitle.textContent = "Generating image...";
  const randomLoadingGif = `filters/loading${Math.floor(Math.random() * 5) + 1}.gif`;
  modalImage.src = randomLoadingGif;
  modal.style.display = "flex";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageData,
        prompt: prompts[selectedFilter],
        negative_prompt: negativePrompt
      })
    });

    const data = await res.json();
    modalTitle.textContent = "AI Stylized Result";
    modalImage.src = data.generated_image;

  } catch (err) {
    modalTitle.textContent = "Error";
    modalImage.src = "";
    alert("Failed to generate image. Check backend.");
    console.error(err);
  }
});

const retryBtn = document.createElement("button");
retryBtn.textContent = "Retry";
modal.querySelector(".modal-content").appendChild(retryBtn);

retryBtn.addEventListener("click", async () => {
  const size = 768;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const cropSize = Math.min(video.videoWidth, video.videoHeight);
  const offsetX = (video.videoWidth - cropSize) / 2;
  const offsetY = (video.videoHeight - cropSize) / 2;

  // Flip horizontally
  ctx.translate(size, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(video, offsetX, offsetY, cropSize, cropSize, 0, 0, size, size);
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform

  const imageData = canvas.toDataURL("image/jpeg");

  modalTitle.textContent = "Generating image...";
  const randomLoadingGif = `filters/loading${Math.floor(Math.random() * 5) + 1}.gif`;
  modalImage.src = randomLoadingGif; // Show loading spinner again
  modal.style.display = "flex";

  try {
    const res = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: imageData,
        prompt: prompts[selectedFilter],
        negative_prompt: negativePrompt
      })
    });

    const data = await res.json();
    modalTitle.textContent = "AI Stylized Result";
    modalImage.src = data.generated_image;

  } catch (err) {
    modalTitle.textContent = "Error";
    modalImage.src = "";
    alert("Failed to generate image. Check backend.");
    console.error(err);
  }
});


// Close modal
modal.addEventListener("click", (e) => {
  if (e.target.id === "close-modal" || e.target === modal) {
    modal.style.display = "none";
  }
});
