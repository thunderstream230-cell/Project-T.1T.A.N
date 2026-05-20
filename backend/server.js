/*
  Project T.I.T.A.N backend

  This file keeps your API key private.

  Setup:
  1. cd backend
  2. npm install
  3. Copy .env.example to .env
  4. Put your API key in .env
  5. npm start

  Endpoint:
  POST http://localhost:3000/chat
*/

import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (request, response) => {
  response.json({
    status: "Project T.I.T.A.N backend online"
  });
});

app.post("/chat", async (request, response) => {
  try {
    const {
      message,
      history = [],
      memory = "",
      companion = {}
    } = request.body || {};

    if (!message || typeof message !== "string") {
      return response.status(400).json({
        error: "Missing message."
      });
    }

    const companionName = companion.name || "T.I.T.A.N";
    const tone = companion.tone || "balanced";
    const personality = companion.personality || "Calm, helpful, direct, and friendly.";

    const safeHistory = Array.isArray(history)
      ? history.slice(-12).filter(item => item && item.content && item.role)
      : [];

    const systemPrompt = `
You are ${companionName}, an AI companion interface.

Personality:
${personality}

Tone mode:
${tone}

User memory:
${memory || "No saved memory provided."}

Rules:
- Do not claim to be human.
- Be helpful, clear, and supportive.
- Keep answers practical.
- If the user is building something, help them step by step.
`.trim();

    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...safeHistory.map(item => ({
        role: item.role === "user" ? "user" : "assistant",
        content: String(item.content).slice(0, 4000)
      })),
      {
        role: "user",
        content: message
      }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices?.[0]?.message?.content || "I could not generate a response.";

    response.json({
      reply
    });
  } catch (error) {
    console.error(error);

    response.status(500).json({
      error: "AI backend failed.",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Project T.I.T.A.N backend running on port ${port}`);
});
