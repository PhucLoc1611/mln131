# Ba Khóa – Hồ Sơ Kiến Thức Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Xây dựng web game ba khóa có màn đội chơi và màn MC đồng bộ kết quả qua Upstash Redis.

**Architecture:** Next.js App Router cung cấp hai trang /play và /mc, cùng API JSON dưới /api. Logic đáp án/xếp hạng là hàm TypeScript thuần để kiểm thử. API dùng Upstash Redis khi có biến môi trường hoặc Map bộ nhớ trong phát triển; các máy khách polling mỗi 2 giây.

**Tech Stack:** Next.js 15+, React, TypeScript, CSS, Vitest, @upstash/redis.

## Global Constraints

- Nội dung giao diện tiếng Việt và giữ nguyên câu chữ kiến thức trong đặc tả.
- Không có tài khoản; chỉ lưu tên đội và trạng thái phiên/đội.
- Dùng UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN ở máy chủ, không bao giờ ở máy khách.
- Vùng chạm tối thiểu 44 px; keyboard, focus và phản hồi bằng chữ phải hoạt động.
- Mở khóa theo 1 → 2 → 3; sai sửa không giới hạn; gợi ý không làm mất điểm.
- Xếp hạng: số khóa giảm dần, tổng thời gian tăng dần, tên đội tăng dần.

---

## File structure

| File | Trách nhiệm |
| --- | --- |
| package.json, next.config.ts, tsconfig.json, vitest.config.ts | Cấu hình ứng dụng/test/scripts. |
| src/lib/game.ts, src/lib/game.test.ts | Nội dung, kiểu dữ liệu, giải đáp án, xếp hạng và test. |
| src/lib/store.ts, src/lib/store.test.ts | Storage interface; Redis/Map adapter và test. |
| src/app/api/sessions/**/route.ts | Tạo/đọc/điều khiển phiên; đăng ký/cập nhật đội. |
| src/app/play/page.tsx, src/components/PlayerGame.tsx | Màn đội chơi và ba mini-game. |
| src/app/mc/page.tsx, src/components/McDashboard.tsx | Màn MC, tiến trình, xếp hạng, lời giải. |
| src/components/LockProgress.tsx, src/components/Countdown.tsx | Thành phần trạng thái dùng chung. |
| src/app/layout.tsx, src/app/globals.css | Khung và giao diện responsive. |
| .env.example, README.md | Biến môi trường và hướng dẫn vận hành. |

### Task 1: Scaffold và logic nội dung game

**Files:**
- Create: package.json, next.config.ts, tsconfig.json, vitest.config.ts
- Create: src/lib/game.ts
- Create: src/lib/game.test.ts

**Interfaces:**
- Produces: LockNumber, TeamProgress, Session, isLockOneSolved, isLockTwoSolved, isLockThreeSolved, completedLocks, rankTeams.
- TeamProgress: id, name, answer maps cho ba khóa, hintCount, completedAt, updatedAt.

- [ ] **Step 1: Write failing logic tests**

~~~ts
it("opens lock one only when all six cards use correct categories", () => {
  expect(isLockOneSolved({ natural: "origins" })).toBe(false);
  expect(isLockOneSolved({
    natural: "origins", cognitive: "origins", psychological: "origins",
    historical: "properties", mass: "properties", political: "properties",
  })).toBe(true);
});
it("ranks completed locks before speed", () => {
  const ranked = rankTeams([team("one", { 1: 1000 }), team("two", { 1: 2000, 2: 3000 })]);
  expect(ranked.map(({ name }) => name)).toEqual(["two", "one"]);
});
~~~

Also test both Lock 2 corrections, Lock 3 pairs, timestamp never replaced, and a name tie-break.

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/lib/game.test.ts

Expected: FAIL because runner/module do not exist.

- [ ] **Step 3: Implement the minimal rules module**

~~~ts
export type LockNumber = 1 | 2 | 3;
export const isLockOneSolved = (answers: Record<string, string>) =>
  Object.entries(lockOneKey).every(([card, group]) => answers[card] === group);
export const completedLocks = (team: TeamProgress) => Object.keys(team.completedAt).length;
export const rankTeams = (teams: TeamProgress[]) =>
  [...teams].sort((a, b) => completedLocks(b) - completedLocks(a)
    || totalTime(a) - totalTime(b) || a.name.localeCompare(b.name));
~~~

