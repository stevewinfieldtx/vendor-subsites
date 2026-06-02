/**
 * AI advisor endpoint. Proxies the browser to TDE /agent/query so the TDE key
 * never reaches the client. Grounded answers come from the vendor's collection.
 * Falls back to a helpful canned reply when TDE is not configured (mock mode).
 */
import { NextResponse } from "next/server";
import { getTdeClient, type AgentQueryResponse } from "@/lib/tde";

export const runtime = "nodejs";

function normalize(res: AgentQueryResponse): string {
  return (
    res.answer ??
    res.response ??
    (typeof res === "string" ? (res as string) : "") ??
    ""
  );
}

export async function POST(req: Request) {
  let body: { question?: string; collections?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = body.question?.trim();
  const collections = body.collections?.trim();
  if (!question || !collections) {
    return NextResponse.json(
      { error: "question and collections are required" },
      { status: 400 },
    );
  }

  const client = getTdeClient();
  if (!client) {
    // Mock mode — keep the experience working before TDE is wired.
    return NextResponse.json({
      answer:
        "I'm running in preview mode without the live knowledge base, so I can't answer specifics yet. Once connected, I'll answer grounded questions about fit, deployment, pricing, and support. In the meantime, book a call and a specialist will follow up.",
      mock: true,
    });
  }

  try {
    const res = await client.agentQuery({ question, collections });
    const answer = normalize(res);
    return NextResponse.json({
      answer:
        answer ||
        "I couldn't find a grounded answer for that. A specialist can help — would you like to book a call?",
      references: res.references ?? [],
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "advisor_unavailable",
        answer:
          "The advisor is temporarily unavailable. Please try again shortly, or book a call and we'll follow up.",
        detail: (err as Error).message,
      },
      { status: 502 },
    );
  }
}
