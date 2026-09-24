# QR and Session-Code Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Let teams join by scanning the MC QR or typing its six-character code, then require a team name before play.

**Architecture:** A focused QR component creates an SVG from the existing player URL. The home page becomes the shared code-entry screen; the existing player page remains the single destination for both methods.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Vitest, qrcode.react.

## Global Constraints

- QR encodes only /play?session=<six-character uppercase code>; it uses no external QR service.
- The home page normalizes input to uppercase and accepts exactly six letters or digits.
- Users always see the existing team-name form before gameplay.
- MC shows a large QR plus code, not a long URL.
- Bad/missing sessions show recovery link to home entry screen.

---

## File structure

| File | Responsibility |
| --- | --- |
| package.json, package-lock.json | Add qrcode.react. |
| src/components/SessionQr.tsx | Render accessible SVG QR and code caption. |
| src/components/SessionQr.test.tsx | Check QR label and code. |
| src/components/SessionEntry.tsx | Validate code and navigate to player route. |
| src/components/SessionEntry.test.tsx | Test invalid/valid entry behavior. |
| src/app/page.tsx | Render SessionEntry. |
| src/components/McDashboard.tsx | Replace displayed long URL with SessionQr. |
| src/components/PlayerGame.tsx | Recovery UI for missing session. |
| src/app/globals.css | QR and entry responsive styles. |
| README.md | QR/code instructions. |

### Task 1: Add local QR component

**Files:**
- Modify: package.json, package-lock.json
- Create: src/components/SessionQr.tsx
- Create: src/components/SessionQr.test.tsx

**Interfaces:**
- Produces: SessionQr({ code, origin }: { code: string; origin: string }).
- Value is origin plus /play?session= plus code.toUpperCase().

- [ ] **Step 1: Write the failing QR test**

~~~tsx
it("shows normalized code for scanning", () => {
  render(<SessionQr code="ab12cd" origin="https://game.example" />);
  expect(screen.getByLabelText("Mã QR vào phiên AB12CD")).toBeVisible();
  expect(screen.getByText("AB12CD")).toBeVisible();
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/components/SessionQr.test.tsx

Expected: FAIL because component and dependency do not exist.

- [ ] **Step 3: Install and implement component**

~~~tsx
import { QRCodeSVG } from "qrcode.react";

export function SessionQr({ code, origin }: Props) {
  const sessionCode = code.toUpperCase();
  const value = new URL("/play?session=" + sessionCode, origin).toString();
  return <figure><QRCodeSVG aria-label={"Mã QR vào phiên " + sessionCode} value={value} size={220} /><figcaption>{sessionCode}</figcaption></figure>;
}
~~~

Use 220px SVG with high error correction and text caption.

- [ ] **Step 4: Run QR test**

Run: npm test -- --run src/components/SessionQr.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

~~~sh
git add package.json package-lock.json src/components/SessionQr.tsx src/components/SessionQr.test.tsx
git commit -m "feat: add local session QR code"
~~~

### Task 2: Build code-entry landing screen

**Files:**
- Create: src/components/SessionEntry.tsx, src/components/SessionEntry.test.tsx
- Modify: src/app/page.tsx, src/app/globals.css

**Interfaces:**
- Produces: client component SessionEntry().
- Valid code: exactly six ASCII letters or digits after trim/uppercase.

- [ ] **Step 1: Write failing entry tests**

~~~tsx
it("normalizes a code and navigates to player", async () => {
  render(<SessionEntry />);
  await user.type(screen.getByLabelText("Mã phiên"), " ab12cd ");
  await user.click(screen.getByRole("button", { name: "Vào phiên" }));
  expect(push).toHaveBeenCalledWith("/play?session=AB12CD");
});
it("explains invalid code without navigation", async () => {
  render(<SessionEntry />);
  await user.type(screen.getByLabelText("Mã phiên"), "abc");
  await user.click(screen.getByRole("button", { name: "Vào phiên" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Mã phiên gồm 6 ký tự");
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/components/SessionEntry.test.tsx

Expected: FAIL because SessionEntry is absent.

- [ ] **Step 3: Implement entry screen**

~~~tsx
const code = rawCode.trim().toUpperCase();
if (!/^[A-Z0-9]{6}$/.test(code)) {
  setError("Mã phiên gồm 6 chữ hoặc số.");
  return;
}
router.push("/play?session=" + code);
~~~

Render one labeled input, QR instruction, primary Vào phiên button and inline alert. Home page imports only this component. Add responsive entry card styling.

- [ ] **Step 4: Run entry test**

Run: npm test -- --run src/components/SessionEntry.test.tsx

Expected: PASS.

- [ ] **Step 5: Commit**

~~~sh
git add src/app/page.tsx src/components/SessionEntry.tsx src/components/SessionEntry.test.tsx src/app/globals.css
git commit -m "feat: add session code entry screen"
~~~

### Task 3: Connect QR to MC and recovery to player

**Files:**
- Modify: src/components/McDashboard.tsx, src/components/PlayerGame.tsx, src/app/globals.css, README.md

**Interfaces:**
- Consumes: SessionQr props and PlayerGame code prop.
- Produces: QR/mã on MC; recovery link on player page.

- [ ] **Step 1: Write failing recovery test**

~~~tsx
it("offers home entry when session cannot load", async () => {
  mockGetSession.mockRejectedValue(new Error("Không tìm thấy phiên chơi."));
  render(<PlayerGame code="BAD000" />);
  expect(await screen.findByRole("link", { name: "Nhập mã phiên khác" }))
    .toHaveAttribute("href", "/");
});
~~~

- [ ] **Step 2: Run test to verify it fails**

Run: npm test -- --run src/components/PlayerGame.test.tsx

Expected: FAIL because recovery link does not exist.

- [ ] **Step 3: Integrate QR and recovery**

~~~tsx
<SessionQr code={session.code} origin={window.location.origin} />
<p>Quét mã để vào game hoặc nhập mã phiên ở trang chủ.</p>
~~~

Replace long URL on MC with QR and instruction. On missing session, PlayerGame renders link Nhập mã phiên khác to /. Preserve API, name registration, locks, timer and Redis behavior.

- [ ] **Step 4: Run full checks**

Run: npm test -- --run && npm run build

Expected: every suite passes and build exits 0.

- [ ] **Step 5: Update README and commit**

~~~sh
git add src/components/McDashboard.tsx src/components/PlayerGame.tsx src/app/globals.css README.md
git commit -m "feat: let teams join using QR or session code"
~~~

## Plan self-review

- Spec coverage: Task 1 local QR; Task 2 typed code entry and existing name route; Task 3 MC, recovery and operations docs.
- Placeholder scan: no TBD, TODO, generic test direction or undefined interface remains.
- Type consistency: SessionQr, SessionEntry and PlayerGame props are defined before use.

