"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SessionEntry() {
  const router = useRouter(); const [rawCode, setRawCode] = useState(""); const [error, setError] = useState("");
  const submit = (event: FormEvent) => { event.preventDefault(); const code = rawCode.trim().toUpperCase(); if (!/^[A-Z0-9]{6}$/.test(code)) { setError("Mã phiên gồm 6 ký tự chữ hoặc số."); return; } router.push(`/play?session=${code}`); };
  return <main className="join-page"><section className="join-card session-entry"><p className="eyebrow">VÀO GAME</p><h1>Ba Khóa<br />Hồ Sơ Kiến Thức</h1><p>Quét mã QR của MC hoặc nhập mã phiên bên dưới.</p><form onSubmit={submit}><label htmlFor="session-code">Mã phiên</label><input id="session-code" value={rawCode} maxLength={6} autoCapitalize="characters" autoComplete="off" placeholder="VD: AB12CD" onChange={(event) => { setRawCode(event.target.value); setError(""); }} required /><button className="button primary" type="submit">Vào phiên</button></form>{error && <p role="alert">{error}</p>}<p className="entry-note">Sau đó bạn sẽ đặt tên đội trước khi vào chơi.</p></section></main>;
}
