require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function buildFallbackSummary(payload) {
  const {
    shipmentId,
    source,
    destination,
    priority,
    eta,
    shipmentValue,
    weight,
    recommendedRoute,
    alternateRoute,
    riskScore,
    riskStatus
  } = payload;

  const routeName = recommendedRoute?.name || "Recommended route";
  const altName = alternateRoute?.name || "Alternate route";
  const routeRisk = recommendedRoute?.riskScore ?? "N/A";
  const altRisk = alternateRoute?.riskScore ?? "N/A";
  const routeTime = recommendedRoute?.time ?? "N/A";
  const altTime = alternateRoute?.time ?? "N/A";

  return [
    {
      type: "ok",
      title: `Shipment ${shipmentId || "draft load"} should move via ${routeName}.`,
      meta: `${source} → ${destination} · Priority: ${priority || "risk"}`
    },
    {
      type: "alert",
      title: `${altName} has higher disruption exposure because it crosses more sensitive corridors.`,
      meta: `Route risk comparison: ${routeName} ${routeRisk}/100 vs ${altName} ${altRisk}/100`
    },
    {
      type: "info",
      title: `The safer choice adds limited transit time while materially reducing expected disruption.`,
      meta: `ETA trade-off: ${routeTime} hrs vs ${altTime} hrs · Shipment risk: ${riskScore}/100 (${riskStatus})`
    },
    {
      type: "ok",
      title: `Dispatcher action: approve ${routeName}, monitor event feeds, and keep buffer for urban entry delays.`,
      meta: `ETA: ${eta || "not set"} · Value: ₹${shipmentValue || "N/A"} · Weight: ${weight || "N/A"} tons`
    }
  ];
}

app.post("/api/explain", async (req, res) => {
  try {
    const payload = req.body || {};

    if (!genAI || !apiKey) {
      return res.json({
        mode: "fallback",
        summary: buildFallbackSummary(payload)
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are RouteGuard AI, a logistics risk assistant.

Return ONLY valid JSON in this exact format:
{
  "summary": [
    { "type": "ok", "title": "...", "meta": "..." },
    { "type": "alert", "title": "...", "meta": "..." },
    { "type": "info", "title": "...", "meta": "..." },
    { "type": "ok", "title": "...", "meta": "..." }
  ]
}

Context:
${JSON.stringify(payload, null, 2)}

Rules:
- Keep it concise and professional.
- Focus on dispatcher guidance.
- Compare recommended route vs alternate route.
- No markdown.
- No explanation outside JSON.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "");

    const parsed = JSON.parse(cleaned);

    return res.json({
      mode: "gemini",
      summary: parsed.summary || buildFallbackSummary(payload)
    });
  } catch (error) {
    return res.json({
      mode: "fallback",
      summary: buildFallbackSummary(req.body || {}),
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`RouteGuard AI running on http://localhost:${PORT}`);
});