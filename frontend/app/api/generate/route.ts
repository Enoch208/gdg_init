import { generateInvoice } from "@/lib/gemini";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { description } = (await request.json()) as { description?: string };
    if (!description || typeof description !== "string" || description.trim().length < 3) {
      return Response.json(
        { error: "Please describe the work you did in a sentence or two." },
        { status: 400 }
      );
    }

    const invoice = await generateInvoice(description);
    return Response.json(invoice);
  } catch (err) {
    console.error("[api/generate] error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json(
      { error: `Couldn't generate invoice: ${message}` },
      { status: 500 }
    );
  }
}
