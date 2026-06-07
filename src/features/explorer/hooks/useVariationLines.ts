import { useEffect, useState } from "react";
import type {
  FetchPositionVariationsParams,
  PositionVariationLineApiDto,
  PositionVariationsApiDto,
} from "../types";
import type { VariationsTab } from "../variationLines";

export type UseVariationLinesOptions = {
  fen: string;
  tab: VariationsTab;
  minElo: number;
  maxElo: number;
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
  minElo,
  maxElo,
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
          minElo,
          maxElo,
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
  }, [
    enabled,
    fen,
    tab,
    minElo,
    maxElo,
    fetchPositionVariations,
    lineCount,
    lineDepth,
  ]);

  return { lines, loading };
}
