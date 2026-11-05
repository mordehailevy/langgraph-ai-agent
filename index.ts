import "dotenv/config";
import express from "express";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import getWeather from "./tools/getWeather.js";
import getProducts from "./tools/getProducts.js";

const AGENT_TIMEOUT_MS = 30_000;
const MAX_QUESTION_LENGTH = 1_000;

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.static("frontend"));

const model = new ChatOpenAI({
  model: process.env.LLM_MODEL || "gpt-4o-mini",
  temperature: 0,
  apiKey: process.env.LLM_API_KEY ?? "",
  configuration: { baseURL: process.env.LLM_BASE_URL || undefined },
});

const agent = createReactAgent({
  llm: model,
  tools: [getWeather, getProducts],
});

const SYSTEM_PROMPT =
  "You are a helpful assistant. Use the get_weather tool for questions about the current weather in a city, " +
  "and the getProducts tool for questions about the product catalog. Never invent data: if a tool fails, say so. " +
  "Keep answers short and friendly, with a few emojis.";

app.post("/ask", async (req, res) => {
  const question: unknown = req.body?.question;
  if (typeof question !== "string" || question.trim() === "") {
    res.status(400).json({ error: "Please send a non-empty question." });
    return;
  }
  if (question.length > MAX_QUESTION_LENGTH) {
    res.status(400).json({ error: `Questions are limited to ${MAX_QUESTION_LENGTH} characters.` });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AGENT_TIMEOUT_MS);
  try {
    const result = await agent.invoke(
      {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question.trim() },
        ],
      },
      { signal: controller.signal },
    );
    const last = result.messages[result.messages.length - 1];
    const content = last?.content;
    const answer = typeof content === "string" ? content : JSON.stringify(content ?? "");
    res.json({ answer });
  } catch (err) {
    if (controller.signal.aborted) {
      res.status(504).json({ error: "The agent took too long to answer. Please try again." });
    } else {
      console.error("Agent error:", err);
      res.status(500).json({ error: "The agent failed to answer. Please try again." });
    }
  } finally {
    clearTimeout(timeout);
  }
});

const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`🚀 Agent HTTP server listening on http://localhost:${PORT}`);
});
