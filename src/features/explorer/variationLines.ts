import type { PositionVariationLineApiDto } from "./types";

export type VariationsTab = "variations" | "popularity" | "endgames";

/** @deprecated Use PositionVariationLineApiDto from ./types */
export type PositionVariationLine = PositionVariationLineApiDto;

export function isVariationLineActive(
  line: PositionVariationLineApiDto,
  selectedLineKey?: string,
  forwardSans: string[] = [],
): boolean {
  if (selectedLineKey && line.key === selectedLineKey) {
    return true;
  }
  if (forwardSans.length === 0) {
    return false;
  }
  const moves = line.moves;
  if (!Array.isArray(moves)) {
    return false;
  }
  return forwardSans.every((san, index) => moves[index]?.san === san);
}
