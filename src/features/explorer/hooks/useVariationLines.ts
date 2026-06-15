import { useEffect, useMemo, useState } from "react";
import {
  EXPLORER_DEFAULT_VARIATION_DEPTH,
  EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
  peekSessionVariations,
  setSessionVariations,
  subscribeExplorerSessionCache,
  variationsSessionKey,
} from "../explorerSessionCache";
import type {
  FetchPositionVariationsParams,
  PositionVariationLineApiDto,
  PositionVariationsApiDto,
} from "../types";

export type UseVariationLinesOptions = {
  fen: string;
  fetchPositionVariations: (
    params: FetchPositionVariationsParams,
  ) => Promise<PositionVariationsApiDto | null>;
  lineCount?: number;
  lineDepth?: number;
  enabled?: boolean;
};

export function useVariationLines({
  fen,
  fetchPositionVariations,
  lineCount = EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
  lineDepth = EXPLORER_DEFAULT_VARIATION_DEPTH,
  enabled = true,
}: UseVariationLinesOptions) {
  const cacheKey = useMemo(
    () => variationsSessionKey(fen, lineCount, lineDepth),
    [fen, lineCount, lineDepth],
  );
  const [lines, setLines] = useState<PositionVariationLineApiDto[]>(() => {
    if (!enabled) {
      return [];
    }
    return peekSessionVariations(cacheKey) ?? [];
  });
  const [loading, setLoading] = useState(() => {
    if (!enabled) {
      return false;
    }
    return peekSessionVariations(cacheKey) === undefined;
  });

  useEffect(() => {
    return subscribeExplorerSessionCache(() => {
      if (!enabled) {
        return;
      }
      const cachedLines = peekSessionVariations(cacheKey);
      if (!cachedLines) {
        return;
      }
      setLines(cachedLines);
      setLoading(false);
    });
  }, [enabled, cacheKey]);

  useEffect(() => {
    if (!enabled) {
      setLines([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const cachedLines = peekSessionVariations(cacheKey);
    if (cachedLines) {
      setLines(cachedLines);
      setLoading(false);
    } else {
      setLoading(true);
    }

    void (async () => {
      try {
        const result = await fetchPositionVariations({
          fen,
          mode: "variations",
          lineCount,
          depth: lineDepth,
        });

        if (cancelled) return;
        const nextLines = result?.lines ?? [];
        setSessionVariations(cacheKey, nextLines);
        setLines(nextLines);
      } catch {
        if (!cancelled) {
          setLines([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, fen, fetchPositionVariations, lineCount, lineDepth, cacheKey]);

  return { lines, loading: enabled ? loading : false };
}
