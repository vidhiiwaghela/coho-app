import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT =
  "You are an expert translator for an Indian housing society app. Translate the given notice text accurately into the requested language (hi: Hindi, mr: Marathi, gu: Gujarati). Return ONLY the translated string with no explanations or conversational preamble.";

async function sendGroqRequest(apiKey: string, model: string, userContent: string) {
  return await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;
    const targetLanguage = body.targetLanguage || body.targetLang;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field." },
        { status: 400 }
      );
    }

    if (!targetLanguage || !["hi", "mr", "gu"].includes(targetLanguage)) {
      return NextResponse.json(
        { error: "Invalid targetLanguage. Must be 'hi', 'mr', or 'gu'." },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.warn("GROQ_API_KEY missing in environment variables.");
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured.", translatedText: text },
        { status: 500 }
      );
    }

    const userContent = `Translate the following text into target language '${targetLanguage}':\n\n${text}`;

    // 1. Primary model: llama-3.3-70b-versatile
    let res = await sendGroqRequest(groqApiKey, "llama-3.3-70b-versatile", userContent);

    // 2. Fallback to active Groq LLM if llama-3.3-70b-versatile returns model_not_found (404)
    if (!res.ok && res.status === 404) {
      res = await sendGroqRequest(groqApiKey, "openai/gpt-oss-120b", userContent);
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.warn("Groq translation error:", res.status, errData);
      return NextResponse.json(
        {
          error: `Groq error: ${res.statusText}`,
          translatedText: text,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || "";

    if (
      !rawContent ||
      /^[a-z]{2,4}[.:]?$/i.test(rawContent) ||
      (rawContent.length < 4 && text.length > 10)
    ) {
      console.warn("[Translate API] Rejected invalid Groq output:", rawContent);
      return NextResponse.json(
        { error: "Invalid translation output from provider", translatedText: text },
        { status: 200 }
      );
    }

    return NextResponse.json({ translatedText: rawContent }, { status: 200 });
  } catch (error: any) {
    console.error("Translation route unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
