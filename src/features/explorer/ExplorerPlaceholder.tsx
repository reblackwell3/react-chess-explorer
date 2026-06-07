import { HighlightChessboard, ThemeProvider } from "react-chess-core";
import { EXPLORER_START_FEN } from "./constants";

export type ExplorerPlaceholderProps = {
  theme?: "light" | "dark";
  /** Pixel width of the board. */
  boardWidth?: number;
};

/**
 * Scaffold UI — proves core wiring and Rollup build.
 * Replace with game replay once requirements are defined.
 */
export const ExplorerPlaceholder = ({
  theme = "dark",
  boardWidth = 400,
}: ExplorerPlaceholderProps) => (
  <ThemeProvider theme={theme}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <HighlightChessboard
        boardWidth={boardWidth}
        position={EXPLORER_START_FEN}
        checkSquare=""
        hintSquare={null}
        incorrectMoveSquare={null}
      />
      <p
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          fontSize: 14,
          opacity: 0.8,
        }}
      >
        react-chess-explorer (scaffold) — game replay UI not implemented yet.
      </p>
    </div>
  </ThemeProvider>
);
