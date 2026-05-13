import { NextResponse } from "next/server";
import { allMints } from "@/lib/countries";
import { fetchTokenSummaries } from "@/lib/dexscreener";

export const revalidate = 30;

export async function GET() {
  const mints = allMints();
  if (mints.length === 0) {
    return NextResponse.json({ updatedAt: Date.now(), tokens: {} });
  }
  try {
    const tokens = await fetchTokenSummaries(mints);
    return NextResponse.json({ updatedAt: Date.now(), tokens });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json(
      { updatedAt: Date.now(), tokens: {}, error: message },
      { status: 502 },
    );
  }
}
