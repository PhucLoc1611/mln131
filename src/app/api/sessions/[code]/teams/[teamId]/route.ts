import { NextResponse } from "next/server";
import { applyCompletionTimes, canSubmitAnswers, isValidAnswers } from "@/lib/game";
import { store } from "@/lib/store";

type Context = { params: Promise<{ code: string; teamId: string }> };

export async function PATCH(request: Request, { params }: Context) {
  const { code, teamId } = await params;
  let body: { answers?: unknown; hintUsed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }
  if (body.answers !== undefined && !isValidAnswers(body.answers)) {
    return NextResponse.json({ error: "Đáp án không hợp lệ." }, { status: 400 });
  }
  const session = await store.getSession(code);
  if (!session) return NextResponse.json({ error: "Không tìm thấy phiên chơi." }, { status: 404 });
  if (!canSubmitAnswers(session.status, session.endsAt)) return NextResponse.json({ error: "Phiên chơi chưa mở hoặc đã kết thúc." }, { status: 409 });
  const current = session.teams.find((team) => team.id === teamId);
  if (!current) return NextResponse.json({ error: "Không tìm thấy đội chơi." }, { status: 404 });
  const updated = applyCompletionTimes(
    {
      ...current,
      answers: body.answers ?? current.answers,
      hintCount: current.hintCount + (body.hintUsed ? 1 : 0),
    },
    Date.now(),
  );
  await store.saveTeam(code, updated);
  return NextResponse.json({ team: updated });
}
