import type { LockNumber } from "@/lib/game";

export function LockProgress({ completed }: { completed: number }) {
  return (
    <div className="lock-progress" aria-label={`${completed} trên 3 khóa đã mở`}>
      {[1, 2, 3].map((lock) => (
        <span key={lock} aria-hidden="true" className={lock <= completed ? "lock-icon unlocked" : "lock-icon"}>
          {lock <= completed ? "🔓" : "🔒"}
        </span>
      ))}
      <span className="sr-only">{completed as LockNumber} khóa đã mở</span>
    </div>
  );
}
