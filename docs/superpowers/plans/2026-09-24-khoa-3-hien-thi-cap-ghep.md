# Khóa 3 hiển thị cặp ghép Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị rõ căn cứ đã ghép cho từng hành động của Khóa 3.

**Architecture:** `PlayerGame` dựng hai hàng từ `lockThreeActions` và đọc lựa chọn hiện tại từ `team.answers.lockThree`. Hàm lưu đáp án và API giữ nguyên; CSS chỉ bổ sung bố cục hàng ghép responsive.

**Tech Stack:** Next.js, React, TypeScript, Vitest, Testing Library.

## Global Constraints

- Không thay đáp án, API hay điều kiện mở khóa Khóa 3.
- Giữ thao tác chạm và bàn phím bằng các nút có nhãn.

---

### Task 1: Hiển thị lựa chọn đã ghép

**Files:**
- Modify: `src/components/PlayerGame.tsx`
- Modify: `src/app/globals.css`
- Test: `src/components/PlayerGame.test.tsx`

- [ ] Viết test mở sẵn Khóa 3, chọn hành động `inclusion`, chọn căn cứ `solidarity`, rồi xác nhận hàng này hiển thị căn cứ đã chọn và hàng `voluntary` vẫn hiển thị trạng thái trống.
- [ ] Chạy `npm test -- PlayerGame.test.tsx --run`; test phải thất bại vì hàng ghép chưa tồn tại.
- [ ] Dựng hai hàng gồm nút hành động, mũi tên và ô trạng thái căn cứ; đọc văn bản căn cứ qua `team.answers.lockThree`.
- [ ] Bổ sung CSS desktop hai cột và mobile xếp dọc, không thay đổi thao tác chọn hiện có.
- [ ] Chạy lại `npm test -- PlayerGame.test.tsx --run`; xác nhận test đạt.

### Task 2: Kiểm tra hồi quy

- [ ] Chạy `npm test -- --run`.
- [ ] Chạy `npm run build`.
