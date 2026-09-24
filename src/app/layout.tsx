import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Ba Khóa – Hồ Sơ Kiến Thức", description: "Game ôn tập 3 khóa cho lớp học" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="vi"><body>{children}</body></html>; }
