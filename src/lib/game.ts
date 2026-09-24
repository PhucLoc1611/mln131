export type LockNumber = 1 | 2 | 3;
export type SessionStatus = "draft" | "active" | "announced" | "solutions";
export type OriginGroup = "origins" | "properties";
export type LockTwoChoice = "respect-both" | "separate-misuse" | "same-belief" | "one-solution";
export type LockThreeChoice = "solidarity" | "freedom";

export type Answers = {
  lockOne: Partial<Record<"natural" | "cognitive" | "psychological" | "historical" | "mass" | "political", OriginGroup>>;
  lockTwo: Partial<Record<"belief" | "distinction", LockTwoChoice>>;
  lockThree: Partial<Record<"inclusion" | "voluntary", LockThreeChoice>>;
};

export type TeamProgress = {
  id: string;
  name: string;
  answers: Answers;
  hintCount: number;
  completedAt: Partial<Record<LockNumber, number>>;
  updatedAt: number;
};

export type Session = {
  code: string;
  status: SessionStatus;
  createdAt: number;
  startsAt: number | null;
  endsAt: number | null;
  teams: TeamProgress[];
};

export const lockOneCards = [
  { id: "natural", text: "Nguồn gốc tự nhiên, kinh tế – xã hội", group: "origins" },
  { id: "cognitive", text: "Nguồn gốc nhận thức", group: "origins" },
  { id: "psychological", text: "Nguồn gốc tâm lý", group: "origins" },
  { id: "historical", text: "Tính lịch sử", group: "properties" },
  { id: "mass", text: "Tính quần chúng", group: "properties" },
  { id: "political", text: "Tính chính trị", group: "properties" },
] as const;

export const lockTwoChoices = [
  {
    id: "respect-both",
    text: "tôn trọng, bảo đảm quyền tự do tín ngưỡng và không tín ngưỡng của nhân dân",
  },
  {
    id: "separate-misuse",
    text: "phân biệt tín ngưỡng, tôn giáo với việc lợi dụng tín ngưỡng, tôn giáo",
  },
  { id: "same-belief", text: "yêu cầu mọi người có cùng một tín ngưỡng" },
  { id: "one-solution", text: "áp dụng một cách giải quyết giống nhau trong mọi hoàn cảnh" },
] as const;

export const lockThreeActions = [
  {
    id: "inclusion",
    text: "Sửa quy định tham gia: không loại một người chỉ vì khác tôn giáo; khuyến khích cùng đóng góp cho hoạt động chung.",
  },
  { id: "voluntary", text: "Sửa thông báo: việc tham gia nghi lễ tín ngưỡng là tự nguyện." },
] as const;

export const lockThreeBases = [
  { id: "solidarity", text: "Thực hiện chính sách đại đoàn kết dân tộc." },
  { id: "freedom", text: "Tôn trọng, bảo đảm quyền tự do tín ngưỡng và không tín ngưỡng của nhân dân." },
] as const;

export const hints: Record<LockNumber, string> = {
  1: "Một nhóm trả lời câu hỏi ‘Tôn giáo hình thành từ đâu?’, nhóm còn lại nói về các tính chất của tôn giáo.",
  2: "Hãy chú ý: chính sách bảo vệ cả người có tín ngưỡng và không tín ngưỡng; đồng thời phải tách tôn giáo khỏi hành vi lợi dụng.",
  3: "Chọn căn cứ trực tiếp nhất trong hai thẻ: một thẻ nói về đoàn kết, một thẻ nói về quyền tự do tín ngưỡng và không tín ngưỡng.",
};

export const solutions: Record<LockNumber, string> = {
  1: "Nguồn gốc gồm tự nhiên, kinh tế – xã hội; nhận thức; tâm lý. Tính chất gồm lịch sử, quần chúng và chính trị.",
  2: "Cần tôn trọng cả quyền có tín ngưỡng và không tín ngưỡng; đồng thời phân biệt tín ngưỡng, tôn giáo với việc lợi dụng tín ngưỡng, tôn giáo.",
  3: "Không loại người khác tôn giáo trực tiếp thể hiện đại đoàn kết dân tộc; nghi lễ tự nguyện trực tiếp bảo đảm tự do tín ngưỡng và không tín ngưỡng. Hành động thứ nhất cũng liên quan tới nguyên tắc tự do tín ngưỡng.",
};

const lockOneKey = Object.fromEntries(lockOneCards.map((card) => [card.id, card.group]));

export function emptyAnswers(): Answers {
  return { lockOne: {}, lockTwo: {}, lockThree: {} };
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const entriesMatch = (value: unknown, allowed: Record<string, readonly string[]>) =>
  isRecord(value) && Object.entries(value).every(([key, entry]) => allowed[key]?.includes(entry as string));

export function isValidAnswers(value: unknown): value is Answers {
  if (!isRecord(value)) return false;
  return entriesMatch(value.lockOne, { natural: ["origins", "properties"], cognitive: ["origins", "properties"], psychological: ["origins", "properties"], historical: ["origins", "properties"], mass: ["origins", "properties"], political: ["origins", "properties"] })
    && entriesMatch(value.lockTwo, { belief: ["respect-both", "separate-misuse", "same-belief", "one-solution"], distinction: ["respect-both", "separate-misuse", "same-belief", "one-solution"] })
    && entriesMatch(value.lockThree, { inclusion: ["solidarity", "freedom"], voluntary: ["solidarity", "freedom"] });
}

export function isLockOneSolved(answers: Record<string, string>): boolean {
  return lockOneCards.every((card) => answers[card.id] === lockOneKey[card.id]);
}

export function isLockTwoSolved(answers: Record<string, string>): boolean {
  return answers.belief === "respect-both" && answers.distinction === "separate-misuse";
}

export function isLockThreeSolved(answers: Record<string, string>): boolean {
  return answers.inclusion === "solidarity" && answers.voluntary === "freedom";
}

export function solvedLocks(answers: Answers): LockNumber[] {
  const solved: LockNumber[] = [];
  if (isLockOneSolved(answers.lockOne)) solved.push(1);
  if (solved.includes(1) && isLockTwoSolved(answers.lockTwo)) solved.push(2);
  if (solved.includes(2) && isLockThreeSolved(answers.lockThree)) solved.push(3);
  return solved;
}

export function applyCompletionTimes(team: TeamProgress, now: number): TeamProgress {
  const completedAt = { ...team.completedAt };
  for (const lock of solvedLocks(team.answers)) {
    if (completedAt[lock] === undefined) completedAt[lock] = now;
  }
  return { ...team, completedAt, updatedAt: now };
}

export function completedLocks(team: TeamProgress): number {
  return Object.keys(team.completedAt).length;
}

export function totalTime(team: TeamProgress): number {
  const stamps = Object.values(team.completedAt);
  if (stamps.length === 0) return Number.POSITIVE_INFINITY;
  return Math.max(...stamps);
}

export function rankTeams(teams: TeamProgress[]): TeamProgress[] {
  return [...teams].sort(
    (left, right) =>
      completedLocks(right) - completedLocks(left) ||
      totalTime(left) - totalTime(right) ||
      left.name.localeCompare(right.name, "vi"),
  );
}

export function canSubmitAnswers(status: SessionStatus, endsAt: number | null, now = Date.now()): boolean {
  return status === "active" && (endsAt === null || now <= endsAt);
}
