import { describe, expect, it } from "vitest";
import {
  applyCompletionTimes,
  canSubmitAnswers,
  completedLocks,
  isLockOneSolved,
  isLockThreeSolved,
  isLockTwoSolved,
  rankTeams,
  isValidAnswers,
  type TeamProgress,
} from "./game";

const team = (name: string, completedAt: TeamProgress["completedAt"]): TeamProgress => ({
  id: name,
  name,
  answers: { lockOne: {}, lockTwo: {}, lockThree: {} },
  hintCount: 0,
  completedAt,
  updatedAt: 0,
});

describe("quy tắc Ba Khóa", () => {
  it("chỉ mở khóa 1 khi sáu thẻ được xếp chính xác", () => {
    expect(isLockOneSolved({ natural: "origins" })).toBe(false);
    expect(
      isLockOneSolved({
        natural: "origins",
        cognitive: "origins",
        psychological: "origins",
        historical: "properties",
        mass: "properties",
        political: "properties",
      }),
    ).toBe(true);
  });

  it("mở khóa 2 và 3 theo đúng cặp kiến thức", () => {
    expect(isLockTwoSolved({ belief: "respect-both", distinction: "separate-misuse" })).toBe(true);
    expect(isLockTwoSolved({ belief: "same-belief", distinction: "separate-misuse" })).toBe(false);
    expect(isLockThreeSolved({ inclusion: "solidarity", voluntary: "freedom" })).toBe(true);
    expect(isLockThreeSolved({ inclusion: "freedom", voluntary: "solidarity" })).toBe(false);
  });

  it("chỉ lưu thời điểm hoàn thành đầu tiên của mỗi khóa", () => {
    const solvedTeam = team("Sao", {});
    solvedTeam.answers.lockOne = {
      natural: "origins",
      cognitive: "origins",
      psychological: "origins",
      historical: "properties",
      mass: "properties",
      political: "properties",
    };
    const first = applyCompletionTimes(solvedTeam, 1000);
    const second = applyCompletionTimes({ ...first, answers: { ...first.answers } }, 2000);
    expect(second.completedAt[1]).toBe(1000);
  });

  it("xếp hạng theo số khóa, thời gian và tên đội", () => {
    const ranked = rankTeams([
      team("Beta", { 1: 10, 2: 50 }),
      team("Alpha", { 1: 10, 2: 50 }),
      team("Nhanh nhưng một khóa", { 1: 1 }),
      team("Chậm hai khóa", { 1: 100, 2: 200 }),
    ]);
    expect(ranked.map((item) => item.name)).toEqual(["Alpha", "Beta", "Chậm hai khóa", "Nhanh nhưng một khóa"]);
    expect(completedLocks(ranked[0])).toBe(2);
  });

  it("không nhận đáp án khi phiên không còn hoạt động hoặc đã hết giờ", () => {
    expect(canSubmitAnswers("active", 2_000, 1_000)).toBe(true);
    expect(canSubmitAnswers("active", 2_000, 2_001)).toBe(false);
    expect(canSubmitAnswers("announced", null, 1_000)).toBe(false);
  });

  it("chỉ nhận payload đáp án thuộc các lựa chọn của game", () => {
    expect(isValidAnswers({ lockOne: { natural: "origins" }, lockTwo: {}, lockThree: {} })).toBe(true);
    expect(isValidAnswers({ lockOne: { injected: "origins" }, lockTwo: {}, lockThree: {} })).toBe(false);
  });
});
