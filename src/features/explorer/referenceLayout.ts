/** ChessBase Reference–style proportions: wide board column, narrower data column. */
export type ReferenceLayoutConfig = {
  /** Pixel width passed to HighlightChessboard (left column centers the board). */
  boardWidth: number;
  /** CSS grid track for the board column. */
  boardColumn: string;
  /** CSS grid track for the reference panel. */
  referenceColumn: string;
  columnGap: number;
  /** Shell height when {@link PositionReferenceExplorerProps.fillHeight} is true. */
  minHeight: string;
};

export const DEFAULT_REFERENCE_LAYOUT: ReferenceLayoutConfig = {
  boardWidth: 560,
  boardColumn: "minmax(420px, 1.45fr)",
  referenceColumn: "minmax(380px, 1fr)",
  columnGap: 0,
  minHeight: "calc(100vh - 120px)",
};
