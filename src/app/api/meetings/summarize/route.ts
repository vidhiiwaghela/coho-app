import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, minutes_text, title } = body;

    let textToSummarize = minutes_text;

    // 1. If minutes_text not provided directly, look up the meeting in Supabase
    if (!textToSummarize && id && isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("meetings")
        .select("minutes_text, minutes_content, title")
        .eq("id", id)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Meeting record not found", summary_status: "failed" },
          { status: 404 }
        );
      }
      textToSummarize = data.minutes_text || data.minutes_content;
    }

    if (!textToSummarize || typeof textToSummarize !== "string" || !textToSummarize.trim()) {
      return NextResponse.json(
        { error: "Missing minutes text to summarize", summary_status: "failed" },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      // If Groq API key is not configured, mark status as failed
      if (id && isSupabaseConfigured && supabase) {
        await supabase
          .from("meetings")
          .update({
            summary_status: "failed",
            summary_text: "Groq API key not configured. Add GROQ_API_KEY to your environment variables.",
          })
          .eq("id", id);
      }

      return NextResponse.json(
        {
          error: "GROQ_API_KEY environment variable is not configured",
          summary_status: "failed",
          summary_text: null,
        },
        { status: 500 }
      );
    }

    // 2. Call Groq API with llama-3.3-70b-versatile
    const systemPrompt = `You are a professional, neutral assistant summarizing residential housing society (RWA/CHS) meeting minutes.
Produce a concise, neutral summary covering:
- Key decisions made
- Action items (with responsible person/assignee and deadlines where mentioned)
- Important dates and milestones mentioned

Rules:
- Strictly factual: do not speculate, include personal opinions, or extrapolate beyond the provided text.
- Clear formatting: use bullet points and bold section headers for readability.
- Keep it concise and accessible to all residents.`;

    const userPrompt = `Meeting Title: ${title || "Society Meeting"}

Minutes:
${textToSummarize}

Please provide the concise, neutral summary:`;

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API error response:", errorText);

      if (id && isSupabaseConfigured && supabase) {
        await supabase
          .from("meetings")
          .update({
            summary_status: "failed",
            summary_text: `Groq API error: ${groqResponse.statusText}`,
          })
          .eq("id", id);
      }

      return NextResponse.json(
        {
          error: `Groq API failed: ${groqResponse.statusText}`,
          summary_status: "failed",
          details: errorText,
        },
        { status: groqResponse.status }
      );
    }

    const groqData = await groqResponse.json();
    const summaryText = groqData.choices?.[0]?.message?.content?.trim() || "";

    if (!summaryText) {
      throw new Error("Empty summary received from Groq API");
    }

    // 3. Save summary_text and set summary_status to 'done' in Supabase
    if (id && isSupabaseConfigured && supabase) {
      await supabase
        .from("meetings")
        .update({
          summary_text: summaryText,
          summary_status: "done",
        })
        .eq("id", id);
    }

    return NextResponse.json({
      success: true,
      summary_text: summaryText,
      summary_status: "done",
    });
  } catch (error: any) {
    console.error("Meeting summarization error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Internal server error during summarization",
        summary_status: "failed",
      },
      { status: 500 }
    );
  }
}
