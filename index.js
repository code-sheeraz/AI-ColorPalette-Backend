// server/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config();

const app = express();
app.use(cors({
  origin: "https://ai-color-palette-frontend.vercel.app/"
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
            text: `Generate a 5-color HEX palette based on: "${prompt}". Return only an array of 5 HEX codes like ['#123456', '#abcdef', ...].`
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
    const text = data.candidates[0].content.parts[0].text;
    const hexCodes = text.match(/#[A-Fa-f0-9]{6}/g);
    res.json({ colors: hexCodes });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({ error: "Failed to fetch from Gemini API" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
