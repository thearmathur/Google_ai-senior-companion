import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  isGeminiConfigured,
  handleChatResponse,
  handleAnalyzeScam,
  handleExplainDocument,
  handleGuidedTask,
  handleExtractReminder,
  handleProactiveBriefing
} from "./server/gemini.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing with reasonable limit for document snapshots
  app.use(express.json({ limit: "25mb" }));

  // --- API ROUTES FIRST ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "AI Senior Companion", timestamp: new Date().toISOString() });
  });

  app.get("/api/status", (req, res) => {
    const configured = isGeminiConfigured();
    res.json({
      connected: configured,
      model: "gemini-3.8-flash",
      hasKey: configured
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userName, language } = req.body;
      const result = await handleChatResponse(messages || [], userName || "Mr. Sharma", language || "English");
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/chat:", err);
      res.status(500).json({ error: err.message || "Failed to generate chat response" });
    }
  });

  app.post("/api/explain", async (req, res) => {
    try {
      const { text, imageBase64, imageMimeType, language } = req.body;
      const result = await handleExplainDocument(
        text || "",
        imageBase64,
        imageMimeType,
        language || "English"
      );
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/explain:", err);
      res.status(500).json({ error: err.message || "Failed to explain document" });
    }
  });

  app.post("/api/scam", async (req, res) => {
    try {
      const { text, language } = req.body;
      const result = await handleAnalyzeScam(text || "", language || "English");
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/scam:", err);
      res.status(500).json({ error: err.message || "Failed to analyze message" });
    }
  });

  app.post("/api/guided", async (req, res) => {
    try {
      const { taskName, language } = req.body;
      const result = await handleGuidedTask(taskName || "Pay an electricity bill", language || "English");
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/guided:", err);
      res.status(500).json({ error: err.message || "Failed to generate guided task" });
    }
  });

  app.post("/api/reminders/extract", async (req, res) => {
    try {
      const { text, language } = req.body;
      const result = await handleExtractReminder(text || "", language || "English");
      res.json(result);
    } catch (err: any) {
      console.error("Error in /api/reminders/extract:", err);
      res.status(500).json({ error: err.message || "Failed to extract reminder" });
    }
  });

  app.post("/api/briefing", async (req, res) => {
    try {
      const { userName, reminders, language } = req.body;
      const result = await handleProactiveBriefing(
        userName || "Mr. Sharma",
        reminders || [],
        language || "English"
      );
      res.json({ briefing: result });
    } catch (err: any) {
      console.error("Error in /api/briefing:", err);
      res.status(500).json({ error: err.message || "Failed to generate briefing" });
    }
  });

  // --- VITE MIDDLEWARE (Development) vs STATIC SERVING (Production) ---
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Senior Companion server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
