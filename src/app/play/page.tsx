import { PlayerGame } from "@/components/PlayerGame";

export default async function PlayPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const { session } = await searchParams;
  if (!session) return <main className="loading-page">Thiếu mã phiên. Hãy mở đường dẫn do MC cung cấp.</main>;
  return <PlayerGame code={session.toUpperCase()} />;
}
