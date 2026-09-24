import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import type { SessionStatus } from "@/lib/game";

type Context = { params: Promise<{ code: string }> };
const validStatuses: SessionStatus[] = ["active", "announced", "solutions"];

export async function GET(_request: Request, { params }: Context) {
  const { code } = await params;
  const session = await store.getSession(code);
  if (!session) return NextResponse.json({ error: "Không tìm thấy phiên chơi." }, { status: 404 });
  return NextResponse.json({ session });
}

export async function PATCH(request: Request, { params }: Context) {
  const { code } = await params;
  let body: { status?: SessionStatus; endsAt?: number | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Trạng thái phiên không hợp lệ." }, { status: 400 });
  }
  try {
    const session = await store.setSessionState(code, body.status, body.endsAt);
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể cập nhật phiên." }, { status: 404 });
  }
}
