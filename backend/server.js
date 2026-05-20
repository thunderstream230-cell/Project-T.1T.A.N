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
app.use(express.json({ limit: "2mb" }));

app.get("/", (req, res) => {
  res.json({ status: "Project T.I.T.A.N backend online" });
});

app.post("/chat", async (req, res) => {
  try {
    const {
      message,
      memory = "",
      recentResults = [],
      knowledgeSummary = {},
      history = []
    } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Missing message." });
    }

    const systemPrompt = `
You are T.I.T.A.N, a futuristic AI companion for a Minecraft Bedrock addon project.
Answer questions about powers, obtainment methods, item IDs, scripts, mechanics, suits, injections, beams, flight, cooldowns, and pack systems.

Use the provided local search results when available.
Do not invent exact crafting recipes if the data does not include them.
Be direct and practical.

Local memory:
${memory || "None"}

Knowledge summary:
${JSON.stringify(knowledgeSummary, null, 2)}

Most relevant extracted results:
${JSON.stringify(recentResults.slice(0, 12), null, 2)}
`.trim();

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-8).map(item => ({
        role: item.role === "user" ? "user" : "assistant",
        content: String(item.content || "").slice(0, 3500)
      })),
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.45
    });

    res.json({
      reply: completion.choices?.[0]?.message?.content || "No response generated."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Backend failed.",
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Project T.I.T.A.N backend running on port ${port}`);
});
