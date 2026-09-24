import { describe, expect, it } from "vitest";
import { createMemoryStore } from "./store";

describe("lưu phiên chơi", () => {
  it("giữ đội đã đăng ký và cập nhật tiến trình", async () => {
    const store = createMemoryStore();
    const session = await store.createSession();
    const team = await store.upsertTeam(session.code, "Đội Mặt Trời");
    const saved = await store.saveTeam(session.code, { ...team, hintCount: 1 });

    expect(saved.hintCount).toBe(1);
    expect((await store.getSession(session.code))?.teams[0]).toMatchObject({
      id: team.id,
      name: "Đội Mặt Trời",
      hintCount: 1,
    });
  });

  it("trả lại cùng một đội khi tên được đăng ký lần nữa", async () => {
    const store = createMemoryStore();
    const session = await store.createSession();
    const first = await store.upsertTeam(session.code, "Đội Sao");
    const second = await store.upsertTeam(session.code, "  đội sao  ");
    expect(second.id).toBe(first.id);
  });
});
