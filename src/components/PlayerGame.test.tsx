// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { applyCompletionTimes, type Answers, type Session, type TeamProgress } from "@/lib/game";
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
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it("chuyển một thẻ giữa các cột, cập nhật tiến độ và không để thẻ bị trùng", async () => {
    const user = userEvent.setup();
    let savedTeam = makeTeam();
    vi.stubGlobal("fetch", vi.fn(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        const payload = JSON.parse(String(options.body)) as { answers: Answers };
        savedTeam = applyCompletionTimes(makeTeam(payload.answers), Date.now());
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

  it("chỉ nộp và mở Khóa 2 khi sáu thẻ đã được xếp đúng", async () => {
    const user = userEvent.setup();
    let savedTeam = makeTeam();
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        const payload = JSON.parse(String(options.body)) as { answers: Answers };
        savedTeam = applyCompletionTimes(makeTeam(payload.answers), Date.now());
        return { ok: true, json: async () => ({ team: savedTeam }) } as Response;
      }
      return { ok: true, json: async () => ({ session: makeSession(savedTeam) }) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.setItem("three-locks:ABC123", savedTeam.id);
    render(<PlayerGame code="ABC123" />);

    const submit = await screen.findByRole("button", { name: "Nộp Khóa 1" });
    expect(submit).toBeDisabled();

    const moveTo = async (cardName: string, destination: string) => {
      await user.click(screen.getByRole("button", { name: cardName }));
      await user.click(screen.getByRole("button", { name: `Xếp thẻ đã chọn vào ${destination}` }));
    };
    for (const card of ["Nguồn gốc tự nhiên, kinh tế – xã hội", "Nguồn gốc nhận thức", "Nguồn gốc tâm lý", "Tính lịch sử", "Tính quần chúng", "Tính chính trị"]) {
      await moveTo(card, "Nguồn gốc của tôn giáo");
    }

    expect(submit).toBeEnabled();
    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "PATCH")).toHaveLength(0);
    await user.click(submit);
    expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng, hãy kiểm tra lại các thẻ");

    for (const card of ["Tính lịch sử", "Tính quần chúng", "Tính chính trị"]) {
      await moveTo(card, "Tính chất của tôn giáo");
    }
    await user.click(submit);

    await waitFor(() => {
      expect(screen.getByText("Chìa khóa 1 đã mở!")).toBeVisible();
    });
    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "PATCH")).toHaveLength(1);
  });

  it("kéo thẻ vào cột đích mà không lưu đáp án trước khi nộp", async () => {
    const dataTransfer = {
      data: new Map<string, string>(),
      effectAllowed: "",
      setData(type: string, value: string) { this.data.set(type, value); },
      getData(type: string) { return this.data.get(type) ?? ""; },
    };
    let savedTeam = makeTeam();
    const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") throw new Error("Không được lưu khi chỉ kéo thẻ.");
      return { ok: true, json: async () => ({ session: makeSession(savedTeam) }) } as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    window.localStorage.setItem("three-locks:ABC123", savedTeam.id);
    render(<PlayerGame code="ABC123" />);

    const card = await screen.findByRole("button", { name: "Nguồn gốc nhận thức" });
    const origins = screen.getByRole("region", { name: "Nguồn gốc của tôn giáo (0/3)" });
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragEnter(origins, { dataTransfer });
    expect(origins).toHaveClass("is-drop-target");
    fireEvent.drop(origins, { dataTransfer });

    expect(within(origins).getByRole("button", { name: "Nguồn gốc nhận thức" })).toBeVisible();
    expect(fetchMock.mock.calls.filter(([, options]) => options?.method === "PATCH")).toHaveLength(0);
  });

  it("không khóa lại Khóa 2 khi phản hồi làm mới cũ đến sau khi nộp Khóa 1", async () => {
    vi.useFakeTimers();
    const correctLockOne: Answers = {
      lockOne: { natural: "origins", cognitive: "origins", psychological: "origins", historical: "properties", mass: "properties", political: "properties" },
      lockTwo: {},
      lockThree: {},
    };
    const beforeSubmit = makeTeam(correctLockOne);
    let resolveStaleRefresh: ((value: Response) => void) | undefined;
    const staleRefresh = new Promise<Response>((resolve) => { resolveStaleRefresh = resolve; });
    let getCount = 0;
    vi.stubGlobal("fetch", vi.fn(async (_url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        return { ok: true, json: async () => ({ team: applyCompletionTimes(beforeSubmit, Date.now()) }) } as Response;
      }
      getCount += 1;
      if (getCount === 1) return { ok: true, json: async () => ({ session: makeSession(beforeSubmit) }) } as Response;
      return staleRefresh;
    }));
    window.localStorage.setItem("three-locks:ABC123", beforeSubmit.id);
    render(<PlayerGame code="ABC123" />);

    await act(async () => { await Promise.resolve(); });
    const submit = screen.getByRole("button", { name: "Nộp Khóa 1" });
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    await act(async () => { fireEvent.click(submit); await Promise.resolve(); });
    expect(screen.getByRole("button", { name: "chỉ tôn trọng người có tín ngưỡng" })).toBeEnabled();

    await act(async () => {
      resolveStaleRefresh?.({ ok: true, json: async () => ({ session: makeSession(beforeSubmit) }) } as Response);
      await Promise.resolve();
    });
    expect(screen.getByRole("button", { name: "chỉ tôn trọng người có tín ngưỡng" })).toBeEnabled();
  });
});
