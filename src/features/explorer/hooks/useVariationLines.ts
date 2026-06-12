import { useEffect, useState } from "react";
import {
  EXPLORER_DEFAULT_MAX_ELO,
  EXPLORER_DEFAULT_MIN_ELO,
} from "../constants";
import type {
  FetchPositionVariationsParams,
  PositionVariationLineApiDto,
  PositionVariationsApiDto,
} from "../types";
import type { VariationsTab } from "../variationLines";

export type UseVariationLinesOptions = {
  fen: string;
  tab: VariationsTab;
  fetchPositionVariations: (
    params: FetchPositionVariationsParams,
  ) => Promise<PositionVariationsApiDto | null>;
  lineCount?: number;
  lineDepth?: number;
  enabled?: boolean;
};

export function useVariationLines({
  fen,
  tab,
  fetchPositionVariations,
  lineCount = 8,
  lineDepth = 4,
  enabled = true,
}: UseVariationLinesOptions) {
  const [lines, setLines] = useState<PositionVariationLineApiDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || tab === "endgames") {
      setLines([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const result = await fetchPositionVariations({
          fen,
          mode: tab,
          minElo: EXPLORER_DEFAULT_MIN_ELO,
          maxElo: EXPLORER_DEFAULT_MAX_ELO,
          lineCount,
          depth: lineDepth,
        });

        if (cancelled) return;
        setLines(result?.lines ?? []);
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
  }, [enabled, fen, tab, fetchPositionVariations, lineCount, lineDepth]);

  return { lines, loading };
}
