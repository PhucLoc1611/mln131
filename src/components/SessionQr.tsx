"use client";

import { QRCodeSVG } from "qrcode.react";

export function SessionQr({ code, origin }: { code: string; origin: string }) {
  const sessionCode = code.toUpperCase();
  const value = new URL(`/play?session=${sessionCode}`, origin).toString();
  return <figure className="session-qr"><QRCodeSVG value={value} size={220} level="H" aria-label={`Mã QR vào phiên ${sessionCode}`} includeMargin /><figcaption><span>MÃ PHIÊN</span><strong>{sessionCode}</strong></figcaption></figure>;
}
