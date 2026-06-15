import { useEffect, useState } from "react";
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
  lineCount = 8,
  lineDepth = 4,
  enabled = true,
}: UseVariationLinesOptions) {
  const [lines, setLines] = useState<PositionVariationLineApiDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
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
          mode: "variations",
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
  }, [enabled, fen, fetchPositionVariations, lineCount, lineDepth]);

  return { lines, loading };
}
