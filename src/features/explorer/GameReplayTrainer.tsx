import type { CSSProperties, ReactNode } from "react";
import { ChessboardDnDProvider, HighlightChessboard, ThemeProvider } from "react-chess-core";
import { DEFAULT_REFERENCE_LAYOUT } from "./referenceLayout";
import { useGameReplayTraining } from "./hooks/useGameReplayTraining";
import type { ExplorerGameReplayApiDto } from "./types";

export type GameReplayTrainerProps = {
  gameId: string;
  startFen: string;
  fetchGame: (gameId: string) => Promise<ExplorerGameReplayApiDto | null>;
  onExit?: () => void;
  theme?: "light" | "dark";
  boardWidth?: number;
  renderStatus?: (props: {
    loading: boolean;
    error: string | null;
    complete: boolean;
    feedback: "correct" | "incorrect" | null;
    lastExpectedSan: string | null;
    plyIndex: number;
    totalPlies: number;
    game: ExplorerGameReplayApiDto | null;
  }) => ReactNode;
};

const defaultPanelStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
  padding: 12,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const defaultButtonStyle: CSSProperties = {
  fontSize: 13,
  padding: "6px 12px",
  cursor: "pointer",
};

export const GameReplayTrainer = ({
  gameId,
  startFen,
  fetchGame,
  onExit,
  theme = "dark",
  boardWidth = DEFAULT_REFERENCE_LAYOUT.boardWidth,
  renderStatus,
}: GameReplayTrainerProps) => {
  const {
    game,
    fen,
    plyIndex,
    totalPlies,
    complete,
    loading,
    error,
    feedback,
    lastExpectedSan,
    handlePieceDrop,
    revealMove,
  } = useGameReplayTraining({ gameId, startFen, fetchGame });

  const status = renderStatus?.({
    loading,
    error,
    complete,
    feedback,
    lastExpectedSan,
    plyIndex,
    totalPlies,
    game,
  });

  return (
    <ThemeProvider theme={theme}>
      <div style={defaultPanelStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 8,
          }}
        >
          <strong>Replay training</strong>
          {onExit && (
            <button type="button" style={defaultButtonStyle} onClick={onExit}>
              Back to explorer
            </button>
          )}
        </div>

        {game && (
          <div style={{ opacity: 0.85 }}>
            {game.white} vs {game.black} · {game.result}
          </div>
        )}

        {status ?? (
          <div style={{ minHeight: 20 }}>
            {loading && "Loading game…"}
            {error && <span style={{ color: "#c62828" }}>{error}</span>}
            {!loading && !error && complete && "Game complete."}
            {!loading && !error && !complete && feedback === "correct" && (
              <span style={{ color: "#2e7d32" }}>Correct!</span>
            )}
            {!loading &&
              !error &&
              !complete &&
              feedback === "incorrect" &&
              lastExpectedSan && (
                <span style={{ color: "#ef6c00" }}>
                  Expected {lastExpectedSan}
                </span>
              )}
            {!loading && !error && !complete && feedback === null && (
              <span>
                Guess move {plyIndex + 1} of {totalPlies}
              </span>
            )}
          </div>
        )}

        <ChessboardDnDProvider>
          <HighlightChessboard
            boardWidth={boardWidth}
            position={fen}
            checkSquare=""
            hintSquare={null}
            incorrectMoveSquare={null}
            onPieceDrop={handlePieceDrop}
            promotionDialogVariant="modal"
          />
        </ChessboardDnDProvider>

        {!complete && !loading && !error && (
          <button type="button" style={defaultButtonStyle} onClick={revealMove}>
            Show move
          </button>
        )}
      </div>
    </ThemeProvider>
  );
};
