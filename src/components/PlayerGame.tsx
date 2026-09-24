"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  completedLocks,
  hints,
  isLockOneSolved,
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
  const [lockOneDraft, setLockOneDraft] = useState<Answers["lockOne"] | null>(null);
  const [notice, setNotice] = useState("Hãy chọn một thẻ để bắt đầu.");
  const [shownHint, setShownHint] = useState<number | null>(null);
  const loadedTeamId = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await getJson<{ session: Session }>(`/api/sessions/${code}`);
      setSession(data.session);
      const savedId = window.localStorage.getItem(`three-locks:${code}`);
      if (savedId) {
        const savedTeam = data.session.teams.find((item) => item.id === savedId) ?? null;
        setTeam((currentTeam) => {
          if (!savedTeam) return null;
          if (currentTeam?.id === savedTeam.id && currentTeam.updatedAt > savedTeam.updatedAt) return currentTeam;
          return savedTeam;
        });
        if (savedTeam && loadedTeamId.current !== savedTeam.id) {
          loadedTeamId.current = savedTeam.id;
          setLockOneDraft(savedTeam.answers.lockOne);
        }
      }
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
      loadedTeamId.current = data.team.id;
      setLockOneDraft(data.team.answers.lockOne);
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
  const lockOneInteractive = playable && locks < 1;
  const lockTwoInteractive = playable && locks >= 1;
  const activeLockOne = lockOneDraft ?? team.answers.lockOne;
  const moveLockOneCard = (cardId: string, group: "origins" | "properties" | "unclassified") => {
    const card = lockOneCards.find((item) => item.id === cardId);
    if (!card) return setNotice("Hãy chọn một thẻ để xếp.");
    const { [card.id]: _removed, ...remainingCards } = activeLockOne;
    const lockOne = group === "unclassified" ? remainingCards : { ...remainingCards, [card.id]: group };
    setLockOneDraft(lockOne);
    setSelected(null);
  };
  const updateLockOne = (group: "origins" | "properties" | "unclassified") => {
    if (!selected) return setNotice("Hãy chọn một thẻ để xếp.");
    moveLockOneCard(selected, group);
  };
  const submitLockOne = () => {
    if (!isLockOneSolved(activeLockOne as Record<string, string>)) {
      setNotice("Chưa đúng, hãy kiểm tra lại các thẻ.");
      return;
    }
    void save({ ...team.answers, lockOne: activeLockOne });
  };
  const updateLockTwo = (choice: string) => {
    if (!selected || (selected !== "belief" && selected !== "distinction")) return setNotice("Hãy chạm đoạn được đánh dấu trước.");
    updateLockTwoAt(selected, choice);
  };
  const updateLockTwoAt = (slot: "belief" | "distinction", choice: string) => {
    const answers = { ...team.answers, lockTwo: { ...team.answers.lockTwo, [slot]: choice as never } };
    setSelected(null); void save(answers);
  };
  const updateLockThree = (choice: string) => {
    if (!selected || (selected !== "inclusion" && selected !== "voluntary")) return setNotice("Hãy chọn một hành động trước.");
    const answers = { ...team.answers, lockThree: { ...team.answers.lockThree, [selected]: choice as never } };
    setSelected(null); void save(answers);
  };
  const unclassifiedCards = lockOneCards.filter((card) => !activeLockOne[card.id]);
  const originCards = lockOneCards.filter((card) => activeLockOne[card.id] === "origins");
  const propertyCards = lockOneCards.filter((card) => activeLockOne[card.id] === "properties");
  const selectedLockOneCard = lockOneCards.find((card) => card.id === selected);
  const classifiedCount = lockOneCards.length - unclassifiedCards.length;

  return <main className="player-shell">
    <header className="player-header"><div><p className="eyebrow">ĐỘI {team.name}</p><LockProgress completed={locks} /></div><Countdown endsAt={session.endsAt} /></header>
    <section className="case-title"><span className="case-number">HỒ SƠ 03</span><h1>Mở ba khóa.<br />Hoàn tất hồ sơ.</h1><p>Mỗi lựa chọn đúng giúp cả đội tiến gần hơn tới lời giải.</p></section>
    {session.status === "draft" && <p className="banner">MC chưa bắt đầu đồng hồ. Bạn có thể đọc trước đề bài.</p>}
    {session.status === "announced" && <p className="banner warning">Thời gian đã kết thúc. MC đang công bố kết quả.</p>}
    <p className="live-notice" role="status">{notice}</p>
    <LockCard number={1} title="Khôi phục hồ sơ" active={lockOneInteractive} unlocked={locks >= 1} hint={shownHint === 1 ? hints[1] : undefined} onHint={() => useHint(1)}>
      <p>{locks >= 1 ? "Khóa 1 đã được nộp đúng nên các thẻ đã được cố định." : "Kéo thẻ vào ngăn đích; trên điện thoại, chạm thẻ rồi chạm tên ngăn. Bạn luôn có thể chuyển lại thẻ đã xếp."}</p>
      <p className="classification-progress" aria-live="polite">Đã xếp {classifiedCount}/6 thẻ</p>
      <p className="move-status" aria-live="polite">{locks >= 1 ? "Khóa 1 đã hoàn thành và không thể chỉnh sửa." : selectedLockOneCard ? <>Đang di chuyển: <strong>{selectedLockOneCard.text}</strong>. Chọn một ngăn bên dưới.</> : "Chọn một thẻ để di chuyển."}</p>
      <div className="classification-board">
        <ClassificationColumn title="Chưa phân loại" count={unclassifiedCards.length} total={6} cards={unclassifiedCards} selected={selected} destination="unclassified" playable={lockOneInteractive} onSelect={setSelected} onMove={updateLockOne} onDropCard={moveLockOneCard} />
        <ClassificationColumn title="Nguồn gốc của tôn giáo" count={originCards.length} total={3} cards={originCards} selected={selected} destination="origins" playable={lockOneInteractive} onSelect={setSelected} onMove={updateLockOne} onDropCard={moveLockOneCard} />
        <ClassificationColumn title="Tính chất của tôn giáo" count={propertyCards.length} total={3} cards={propertyCards} selected={selected} destination="properties" playable={lockOneInteractive} onSelect={setSelected} onMove={updateLockOne} onDropCard={moveLockOneCard} />
      </div>
      <div className="lock-submit"><button className="button primary" type="button" onClick={submitLockOne} disabled={!lockOneInteractive || classifiedCount !== 6}>Nộp Khóa 1</button>{locks < 1 && classifiedCount !== 6 && <span>Cần xếp đủ 6 thẻ để nộp.</span>}</div>
    </LockCard>
    <LockCard number={2} title="Sửa thông điệp bị sai" active={lockTwoInteractive} locked={locks < 1} unlocked={locks >= 2} hint={shownHint === 2 ? hints[2] : undefined} onHint={() => useHint(2)}>
      <p>Kéo thẻ sửa vào đoạn sai; trên điện thoại, chạm thẻ rồi chạm đoạn cần thay.</p>
      <p className="message">“Tôn trọng tự do tín ngưỡng nghĩa là <LockTwoReplacement slot="belief" originalText="chỉ tôn trọng người có tín ngưỡng" choiceId={team.answers.lockTwo.belief} selected={selected === "belief"} playable={lockTwoInteractive} onSelect={() => setSelected("belief")} onDropChoice={updateLockTwoAt} />. Khi giải quyết vấn đề tôn giáo, có thể <LockTwoReplacement slot="distinction" originalText="xem tín ngưỡng, tôn giáo và việc lợi dụng tín ngưỡng, tôn giáo là một" choiceId={team.answers.lockTwo.distinction} selected={selected === "distinction"} playable={lockTwoInteractive} onSelect={() => setSelected("distinction")} onDropChoice={updateLockTwoAt} />.”</p>
      <div className="choice-list">{lockTwoChoices.map((choice) => <button key={choice.id} className="chip lock-two-choice" type="button" draggable={lockTwoInteractive} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("lock-two-choice", choice.id); }} onClick={() => updateLockTwo(choice.id)} disabled={!lockTwoInteractive}>{choice.text}</button>)}</div>
    </LockCard>
    <LockCard number={3} title="Trở lại khu phố" active={playable && locks >= 2} locked={locks < 2} unlocked={locks >= 3} hint={shownHint === 3 ? hints[3] : undefined} onHint={() => useHint(3)}>
      <p>Chạm một hành động, rồi ghép với căn cứ trực tiếp nhất trong hai thẻ. Mỗi hàng sẽ hiện căn cứ đội đã chọn.</p>
      <div className="matching-board">
        {lockThreeActions.map((action) => {
          const basis = lockThreeBases.find((item) => item.id === team.answers.lockThree[action.id]);
          return <div className="matching-row" role="group" aria-label={`Cặp ghép: ${action.text}`} key={action.id}>
            <button className={`chip matching-action ${selected === action.id ? "selected" : ""}`} type="button" onClick={() => setSelected(action.id)} disabled={!playable || locks < 2}>{action.text}</button>
            <span className="matching-arrow" aria-hidden="true">→</span>
            <p className={`matching-basis ${basis ? "is-filled" : ""}`} aria-live="polite">{basis?.text ?? "Chưa chọn căn cứ"}</p>
          </div>;
        })}
      </div>
      <div className="choice-list bases">{lockThreeBases.map((basis) => <button key={basis.id} className="chip" type="button" onClick={() => updateLockThree(basis.id)} disabled={!playable || locks < 2}>{basis.text}</button>)}</div>
    </LockCard>
    {(session.status === "solutions" || locks === 3) && <section className="solution-card"><p className="eyebrow">HỒ SƠ ĐÃ HOÀN TẤT</p><h2>Lời giải then chốt</h2>{[1, 2, 3].map((lock) => <p key={lock}>{solutions[lock as 1 | 2 | 3]}</p>)}</section>}
  </main>;
}

