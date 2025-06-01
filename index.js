// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://ai-color-palette-frontend.vercel.app"
}));
app.use(express.json());

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post("/generate-colors", async (req, res) => {
  const { prompt } = req.body;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `
You are a creative AI that designs color palettes.

Based on the prompt: "${prompt}", respond in strict JSON format with:

{
  "palette_name": "A short, creative name for the palette",
  "description": "1-2 sentence description of the vibe/style",
  "colors": ["#HEX1", "#HEX2", "#HEX3", "#HEX4", "#HEX5"],
  "suggestions": ["Prompt idea 1", "Prompt idea 2", "Prompt idea 3", "Prompt idea 4"]
}

Only return valid JSON.
            `
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Try to parse the JSON block Gemini returned
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}');
    const cleanJSON = aiResponse.substring(jsonStart, jsonEnd + 1);

    const result = JSON.parse(cleanJSON);
    res.json(result);

  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
