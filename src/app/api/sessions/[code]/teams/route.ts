import { NextResponse } from "next/server";
import { store } from "@/lib/store";

type Context = { params: Promise<{ code: string }> };

export async function POST(request: Request, { params }: Context) {
  const { code } = await params;
  let body: { name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (typeof body.name !== "string") return NextResponse.json({ error: "Hãy nhập tên đội." }, { status: 400 });
  try {
    const team = await store.upsertTeam(code, body.name);
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể vào phiên." }, { status: 400 });
  }
}
