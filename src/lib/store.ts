import "server-only";
import { Redis } from "@upstash/redis";
import { emptyAnswers, type Session, type SessionStatus, type TeamProgress } from "./game";

export type GameStore = {
  createSession: () => Promise<Session>;
  getSession: (code: string) => Promise<Session | null>;
  saveSession: (session: Session) => Promise<Session>;
  upsertTeam: (code: string, name: string) => Promise<TeamProgress>;
  saveTeam: (code: string, team: TeamProgress) => Promise<TeamProgress>;
  setSessionState: (code: string, status: SessionStatus, endsAt?: number | null) => Promise<Session>;
};

const keyFor = (code: string) => `three-locks:session:${code}`;
const normalizeCode = (code: string) => code.trim().toUpperCase();
const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");
const nameKey = (name: string) => normalizeName(name).toLocaleLowerCase("vi");

function makeSession(): Session {
  return {
    code: crypto.randomUUID().slice(0, 6).toUpperCase(),
    status: "draft",
    createdAt: Date.now(),
    startsAt: null,
    endsAt: null,
    teams: [],
  };
}

function makeTeam(name: string): TeamProgress {
  return {
    id: crypto.randomUUID(),
    name: normalizeName(name),
    answers: emptyAnswers(),
    hintCount: 0,
    completedAt: {},
    updatedAt: Date.now(),
  };
}

function ensureName(name: string) {
  const clean = normalizeName(name);
  if (!clean || clean.length > 40) throw new Error("Tên đội cần có từ 1 đến 40 ký tự.");
  return clean;
}

function createStore(read: (code: string) => Promise<Session | null>, write: (session: Session) => Promise<void>): GameStore {
  return {
    async createSession() {
      const session = makeSession();
      await write(session);
      return session;
    },
    getSession: async (code) => read(normalizeCode(code)),
    async saveSession(session) {
      await write(session);
      return session;
    },
    async upsertTeam(code, name) {
      const cleanName = ensureName(name);
      const session = await read(normalizeCode(code));
      if (!session) throw new Error("Không tìm thấy phiên chơi.");
      const existing = session.teams.find((team) => nameKey(team.name) === nameKey(cleanName));
      if (existing) return existing;
      const team = makeTeam(cleanName);
      session.teams.push(team);
      await write(session);
      return team;
    },
    async saveTeam(code, team) {
      const session = await read(normalizeCode(code));
      if (!session) throw new Error("Không tìm thấy phiên chơi.");
      const index = session.teams.findIndex((item) => item.id === team.id);
      if (index === -1) throw new Error("Không tìm thấy đội chơi.");
      session.teams[index] = team;
      await write(session);
      return team;
    },
    async setSessionState(code, status, endsAt) {
      const session = await read(normalizeCode(code));
      if (!session) throw new Error("Không tìm thấy phiên chơi.");
      const now = Date.now();
      session.status = status;
      if (status === "active") {
        session.startsAt ??= now;
        session.endsAt = endsAt ?? now + 5 * 60 * 1000;
      } else if (endsAt !== undefined) {
        session.endsAt = endsAt;
      }
      await write(session);
      return session;
    },
  };
}

export function createMemoryStore(): GameStore {
  const sessions = new Map<string, Session>();
  return createStore(
    async (code) => sessions.get(code) ?? null,
    async (session) => void sessions.set(session.code, structuredClone(session)),
  );
}

function createRedisStore(): GameStore {
  // Upstash's HTTP client is designed for serverless/Next.js; credentials stay server-side.
  // Source: https://upstash.com/docs/redis/howto/connect-with-upstash-redis
  const redis = Redis.fromEnv();
  return createStore(
    async (code) => (await redis.get<Session>(keyFor(code))) ?? null,
    async (session) => void (await redis.set(keyFor(session.code), session)),
  );
}

const hasRedisCredentials = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
export const store: GameStore = hasRedisCredentials ? createRedisStore() : createMemoryStore();
