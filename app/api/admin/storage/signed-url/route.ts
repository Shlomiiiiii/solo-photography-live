import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { createSignedReadUrl } from "@/lib/server/storage";

export async function GET(request: NextRequest) {
  await requireAdmin();
  const path = request.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path." }, { status: 400 });
  if (path.includes("..")) return NextResponse.json({ error: "Invalid path." }, { status: 400 });

  const signed = await createSignedReadUrl(path, 15);
  return NextResponse.json(signed);
}

