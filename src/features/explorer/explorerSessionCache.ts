import { normalizeFen } from "./positionUtils";
import type {
  FetchPositionGamesParams,
  PositionGamesApiDto,
  PositionVariationLineApiDto,
} from "./types";

export const EXPLORER_PREFETCH_CHILD_COUNT = 4;
export const EXPLORER_DEFAULT_VARIATION_LINE_COUNT = 8;
export const EXPLORER_DEFAULT_VARIATION_DEPTH = 4;

export function gamesSessionKey(params: FetchPositionGamesParams): string {
  return JSON.stringify({
    fen: normalizeFen(params.fen),
    uci: params.uci ?? "",
    sources: params.sources?.slice().sort().join(",") ?? "",
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
  });
}

export function variationsSessionKey(
  fen: string,
  lineCount = EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
  lineDepth = EXPLORER_DEFAULT_VARIATION_DEPTH,
): string {
  return JSON.stringify({
    fen: normalizeFen(fen),
    mode: "variations",
    lineCount,
    lineDepth,
  });
}

const sessionGames = new Map<string, PositionGamesApiDto>();
const sessionVariations = new Map<string, PositionVariationLineApiDto[]>();

type SessionCacheListener = () => void;
const sessionCacheListeners = new Set<SessionCacheListener>();

export function subscribeExplorerSessionCache(
  listener: SessionCacheListener,
): () => void {
  sessionCacheListeners.add(listener);
  return () => {
    sessionCacheListeners.delete(listener);
  };
}

function notifySessionCacheListeners(): void {
  for (const listener of sessionCacheListeners) {
    listener();
  }
}

export function peekSessionGames(
  key: string,
): PositionGamesApiDto | undefined {
  return sessionGames.get(key);
}

export function setSessionGames(
  key: string,
  data: PositionGamesApiDto,
): void {
  sessionGames.set(key, data);
  notifySessionCacheListeners();
}

export function peekSessionVariations(
  key: string,
): PositionVariationLineApiDto[] | undefined {
  return sessionVariations.get(key);
}

export function setSessionVariations(
  key: string,
  lines: PositionVariationLineApiDto[],
): void {
  sessionVariations.set(key, lines);
  notifySessionCacheListeners();
}

/** @internal Test-only: drop in-memory session caches. */
export function clearExplorerSessionCacheForTests(): void {
  sessionGames.clear();
  sessionVariations.clear();
}
