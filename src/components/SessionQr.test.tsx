// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionQr } from "./SessionQr";

describe("SessionQr", () => {
  it("hiển thị mã phiên đã chuẩn hóa để người chơi quét hoặc nhập", () => {
    render(<SessionQr code="ab12cd" origin="https://game.example" />);
    expect(screen.getByLabelText("Mã QR vào phiên AB12CD")).toBeVisible();
    expect(screen.getByText("AB12CD")).toBeVisible();
  });
});
