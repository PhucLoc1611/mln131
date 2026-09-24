"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  completedLocks,
  hints,
  lockOneCards,
  lockThreeActions,
  lockThreeBases,
  lockTwoChoices,
  solutions,
  type Answers,
  type Session,
  type TeamProgress,
} from "@/lib/game";
import { Countdown } from "./Countdown";
import { LockProgress } from "./LockProgress";

const getJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Không thể kết nối máy chủ.");
  return payload;
};

export function PlayerGame({ code }: { code: string }) {
  const [session, setSession] = useState<Session | null>(null);
  const [team, setTeam] = useState<TeamProgress | null>(null);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("Hãy chọn một thẻ để bắt đầu.");
  const [shownHint, setShownHint] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getJson<{ session: Session }>(`/api/sessions/${code}`);
      setSession(data.session);
      const savedId = window.localStorage.getItem(`three-locks:${code}`);
      if (savedId) setTeam(data.session.teams.find((item) => item.id === savedId) ?? null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể tải phiên chơi.");
    }
  }, [code]);

  useEffect(() => {
    void refresh();
    const poller = window.setInterval(() => void refresh(), 2000);
    return () => window.clearInterval(poller);
  }, [refresh]);

  const join = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const data = await getJson<{ team: TeamProgress }>(`/api/sessions/${code}/teams`, { method: "POST", body: JSON.stringify({ name }) });
      window.localStorage.setItem(`three-locks:${code}`, data.team.id);
      setTeam(data.team);
      setNotice(`Đã vào phiên với tên ${data.team.name}. Chờ MC bắt đầu hoặc mở Khóa 1.`);
      void refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể vào phiên.");
    }
  };

  const save = async (answers: Answers, hintUsed = false) => {
    if (!team) return;
    try {
      const data = await getJson<{ team: TeamProgress }>(`/api/sessions/${code}/teams/${team.id}`, {
        method: "PATCH",
        body: JSON.stringify({ answers, hintUsed }),
      });
      setTeam(data.team);
      const locks = completedLocks(data.team);
      setNotice(locks > completedLocks(team) ? `Chìa khóa ${locks} đã mở!` : "Đã ghi nhận. Bạn có thể điều chỉnh đáp án.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không thể lưu đáp án.");
    }
  };

  const useHint = (lock: 1 | 2 | 3) => {
    setShownHint(lock);
    if (team && session?.status === "active") void save(team.answers, true);
  };

  if (!session) return <main className="loading-page">Đang mở hồ sơ…</main>;
  if (!team) {
    return <main className="join-page"><section className="join-card"><p className="eyebrow">PHIÊN {code}</p><h1>Ba Khóa<br />Hồ Sơ Kiến Thức</h1><p>Nhập đúng tên đội đang dùng trong buổi học.</p><form onSubmit={join}><label htmlFor="team-name">Tên đội</label><input id="team-name" value={name} maxLength={40} onChange={(event) => setName(event.target.value)} required /><button className="button primary" type="submit">Vào hồ sơ</button></form><p role="status">{notice}</p></section></main>;
  }

  const locks = completedLocks(team);
  const playable = session.status === "active" && (!session.endsAt || session.endsAt > Date.now());
  const updateLockOne = (group: "origins" | "properties") => {
    if (!selected) return setNotice("Hãy chọn một thẻ trước.");
    const answers = { ...team.answers, lockOne: { ...team.answers.lockOne, [selected]: group } };
    setSelected(null); void save(answers);
  };
  const updateLockTwo = (choice: string) => {
    if (!selected || (selected !== "belief" && selected !== "distinction")) return setNotice("Hãy chạm đoạn được đánh dấu trước.");
    const answers = { ...team.answers, lockTwo: { ...team.answers.lockTwo, [selected]: choice as never } };
    setSelected(null); void save(answers);
  };
  const updateLockThree = (choice: string) => {
    if (!selected || (selected !== "inclusion" && selected !== "voluntary")) return setNotice("Hãy chọn một hành động trước.");
    const answers = { ...team.answers, lockThree: { ...team.answers.lockThree, [selected]: choice as never } };
    setSelected(null); void save(answers);
  };

  return <main className="player-shell">
    <header className="player-header"><div><p className="eyebrow">ĐỘI {team.name}</p><LockProgress completed={locks} /></div><Countdown endsAt={session.endsAt} /></header>
    <section className="case-title"><span className="case-number">HỒ SƠ 03</span><h1>Mở ba khóa.<br />Hoàn tất hồ sơ.</h1><p>Mỗi lựa chọn đúng giúp cả đội tiến gần hơn tới lời giải.</p></section>
    {session.status === "draft" && <p className="banner">MC chưa bắt đầu đồng hồ. Bạn có thể đọc trước đề bài.</p>}
    {session.status === "announced" && <p className="banner warning">Thời gian đã kết thúc. MC đang công bố kết quả.</p>}
    <p className="live-notice" role="status">{notice}</p>
    <LockCard number={1} title="Khôi phục hồ sơ" active={playable} unlocked={locks >= 1} hint={shownHint === 1 ? hints[1] : undefined} onHint={() => useHint(1)}>
      <p>Chạm một thẻ, rồi chạm ngăn thích hợp để xếp.</p><div className="chip-grid">{lockOneCards.map((card) => <button key={card.id} className={`chip ${selected === card.id ? "selected" : ""} ${team.answers.lockOne[card.id] ? "answered" : ""}`} onClick={() => setSelected(card.id)} disabled={!playable}>{card.text}</button>)}</div>
      <div className="bins"><button onClick={() => updateLockOne("origins")} disabled={!playable}>Nguồn gốc của tôn giáo</button><button onClick={() => updateLockOne("properties")} disabled={!playable}>Tính chất của tôn giáo</button></div>
    </LockCard>
    <LockCard number={2} title="Sửa thông điệp bị sai" active={playable && locks >= 1} locked={locks < 1} unlocked={locks >= 2} hint={shownHint === 2 ? hints[2] : undefined} onHint={() => useHint(2)}>
      <p className="message">“Tôn trọng tự do tín ngưỡng nghĩa là <button className={`inline-choice ${selected === "belief" ? "selected" : ""}`} onClick={() => setSelected("belief")} disabled={!playable || locks < 1}>chỉ tôn trọng người có tín ngưỡng</button>. Khi giải quyết vấn đề tôn giáo, có thể <button className={`inline-choice ${selected === "distinction" ? "selected" : ""}`} onClick={() => setSelected("distinction")} disabled={!playable || locks < 1}>xem tín ngưỡng, tôn giáo và việc lợi dụng tín ngưỡng, tôn giáo là một</button>.”</p><div className="choice-list">{lockTwoChoices.map((choice) => <button key={choice.id} className="chip" onClick={() => updateLockTwo(choice.id)} disabled={!playable || locks < 1}>{choice.text}</button>)}</div>
    </LockCard>
    <LockCard number={3} title="Trở lại khu phố" active={playable && locks >= 2} locked={locks < 2} unlocked={locks >= 3} hint={shownHint === 3 ? hints[3] : undefined} onHint={() => useHint(3)}>
      <p>Chạm một hành động, rồi ghép với căn cứ trực tiếp nhất trong hai thẻ.</p><div className="choice-list">{lockThreeActions.map((action) => <button key={action.id} className={`chip ${selected === action.id ? "selected" : ""}`} onClick={() => setSelected(action.id)} disabled={!playable || locks < 2}>{action.text}</button>)}</div><div className="choice-list bases">{lockThreeBases.map((basis) => <button key={basis.id} className="chip" onClick={() => updateLockThree(basis.id)} disabled={!playable || locks < 2}>{basis.text}</button>)}</div>
    </LockCard>
    {(session.status === "solutions" || locks === 3) && <section className="solution-card"><p className="eyebrow">HỒ SƠ ĐÃ HOÀN TẤT</p><h2>Lời giải then chốt</h2>{[1, 2, 3].map((lock) => <p key={lock}>{solutions[lock as 1 | 2 | 3]}</p>)}</section>}
  </main>;
}

function LockCard({ number, title, children, active, locked, unlocked, hint, onHint }: { number: number; title: string; children: React.ReactNode; active: boolean; locked?: boolean; unlocked: boolean; hint?: string; onHint: () => void }) {
  return <section className={`lock-card ${locked ? "is-locked" : ""}`} aria-labelledby={`lock-${number}`}><div className="lock-card-head"><span>{unlocked ? "ĐÃ MỞ" : `KHÓA ${number}`}</span><button className="text-button" onClick={onHint} disabled={!active}>Gợi ý</button></div><h2 id={`lock-${number}`}>{title}</h2>{locked ? <p>Hoàn thành khóa trước để mở hồ sơ này.</p> : children}{hint && <p className="hint" role="status">Gợi ý: {hint}</p>}{unlocked && <p className="success">✓ Khóa đã mở — hãy ghi nhớ lời giải.</p>}</section>;
}
