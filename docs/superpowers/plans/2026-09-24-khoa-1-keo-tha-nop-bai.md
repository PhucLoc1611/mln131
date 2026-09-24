# Khóa 1 kéo–thả và nộp bài Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép đội kéo–thả sáu thẻ ở Khóa 1 và chỉ mở Khóa 2 sau khi bấm nộp đáp án đúng.

**Architecture:** `PlayerGame` giữ một bản nháp `lockOneDraft` cục bộ để thẻ chuyển cột tức thời mà không mở khóa tự động. `ClassificationColumn` phát sự kiện kéo–thả về cha; cha cập nhật bản nháp. Hàm nộp kiểm tra `isLockOneSolved`, thông báo sai tại chỗ hoặc gọi API PATCH chỉ khi đúng.

**Tech Stack:** Next.js App Router, React client component, TypeScript, Vitest, Testing Library.

## Global Constraints

- Không thêm thư viện kéo–thả; dùng Drag and Drop API có sẵn của trình duyệt.
- Giữ chạm/chọn và bàn phím làm phương án thay thế cho kéo–thả.
- Không thay đổi đáp án, `isLockOneSolved`, API hoặc quy tắc của Khóa 2–3.
- Trên màn hình nhỏ, bảng vẫn xếp dọc theo CSS hiện có.

---

### Task 1: Trạng thái bản nháp và nộp Khóa 1

**Files:**
- Modify: `src/components/PlayerGame.tsx`
- Test: `src/components/PlayerGame.test.tsx`

**Interfaces:**
- Consumes: `isLockOneSolved(answers: Record<string, string>): boolean` từ `@/lib/game`.
- Produces: `moveLockOne(cardId, destination)` để cập nhật bản nháp và `submitLockOne()` để chỉ lưu đáp án đúng.

- [ ] **Step 1: Viết test thất bại cho nộp sai và nộp đúng**

```tsx
expect(screen.getByRole("button", { name: "Nộp Khóa 1" })).toBeDisabled();
// Xếp đủ thẻ sai.
await user.click(screen.getByRole("button", { name: "Nộp Khóa 1" }));
expect(screen.getByRole("status")).toHaveTextContent("Chưa đúng");
expect(fetch).not.toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: "PATCH" }));
```

- [ ] **Step 2: Chạy test để xác nhận lỗi**

Run: `npm test -- PlayerGame.test.tsx --run`

Expected: FAIL vì nút `Nộp Khóa 1` chưa tồn tại và đáp án hiện được lưu ngay.

- [ ] **Step 3: Tạo bản nháp cục bộ và hàm nộp**

```tsx
const [lockOneDraft, setLockOneDraft] = useState(team.answers.lockOne);

const submitLockOne = () => {
  if (!isLockOneSolved(lockOneDraft)) {
    setNotice("Chưa đúng, hãy kiểm tra lại các thẻ.");
    return;
  }
  void save({ ...team.answers, lockOne: lockOneDraft });
};
```

Đồng bộ bản nháp từ `team.answers.lockOne` khi API trả về đội mới, nhưng không ghi đè thao tác đang diễn ra trước khi nộp.

- [ ] **Step 4: Chạy test để xác nhận đạt**

Run: `npm test -- PlayerGame.test.tsx --run`

Expected: PASS; đáp án sai không gọi PATCH, đáp án đúng gọi PATCH và mở Khóa 2 theo phản hồi API.

### Task 2: Kéo–thả vào cột phân loại

**Files:**
- Modify: `src/components/PlayerGame.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/PlayerGame.test.tsx`

**Interfaces:**
- Consumes: `moveLockOne(cardId: string, destination: "origins" | "properties" | "unclassified")` từ Task 1.
- Produces: `ClassificationColumn` nhận `onDropCard(cardId, destination)` và đánh dấu cột đang là đích.

- [ ] **Step 1: Viết test thất bại cho thả thẻ**

```tsx
fireEvent.dragStart(card, { dataTransfer });
fireEvent.drop(origins, { dataTransfer });
expect(within(origins).getByRole("button", { name: "Nguồn gốc nhận thức" })).toBeVisible();
```

- [ ] **Step 2: Chạy test để xác nhận lỗi**

Run: `npm test -- PlayerGame.test.tsx --run`

Expected: FAIL vì thả thẻ hiện không cập nhật cột.

- [ ] **Step 3: Thêm sự kiện kéo–thả và phản hồi trực quan**

```tsx
onDragStart={(event) => event.dataTransfer.setData("text/plain", card.id)}
onDragOver={(event) => event.preventDefault()}
onDrop={(event) => onDropCard(event.dataTransfer.getData("text/plain"), destination)}
```

Gắn `draggable={playable}` cho thẻ. Cột nhận thêm class `is-drop-target` trong lúc `dragenter`; CSS tăng viền và nền. Không xóa nút đích hiện có.

- [ ] **Step 4: Chạy test để xác nhận đạt**

Run: `npm test -- PlayerGame.test.tsx --run`

Expected: PASS; kéo–thả và chạm/bàn phím cùng cập nhật một bản nháp.

### Task 3: Kiểm tra hồi quy toàn dự án

**Files:**
- Verify: `src/components/PlayerGame.tsx`
- Verify: `src/components/PlayerGame.test.tsx`

- [ ] **Step 1: Chạy toàn bộ kiểm thử**

Run: `npm test -- --run`

Expected: PASS, không có kiểm thử bị bỏ qua.

- [ ] **Step 2: Tạo production build**

Run: `npm run build`

Expected: exit code 0, TypeScript và các route Next.js được build thành công.