Add exact card, target, distractor, action, basis, hint and solution constants from the approved specification. Implement all three solve functions, totalTime, and first-completion timestamp behavior.

- [ ] **Step 4: Run tests**

Run: npm test -- --run src/lib/game.test.ts

Expected: PASS for all answer and ranking cases.

- [ ] **Step 5: Commit**

~~~sh
git add package.json next.config.ts tsconfig.json vitest.config.ts src/lib/game.ts src/lib/game.test.ts
git commit -m "feat: add three-lock game rules"
~~~

### Task 2: Build session storage and HTTP API

**Files:**
- Create: src/lib/store.ts, src/lib/store.test.ts
- Create: src/app/api/sessions/route.ts, src/app/api/sessions/[code]/route.ts
- Create: src/app/api/sessions/[code]/teams/route.ts, src/app/api/sessions/[code]/teams/[teamId]/route.ts
- Create: .env.example

**Interfaces:**
- Consumes: Session, TeamProgress, rankTeams.
- Produces: createSession, getSession, upsertTeam, saveTeam.
- API: POST /api/sessions returns session; GET /api/sessions/:code returns session; POST /api/sessions/:code/teams accepts name; PATCH /api/sessions/:code/teams/:teamId saves game state.

- [ ] **Step 1: Write failing storage test**

~~~ts
it("retains a registered team and update", async () => {
  const session = await store.createSession();
  const team = await store.upsertTeam(session.code, "Đội Mặt Trời");
  await store.saveTeam(session.code, { ...team, hintCount: 1 });
  expect((await store.getSession(session.code))?.teams[0])
    .toMatchObject({ id: team.id, hintCount: 1 });
});
~~~

Test absent session, duplicate name returning same team, invalid name, and invalid update.

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/lib/store.test.ts

Expected: FAIL because store.ts is absent.

- [ ] **Step 3: Implement adapters and API validation**

~~~ts
const canUseRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);
export const store = canUseRedis ? redisStore : memoryStore;
~~~

Create uppercase 6-character session codes from crypto.randomUUID(). Store Redis data at three-locks:session:<code>; fallback to Map. Reject empty or over-40-character team names, unknown code/team, malformed PATCH bodies with JSON error and 400/404. Only active sessions accept changes; API recomputes completion with game.ts rather than trusting browser times.

- [ ] **Step 4: Run storage tests**

Run: npm test -- --run src/lib/store.test.ts

Expected: PASS without Redis credentials.

- [ ] **Step 5: Commit**

~~~sh
git add src/lib/store.ts src/lib/store.test.ts src/app/api .env.example
git commit -m "feat: persist game sessions and teams"
~~~

### Task 3: Implement responsive player game

**Files:**
- Create: src/app/layout.tsx, src/app/page.tsx, src/app/globals.css
- Create: src/components/LockProgress.tsx, src/components/Countdown.tsx, src/components/PlayerGame.tsx, src/components/PlayerGame.test.tsx
- Create: src/app/play/page.tsx

**Interfaces:**
- Consumes: game constants, TeamProgress and Task 2 APIs.
- Produces: PlayerGame accepting sessionCode and initialSession; it patches answers/hints and retains unsaved answers after error.

- [ ] **Step 1: Write failing component tests**

