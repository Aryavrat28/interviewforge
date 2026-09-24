import express from "express";
import { jsonrepair } from "jsonrepair";
import path from "path";
import { fileURLToPath } from "url";
import {
  loadModel,
  completion,
  unloadModel,
  QWEN3_600M_INST_Q4
} from "@qvac/sdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

let modelId = null;

async function ensureModelLoaded() {
  if (modelId) return modelId;

  console.log("Loading Qwen3 0.6B Q4...");

  modelId = await loadModel({
    modelSrc: QWEN3_600M_INST_Q4,
    modelType: "llamacpp-completion",
    modelConfig: { ctx_size: 4096 }
  });

  console.log("Model loaded:", modelId);

  return modelId;
}

app.get("/health", async (req, res) => {
  res.json({
    status: "ok",
    qvac: true,
    local: true,
    modelLoaded: Boolean(modelId),
    app: "InterviewForge",
    version: "1.0.0",
    model: "Qwen3 600M",
    sdk: "@qvac/sdk 0.19.1"
  });
});

app.post("/api/interview", async (req, res) => {
  try {
    const {
      role,
      jobDescription,
      experienceLevel,
      skills,
      weakAreas
    } = req.body;

    if (!role || !jobDescription) {
      return res.status(400).json({
        error: "Role and job description are required."
      });
    }

    const id = await ensureModelLoaded();

    const prompt = `/no_think

You are an interview preparation assistant.

Create a practical interview preparation plan based on the information below.

Role:
${role}

Job Description:
${jobDescription}

Experience Level:
${experienceLevel || "Not specified"}

Skills to Test:
${skills || "Not specified"}

Weak Areas:
${weakAreas || "Not specified"}

Return ONLY valid JSON using exactly this structure:

{
  "role": "string",
  "likelyQuestions": [
    {
      "question": "string",
      "type": "Technical/Behavioral/General",
      "whyAsked": "string"
    }
  ],
  "technicalTopics": [
    {
      "topic": "string",
      "priority": "High/Medium/Low",
      "reason": "string"
    }
  ],
  "answerGuidance": [
    {
      "question": "string",
      "approach": "string",
      "keyPoints": ["string"]
    }
  ],
  "followUpQuestions": [
    "string"
  ],
  "questionsForInterviewer": [
    "string"
  ],
  "preparationChecklist": [
    "string"
  ]
}

Generate useful and realistic interview preparation content.
Do not include markdown.
Do not include commentary outside the JSON.`;

    const run = completion({
      modelId: id,
      history: [
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true
    });

    const final = await run.final;

    const text =
      final?.contentText ||
      final?.raw?.fullText ||
      "";

    if (!text) {
      return res.status(500).json({
        error: "The local model returned an empty response."
      });
    }

    let cleaned = text.trim();

    if (cleaned.startsWith("```")) {
      cleaned = cleaned
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
    }

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    const interviewPlan = JSON.parse(jsonrepair(cleaned));

    res.json(interviewPlan);
  } catch (error) {
    console.error("InterviewForge error:", error);

    res.status(500).json({
      error: "Failed to generate interview plan.",
      details: error.message
    });
  }
});

async function shutdown() {
  if (modelId) {
    try {
      await unloadModel({
        modelId,
        clearStorage: false
      });
    } catch (error) {
      console.error("Model unload error:", error.message);
    }
  }

  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.listen(PORT, () => {
  console.log(`InterviewForge running at http://localhost:${PORT}`);
});
