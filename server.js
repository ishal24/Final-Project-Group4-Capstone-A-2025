const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const axios = require("axios");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files (CSS, JS, and filter images)
app.use(express.static(path.join(__dirname, "frontend")));

// Route for the root page (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// POST route for image generation
app.post("/generate", async (req, res) => {
  try {
    const { image, prompt, negative_prompt } = req.body;

    // Send the image to Stable Diffusion via your local API (sdapi/v1/img2img)
    const response = await axios.post("http://127.0.0.1:7860/sdapi/v1/img2img", {
      init_images: [image],
      prompt: prompt,
      negative_prompt: negative_prompt,
      width: 768,
      height: 768,
      sampler_index: "Euler A", // You can change sampler
      steps: 40,
      denoising_strength: 0.35
    });

    // Return the result as base64
    const generatedImage = response.data.images[0];
    res.json({ generated_image: `data:image/png;base64,${generatedImage}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
