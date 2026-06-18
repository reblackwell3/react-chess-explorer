import { useEffect } from "react";
import {
  EXPLORER_DEFAULT_VARIATION_DEPTH,
  EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
  EXPLORER_PREFETCH_CHILD_COUNT,
  gamesSessionKey,
  peekSessionGames,
  peekSessionVariations,
  setSessionGames,
  setSessionVariations,
  variationsSessionKey,
} from "../explorerSessionCache";
import { fenAfterUci } from "../positionUtils";
import type {
  FetchPositionGamesParams,
  FetchPositionVariationsParams,
  GameSource,
  PositionGamesApiDto,
  PositionMoveApiDto,
  PositionVariationsApiDto,
} from "../types";
import { ALL_GAME_SOURCES } from "../types";

export type UseExplorerPrefetchOptions = {
  fen: string;
  moves: PositionMoveApiDto[];
  positionReady: boolean;
  sources: GameSource[];
  fetchPositionGames: (
    params: FetchPositionGamesParams,
  ) => Promise<PositionGamesApiDto>;
  fetchPositionVariations?: (
    params: FetchPositionVariationsParams,
  ) => Promise<PositionVariationsApiDto | null>;
  childCount?: number;
};

export function useExplorerPrefetch({
  fen,
  moves,
  positionReady,
  sources,
  fetchPositionGames,
  fetchPositionVariations,
  childCount = EXPLORER_PREFETCH_CHILD_COUNT,
}: UseExplorerPrefetchOptions): void {
  useEffect(() => {
    if (!positionReady || moves.length === 0) {
      return;
    }

    let cancelled = false;
    let idleHandle: number | undefined;
    let deferTimer: ReturnType<typeof setTimeout> | undefined;

    const prefetchChildren = () => {
      if (cancelled) {
        return;
      }

      const sourcesParam =
        sources.length < ALL_GAME_SOURCES.length ? sources : undefined;

      const prefetchMove = (move: PositionMoveApiDto) => {
        const childFen = fenAfterUci(fen, move.uci);
        if (!childFen) {
          return Promise.resolve();
        }

        const gamesKey = gamesSessionKey({
          fen: childFen,
          sources: sourcesParam,
        });
        const gamesPromise = peekSessionGames(gamesKey)
          ? Promise.resolve()
          : fetchPositionGames({ fen: childFen, sources: sourcesParam })
              .then((games) => {
                if (!cancelled) {
                  setSessionGames(gamesKey, games);
                }
              })
              .catch(() => undefined);

        if (!fetchPositionVariations) {
          return gamesPromise;
        }

        const variationsKey = variationsSessionKey(childFen);
        const variationsPromise = peekSessionVariations(variationsKey)
          ? Promise.resolve()
          : fetchPositionVariations({
              fen: childFen,
              mode: "variations",
              lineCount: EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
              depth: EXPLORER_DEFAULT_VARIATION_DEPTH,
            })
              .then((result) => {
                if (!cancelled) {
                  setSessionVariations(
                    variationsKey,
                    result?.lines ?? [],
                  );
                }
              })
              .catch(() => undefined);

        return Promise.all([gamesPromise, variationsPromise]).then(() => undefined);
      };

      void (async () => {
        const movesToPrefetch = moves.slice(0, childCount);
        for (let index = 0; index < movesToPrefetch.length; index += 2) {
          if (cancelled) {
            return;
          }
          await Promise.all(
            movesToPrefetch.slice(index, index + 2).map(prefetchMove),
          );
        }
      })();
    };

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(prefetchChildren, {
        timeout: 1500,
      });
    } else {
      deferTimer = setTimeout(prefetchChildren, 750);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) {
        window.cancelIdleCallback(idleHandle);
      }
      if (deferTimer !== undefined) {
        clearTimeout(deferTimer);
      }
    };
  }, [
    fen,
    moves,
    positionReady,
    sources,
    fetchPositionGames,
    fetchPositionVariations,
    childCount,
  ]);
}
