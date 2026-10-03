// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionEntry } from "./SessionEntry";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("SessionEntry", () => {
  it("giữ cụm Kiến Thức nguyên vẹn khi tiêu đề xuống dòng", () => {
    render(<SessionEntry />);

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.querySelector(".session-title-knowledge")).toHaveTextContent("Kiến Thức");
  });
});
