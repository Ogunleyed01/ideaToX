import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt, category } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "A valid prompt is required." }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    if (apiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an elite software architect for IdeaToX, an open-source technical specification platform.
Transform this rough 1-line idea into a structured, production-ready specification:
"${cleanPrompt}"

Respond with ONLY valid JSON with no markdown backticks, matching this exact schema:
{
  "title": "Clear Technical Title (Max 6 words)",
  "hook": "Compelling 1-sentence hook explaining value (Max 140 chars)",
  "problem_statement": "2-3 sentences explaining exactly who feels the pain, why current tools fail, and the structural friction.",
  "mvp_features": [
    "Feature 1 - core workflow",
    "Feature 2 - data / storage",
    "Feature 3 - integration / notification",
    "Feature 4 - validation / security"
  ],
  "category": "web" | "mobile" | "ai" | "cli" | "hardware" | "extension",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "target_region": "Global",
  "collab_status": "open" | "seeking_cofounder",
  "suggested_stack": ["Tech1", "Tech2", "Tech3", "Tech4"]
}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn("Gemini API call failed, falling back to heuristic synthesizer:", err);
      }
    }

    // High-quality deterministic synthesizer fallback
    const synthesized = synthesizeSpecification(cleanPrompt, category);
    return NextResponse.json(synthesized);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to expand specification with AI." },
      { status: 500 }
    );
  }
}

function synthesizeSpecification(prompt: string, hintCategory?: string) {
  const cleanPrompt = prompt.trim();
  const p = cleanPrompt.toLowerCase();

  let category: "web" | "mobile" | "ai" | "cli" | "hardware" | "extension" = "web";
  if (p.includes("cli") || p.includes("terminal") || p.includes("bash") || p.includes("git")) category = "cli";
  else if (p.includes("hardware") || p.includes("iot") || p.includes("esp32") || p.includes("solar") || p.includes("sensor")) category = "hardware";
  else if (p.includes("extension") || p.includes("chrome") || p.includes("tab") || p.includes("browser")) category = "extension";
  else if (p.includes("mobile") || p.includes("pwa") || p.includes("ios") || p.includes("android")) category = "mobile";
  else if (p.includes("ai") || p.includes("llm") || p.includes("agent") || p.includes("rag") || p.includes("vision")) category = "ai";
  else if (hintCategory) category = hintCategory as any;

  let difficulty: "beginner" | "intermediate" | "advanced" = "intermediate";
  if (category === "cli" || category === "extension") difficulty = "beginner";
  if (category === "hardware" || (category === "ai" && p.includes("cluster"))) difficulty = "advanced";

  const cleanTitle = prompt
    .split(/[:\-–—]/)[0]
    .replace(/[^\w\s]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Modular Systems Architecture";

  return {
    title: cleanTitle.length > 3 ? cleanTitle : "Distributed Workflow Coordinator",
    hook: `A lightweight, zero-overhead solution for ${cleanPrompt.toLowerCase().replace(/\.$/, "")}.`,
    problem_statement: `Users repeatedly encounter unnecessary friction when handling ${cleanPrompt.toLowerCase()}. Existing centralized alternatives suffer from vendor lock-in, high latency, or complex manual setup that frustrates developers and end-users alike.`,
    mvp_features: [
      `Instant setup with zero-config local initialization`,
      `Resilient state synchronization with offline fallback support`,
      `Structured JSON/Telemetry export with cryptographic verification`,
      `Real-time visual dashboard and webhook notification triggers`,
    ],
    category,
    difficulty,
    target_region: "Global",
    collab_status: "open",
    suggested_stack:
      category === "ai"
        ? ["FastAPI", "Python 3.12", "Redis 7.2", "Google Gemini API"]
        : category === "cli"
        ? ["Node.js", "TypeScript", "Commander.js", "SQLite"]
        : category === "hardware"
        ? ["ESP32", "C++", "MQTT", "Next.js", "InfluxDB"]
        : category === "mobile"
        ? ["Next.js", "PWA", "IndexedDB", "Tailwind CSS"]
        : ["Next.js 15", "Supabase", "Tailwind CSS", "TypeScript"],
  };
}