~~~tsx
it("does not offer lock two until lock one is solved", () => {
  render(<PlayerGame sessionCode="ABC123" initialSession={activeSession} />);
  expect(screen.getByRole("button", { name: /khóa 2/i })).toBeDisabled();
});
it("responds in text to a wrong assignment", async () => {
  render(<PlayerGame sessionCode="ABC123" initialSession={activeSession} />);
  await user.click(screen.getByRole("button", { name: /tính lịch sử/i }));
  await user.click(screen.getByRole("button", { name: /nguồn gốc của tôn giáo/i }));
  expect(await screen.findByRole("status")).toHaveTextContent(/chưa đúng/i);
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/components/PlayerGame.test.tsx

Expected: FAIL because setup and component are absent.

- [ ] **Step 3: Implement player UI**

~~~tsx
<main className="player-shell">
  <header><LockProgress completed={completedLocks(team)} /><Countdown endsAt={session.endsAt} /></header>
  <PlayerGame sessionCode={code} initialSession={session} />
</main>
~~~

Use selectable buttons, never drag-only: card → category for Lock 1; wrong text → correction for Lock 2; action → basis for Lock 3. Shuffle each deck once. Include exact prompts/hints/solutions. Save every selection/hint; show nearby text failure; disable unopened/not-active locks; poll state every 2 seconds; honor reduced-motion.

- [ ] **Step 4: Run player tests and production build**

Run: npm test -- --run src/components/PlayerGame.test.tsx && npm run build

Expected: PASS and build exits 0.

- [ ] **Step 5: Commit**

~~~sh
git add src/app src/components src/lib/game.ts src/components/PlayerGame.test.tsx
git commit -m "feat: add mobile three-lock player experience"
~~~

### Task 4: Implement MC dashboard and end-game controls

**Files:**
- Create: src/components/McDashboard.tsx, src/components/McDashboard.test.tsx
- Create: src/app/mc/page.tsx
- Modify: src/lib/game.ts, src/app/api/sessions/[code]/route.ts

**Interfaces:**
- Consumes: rankTeams and GET session API.
- Produces: PATCH /api/sessions/:code accepting status active/announced/solutions and optional endsAt.

- [ ] **Step 1: Write failing dashboard tests**

~~~tsx
it("orders completed locks before elapsed time", () => {
  render(<McDashboard initialSession={sessionWithRankedTeams} />);
  expect(screen.getAllByRole("row")[1]).toHaveTextContent("Đội hai khóa");
});
it("shows class solution after MC opens it", async () => {
  render(<McDashboard initialSession={createdSession} />);
  await user.click(screen.getByRole("button", { name: /mở lời giải/i }));
  expect(await screen.findByText(/Qua ba khóa/)).toBeVisible();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/components/McDashboard.test.tsx

Expected: FAIL because dashboard does not exist.

- [ ] **Step 3: Implement dashboard and session state change**

~~~tsx
<section aria-label="Bảng tiến trình đội">
  <table>
    <thead><tr><th>Đội</th><th>Tiến trình</th><th>Chìa khóa</th><th>Thời gian</th></tr></thead>
    <tbody>{rankTeams(session.teams).map(renderTeam)}</tbody>
  </table>
</section>
~~~

Show session code, shareable player URL, start 5-minute control, countdown, ranking and exact closing text. Announcing stops player saves; solutions reveals all answer keys. Poll two seconds. Buttons state consequence; only reset asks confirmation.

- [ ] **Step 4: Run dashboard tests and build**

Run: npm test -- --run src/components/McDashboard.test.tsx && npm run build

Expected: PASS and build exits 0.

- [ ] **Step 5: Commit**

~~~sh
git add src/components/McDashboard.tsx src/components/McDashboard.test.tsx src/app/mc src/app/api/sessions/[code] src/lib/game.ts
git commit -m "feat: add live MC game dashboard"
~~~

### Task 5: Document and verify two-screen flow

**Files:**
- Create: README.md
- Modify: .env.example

**Interfaces:**
- Consumes: /mc, /play?session=<code>, Redis environment variables and npm scripts.
- Produces: reproducible setup/run document.

- [ ] **Step 1: Add README acceptance checklist**

~~~md
- [ ] Mở /mc, tạo phiên và sao chép mã/đường dẫn đội chơi.
- [ ] Ở cửa sổ khác vào /play?session=<mã>, nhập tên đội và hoàn thành từng khóa.
- [ ] Xác nhận MC cập nhật tên, ba khóa, gợi ý và thứ hạng trong tối đa 2 giây.
- [ ] Công bố kết quả rồi mở lời giải; đội không còn gửi đáp án nhưng vẫn đọc được lời giải.
~~~

Document npm install, .env.example variables, npm run dev and the no-Redis fallback.

- [ ] **Step 2: Run all automated checks**

Run: npm test -- --run && npm run build

Expected: all Vitest suites pass and Next.js exits 0.

- [ ] **Step 3: Run app and perform checklist**

Run: npm run dev

Expected: /mc and /play load with no browser console errors and every checklist item works.

- [ ] **Step 4: Commit**

~~~sh
git add README.md .env.example
git commit -m "docs: add three-lock game setup guide"
~~~

## Plan self-review

- Spec coverage: Task 1 covers answer keys/ranking; Task 2 Redis/fallback/validation; Task 3 player, timer, hints, accessibility/errors; Task 4 MC, leaderboard, ending/polling; Task 5 setup and verification.
- Placeholder scan: no TBD, TODO, generic test directions or undefined interfaces.
- Type consistency: Session/TeamProgress/LockNumber are defined before store, API and components use them.