function LockCard({ number, title, children, active, locked, unlocked, hint, onHint }: { number: number; title: string; children: React.ReactNode; active: boolean; locked?: boolean; unlocked: boolean; hint?: string; onHint: () => void }) {
  return <section className={`lock-card ${locked ? "is-locked" : ""}`} aria-labelledby={`lock-${number}`}><div className="lock-card-head"><span>{unlocked ? "ĐÃ MỞ" : `KHÓA ${number}`}</span><button className="text-button" onClick={onHint} disabled={!active}>Gợi ý</button></div><h2 id={`lock-${number}`}>{title}</h2>{locked ? <p>Hoàn thành khóa trước để mở hồ sơ này.</p> : children}{hint && <p className="hint" role="status">Gợi ý: {hint}</p>}{unlocked && <p className="success">✓ Khóa đã mở — hãy ghi nhớ lời giải.</p>}</section>;
}

function ClassificationColumn({ title, count, total, cards, selected, destination, playable, onSelect, onMove, onDropCard }: {
  title: string;
  count: number;
  total: number;
  cards: readonly (typeof lockOneCards)[number][];
  selected: string | null;
  destination: "origins" | "properties" | "unclassified";
  playable: boolean;
  onSelect: (cardId: string) => void;
  onMove: (destination: "origins" | "properties" | "unclassified") => void;
  onDropCard: (cardId: string, destination: "origins" | "properties" | "unclassified") => void;
}) {
  const label = `${title} (${count}/${total})`;
  const [isDropTarget, setIsDropTarget] = useState(false);
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDropTarget(false);
    const cardId = event.dataTransfer.getData("text/plain");
    if (playable && cardId) onDropCard(cardId, destination);
  };
  return <section className={`classification-column ${isDropTarget ? "is-drop-target" : ""}`} aria-label={label} onDragOver={(event) => event.preventDefault()} onDragEnter={() => playable && setIsDropTarget(true)} onDragLeave={() => setIsDropTarget(false)} onDrop={handleDrop}>
    <button className="classification-target" type="button" onClick={() => onMove(destination)} disabled={!playable} aria-label={`Xếp thẻ đã chọn vào ${title}`}>
      <h3>{label}</h3><span>Chọn ngăn này</span>
    </button>
    <div className="classification-list" role="list">
      {cards.map((card) => <button key={card.id} className={`chip classification-card ${selected === card.id ? "selected" : ""}`} type="button" draggable={playable} onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", card.id); }} onDragEnd={() => setIsDropTarget(false)} onClick={() => onSelect(card.id)} disabled={!playable}>{card.text}</button>)}
    </div>
  </section>;
}

function LockTwoReplacement({ slot, originalText, choiceId, selected, playable, onSelect, onDropChoice }: {
  slot: "belief" | "distinction";
  originalText: string;
  choiceId: Answers["lockTwo"]["belief"] | Answers["lockTwo"]["distinction"];
  selected: boolean;
  playable: boolean;
  onSelect: () => void;
  onDropChoice: (slot: "belief" | "distinction", choice: string) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const choice = lockTwoChoices.find((item) => item.id === choiceId);
  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDropTarget(false);
    const droppedChoice = event.dataTransfer.getData("lock-two-choice");
    if (playable && droppedChoice) onDropChoice(slot, droppedChoice);
  };

  return <button className={`inline-choice replacement-target ${selected ? "selected" : ""} ${isDropTarget ? "is-drop-target" : ""}`} type="button" aria-label={`Thay đoạn: ${originalText}`} onClick={onSelect} onDragOver={(event) => event.preventDefault()} onDragEnter={() => playable && setIsDropTarget(true)} onDragLeave={() => setIsDropTarget(false)} onDrop={handleDrop} disabled={!playable}>{choice?.text ?? originalText}</button>;
}
