# Khóa 2 kéo–thả và khóa Khóa 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển Khóa 2 sang kéo–thả thẻ sửa và ngăn đội thay đổi Khóa 1 sau khi nộp đúng.

**Architecture:** `PlayerGame` dùng cùng Drag and Drop API đã có ở Khóa 1. Hai vùng thay thế của Khóa 2 nhận mã thẻ được kéo rồi gọi `updateLockTwo`; thao tác chạm vẫn gọi cùng hàm. Trạng thái `locks >= 1` vô hiệu hóa toàn bộ điều khiển Khóa 1.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Testing Library.

## Global Constraints

- Không thêm thư viện kéo–thả.
- Giữ thao tác chạm và bàn phím.
- Không đổi đáp án hoặc API game.

---

### Task 1: Khóa điều khiển Khóa 1 sau đáp án đúng

**Files:**
- Modify: `src/components/PlayerGame.tsx`
- Test: `src/components/PlayerGame.test.tsx`

- [ ] Viết test: sau phản hồi nộp đúng, thẻ và các nút ngăn Khóa 1 bị disabled.
- [ ] Chạy `npm test -- PlayerGame.test.tsx --run`, xác nhận test thất bại.
- [ ] Đặt `playable && locks < 1` làm điều kiện tương tác Khóa 1 và cập nhật trạng thái hướng dẫn.
- [ ] Chạy lại test, xác nhận đạt.

### Task 2: Thẻ sửa kéo–thả vào hai vị trí Khóa 2

**Files:**
- Modify: `src/components/PlayerGame.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/PlayerGame.test.tsx`

- [ ] Viết test `dragStart`/`drop`: thả thẻ sửa vào vị trí `belief` thay nội dung vùng thả và gọi lưu đáp án.
- [ ] Chạy `npm test -- PlayerGame.test.tsx --run`, xác nhận test thất bại.
- [ ] Thêm vùng thả có trạng thái sáng khi kéo qua, thẻ `draggable`, và fallback chạm thẻ → vùng thả.
- [ ] Chạy lại test, xác nhận đạt.

### Task 3: Kiểm tra hồi quy

- [ ] Chạy `npm test -- --run`.
- [ ] Chạy `npm run build`.
