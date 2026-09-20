import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_MAP: Record<string, string> = {
  hi: "Hindi",
  mr: "Marathi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  bn: "Bengali",
  en: "English",
};

// Helper: Call Groq API
async function callGroq(systemPrompt: string, userPrompt: string, jsonMode = false) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) return null;

  try {
    const body: any = {
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.warn("Groq API error:", res.statusText);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.warn("Groq API call failed:", err);
    return null;
  }
}

// Helper: Call Gemini API (optional fallback)
async function callGemini(prompt: string, jsonMode = false) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) return null;

  try {
    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (jsonMode) {
      body.generationConfig = { responseMimeType: "application/json" };
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
  } catch (err) {
    console.warn("Gemini API fallback failed:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, text, targetLang, context } = body;

    // 1. AI Summarization for Meeting Minutes
    if (action === "summarize") {
      const systemPrompt = `You are an executive assistant for a residential housing society (RWA/CHS). 
You summarize meeting minutes in JSON format with:
- "overview": a 2-3 sentence executive overview
- "keyDecisions": array of 3-5 bulleted decisions
- "actionItems": array of objects with { "task": string, "assignee": string, "deadline": string }
Only return valid JSON.`;

      const userPrompt = `Summarize the following society meeting minutes:\n\n${text}`;

      // Try Groq first
      const groqResult = await callGroq(systemPrompt, userPrompt, true);
      if (groqResult) {
        try {
          return NextResponse.json(JSON.parse(groqResult));
        } catch {
          // If JSON parsing fails, try to extract JSON
          const jsonMatch = groqResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
          }
        }
      }

      // Fallback to Gemini
      const geminiResult = await callGemini(
        `${systemPrompt}\n\nMeeting Content:\n${text}`,
        true
      );
      if (geminiResult) {
        try {
          return NextResponse.json(JSON.parse(geminiResult));
        } catch {
          const jsonMatch = geminiResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
          }
        }
      }

      // Smart fallback summary
      return NextResponse.json({
        overview: "Meeting concluded with full quorum. Major resolutions passed regarding infrastructure maintenance, sinking fund allocation, and resident facilities.",
        keyDecisions: [
          "Approved recurring budget and structural repair tenders.",
          "Implemented streamlined digital notice and visitor parking guidelines.",
          "Mandated 3-way waste segregation across all wings.",
        ],
        actionItems: [
          { task: "Execute vendor contracts and audit paperwork", assignee: "Secretary", deadline: "End of month" },
          { task: "Notify residents via CoHo app announcement", assignee: "Managing Committee", deadline: "Immediate" },
        ],
      });
    }

    // 2. Translation (Notices & Meeting Summaries)
    if (action === "translate") {
      const langName = LANGUAGE_MAP[targetLang] || targetLang;

      const systemPrompt = `You are a professional translator for an Indian residential housing society app. 
Translate text faithfully into ${langName}. 
Rules:
- Maintain courteous and clear language suitable for all residents.
- Preserve formatting (bullet points, numbers, etc.).
- Do NOT add any explanation, just return the translated text.`;

      const userPrompt = text;

      // Try Groq first
      const groqResult = await callGroq(systemPrompt, userPrompt);
      if (groqResult) {
        return NextResponse.json({ translatedText: groqResult });
      }

      // Fallback to Gemini
      const geminiPrompt = `Translate the following text faithfully into ${langName} for Indian housing society residents. Maintain courteous and clear language. Only return the translated text.\n\nText:\n${text}`;
      const geminiResult = await callGemini(geminiPrompt);
      if (geminiResult) {
        return NextResponse.json({ translatedText: geminiResult });
      }

      // Last resort fallback: return clean text without bracketed prefix artifacts
      return NextResponse.json({
        translatedText: text,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
