// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Answers, Session, TeamProgress } from "@/lib/game";
import { PlayerGame } from "./PlayerGame";

const initialAnswers: Answers = { lockOne: {}, lockTwo: {}, lockThree: {} };

function makeTeam(answers = initialAnswers): TeamProgress {
  return {
    id: "team-1",
    name: "Đội Sao Mai",
    answers,
    hintCount: 0,
    completedAt: {},
    updatedAt: 1,
  };
}

function makeSession(team: TeamProgress): Session {
  return {
    code: "ABC123",
    status: "active",
    createdAt: 1,
    startsAt: 1,
    endsAt: Date.now() + 60_000,
    teams: [team],
  };
}

describe("PlayerGame – Khóa 1", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("chuyển một thẻ giữa các cột, cập nhật tiến độ và không để thẻ bị trùng", async () => {
    const user = userEvent.setup();
    let savedTeam = makeTeam();
    vi.stubGlobal("fetch", vi.fn(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        const payload = JSON.parse(String(options.body)) as { answers: Answers };
        savedTeam = makeTeam(payload.answers);
        return { ok: true, json: async () => ({ team: savedTeam }) } as Response;
      }
      return { ok: true, json: async () => ({ session: makeSession(savedTeam) }) } as Response;
    }));
    window.localStorage.setItem("three-locks:ABC123", savedTeam.id);

    const { container } = render(<PlayerGame code="ABC123" />);

    const unclassified = await screen.findByRole("region", { name: "Chưa phân loại (6/6)" });
    expect(within(unclassified).getAllByRole("button")).toHaveLength(7);
    expect(screen.getByText("Đã xếp 0/6 thẻ")).toBeVisible();

    const card = within(unclassified).getByRole("button", { name: "Nguồn gốc nhận thức" });
    card.focus();
    await user.keyboard("{Enter}");
    expect(container.querySelector(".move-status")).toHaveTextContent("Đang di chuyển: Nguồn gốc nhận thức");

    await user.click(screen.getByRole("button", { name: "Xếp thẻ đã chọn vào Nguồn gốc của tôn giáo" }));

    const origins = await screen.findByRole("region", { name: "Nguồn gốc của tôn giáo (1/3)" });
    expect(within(origins).getByRole("button", { name: "Nguồn gốc nhận thức" })).toBeVisible();
    expect(within(unclassified).queryByRole("button", { name: "Nguồn gốc nhận thức" })).not.toBeInTheDocument();
    expect(screen.getByText("Đã xếp 1/6 thẻ")).toBeVisible();

    await user.click(within(origins).getByRole("button", { name: "Nguồn gốc nhận thức" }));
    await user.click(screen.getByRole("button", { name: "Xếp thẻ đã chọn vào Tính chất của tôn giáo" }));

    await waitFor(() => {
      expect(screen.getByRole("region", { name: "Tính chất của tôn giáo (1/3)" })).toHaveTextContent("Nguồn gốc nhận thức");
    });
    expect(screen.getByText("Đã xếp 1/6 thẻ")).toBeVisible();
  });
});
