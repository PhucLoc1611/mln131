"use client";

import { useEffect, useState } from "react";

const textFor = (endsAt: number | null) => {
  if (!endsAt) return "Chờ MC bắt đầu";
  const seconds = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};

export function Countdown({ endsAt }: { endsAt: number | null }) {
  const [text, setText] = useState(() => textFor(endsAt));
  useEffect(() => {
    setText(textFor(endsAt));
    const interval = window.setInterval(() => setText(textFor(endsAt)), 1000);
    return () => window.clearInterval(interval);
  }, [endsAt]);
  return <strong className="countdown" aria-label={`Thời gian còn lại: ${text}`}>{text}</strong>;
}
