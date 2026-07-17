import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Public endpoint — LiveChatBot renders on both public pages (homepage, markets,
// helpcenter) and authenticated ones, so this intentionally does not require a
// login token. Keep it that way unless the widget is restricted to logged-in-only pages.
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing 'message' string in body" }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are the AXI Trading assistant. Answer questions about platform features (markets, trading terminal, copy trading, wallet, deposits/withdrawals) clearly and briefly. Explain trading concepts (SL/TP, leverage, equity, margin) factually when asked. Never give personalized financial advice, never suggest specific trades, and never guarantee returns. If asked something outside platform support or general trading education, say you can only help with AXI Trading platform questions.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.4,
      max_tokens: 400,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error("Assistant API error:", err);
    return NextResponse.json({ error: "Assistant request failed" }, { status: 500 });
  }
}
