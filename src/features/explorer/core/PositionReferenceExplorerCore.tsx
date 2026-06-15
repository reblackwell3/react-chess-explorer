import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChessboardDnDProvider } from "react-chessboard";
import { HighlightChessboard, ThemeProvider, usePositionKeyboardNav } from "react-chess-core";
import { DefaultReferencePanel } from "../defaults/DefaultReferencePanel";
import {
  defaultRenderBoardNav,
  defaultRenderGamesPanel,
  defaultRenderLayout,
  defaultRenderMoveStats,
  defaultRenderStatus,
  defaultRenderVariationsStrip,
} from "../defaults/defaultRenderers";
import { DEFAULT_REFERENCE_LAYOUT } from "../referenceLayout";
import { usePositionReferenceData } from "../hooks/usePositionReferenceData";
import { useVariationLines } from "../hooks/useVariationLines";
import type { PositionReferenceExplorerCoreProps } from "./renderProps";
export const PositionReferenceExplorerCore = ({
  fen: fenProp,
  onFenChange,
  initialLineSans,
  onLineSansChange,
  fetchPosition,
  fetchPositionGames,
  fetchPositionVariations,
  theme = "dark",
  boardTheme,
  boardWidth = DEFAULT_REFERENCE_LAYOUT.boardWidth,
  boardOrientation: boardOrientationProp,
  defaultBoardOrientation = "white",
  onBoardOrientationChange,
  fillHeight = true,
  layoutMinHeight,
  renderLayout = defaultRenderLayout,
  renderStatus = defaultRenderStatus,
  renderMoveStats = defaultRenderMoveStats,
  renderVariationsStrip = defaultRenderVariationsStrip,
  renderGamesPanel = defaultRenderGamesPanel,
  renderBoardNav = defaultRenderBoardNav,
  onGameSelect,
  keyboardNav = true,
}: PositionReferenceExplorerCoreProps) => {
  const referenceData = usePositionReferenceData({
    fenProp,
    onFenChange,
    initialLineSans,
    onLineSansChange,
    fetchPosition,
    fetchPositionGames,
  });
  const {
    fen,
    boardFen,
    games,
    sources,
    lineSans,
    loading,
    showPositionLoading,
    gamesLoading,
    positionReady,
    displayMoves,
    error,
    lineLabel,
    canGoBack,
    canGoForward,
    forwardSans,
    selectedVariationKey,
    setSources,
    handleMoveSelect,
    handleLineSelect,
    handlePieceDrop,
    handleBack,
    handleForward,
    handleFirst,
    handleLast,
  } = referenceData;

  usePositionKeyboardNav({
    enabled: keyboardNav,
    canPrev: canGoBack,
    canNext: canGoForward,
    onPrev: handleBack,
    onNext: handleForward,
    onFirst: handleFirst,
    onLast: handleLast,
  });

  /** Defer variations so move stats stay instant; load in background when idle. */
  const [variationsEnabled, setVariationsEnabled] = useState(false);

  useEffect(() => {
    setVariationsEnabled(false);
    if (!positionReady || loading) return;

    let idleHandle: number | undefined;
    let deferTimer: ReturnType<typeof setTimeout> | undefined;

    const enableVariations = () => setVariationsEnabled(true);

    if (typeof window.requestIdleCallback === "function") {
      idleHandle = window.requestIdleCallback(enableVariations, {
        timeout: 2000,
      });
    } else {
      deferTimer = setTimeout(enableVariations, 1000);
    }

    return () => {
      if (idleHandle !== undefined) {
        window.cancelIdleCallback(idleHandle);
      }
      if (deferTimer !== undefined) {
        clearTimeout(deferTimer);
      }
    };
  }, [fen, positionReady, loading]);

  const { lines: variationLines, loading: variationLinesLoading } =
    useVariationLines({
      fen,
      fetchPositionVariations,
      enabled: variationsEnabled && positionReady,
    });

  const [internalBoardOrientation, setInternalBoardOrientation] = useState<
    "white" | "black"
  >(defaultBoardOrientation);
  const boardOrientation = boardOrientationProp ?? internalBoardOrientation;

  const handleFlipBoard = useCallback(() => {
    const nextOrientation =
      boardOrientation === "white" ? "black" : "white";
    if (boardOrientationProp === undefined) {
      setInternalBoardOrientation(nextOrientation);
    }
    onBoardOrientationChange?.(nextOrientation);
  }, [boardOrientation, boardOrientationProp, onBoardOrientationChange]);

  const boardNavProps = useMemo(
    () => ({
      canGoBack,
      canGoForward,
      onBack: handleBack,
      onForward: handleForward,
      boardOrientation,
      onFlipBoard: handleFlipBoard,
    }),
    [
      boardOrientation,
      canGoBack,
      canGoForward,
      handleBack,
      handleFlipBoard,
      handleForward,
    ],
  );

  const outerStyle: CSSProperties = {
    width: "100%",
    height: fillHeight ? "100%" : "auto",
    minHeight: layoutMinHeight ?? DEFAULT_REFERENCE_LAYOUT.minHeight,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const board = (
    <>
      <ChessboardDnDProvider>
        <HighlightChessboard
          key={boardOrientation}
          boardWidth={boardWidth}
          position={boardFen}
          boardOrientation={boardOrientation}
          checkSquare=""
          hintSquare={null}
          incorrectMoveSquare={null}
          onPieceDrop={handlePieceDrop}
          promotionDialogVariant="modal"
        />
      </ChessboardDnDProvider>
      {renderBoardNav(boardNavProps)}
    </>
  );

  const referencePanel = (
    <DefaultReferencePanel
      theme={theme}
      status={renderStatus({
        error,
        loading: showPositionLoading,
      })}
      moveStats={renderMoveStats({
        moves: displayMoves,
        onMoveSelect: handleMoveSelect,
      })}
      variationsStrip={renderVariationsStrip({
        theme,
        lines: variationLines,
        loading: !variationsEnabled || variationLinesLoading,
        selectedLineKey: selectedVariationKey,
        forwardSans,
        onLineSelect: handleLineSelect,
      })}
      gamesPanel={renderGamesPanel({
        games: Array.isArray(games?.games) ? games.games : [],
        loading: gamesLoading,
        lineLabel,
        lineSans,
        sources,
        onSourcesChange: setSources,
        onGameSelect,
      })}
    />
  );

  return (
    <ThemeProvider theme={theme} boardTheme={boardTheme}>
      <div style={outerStyle}>
        {renderLayout({ theme, board, referencePanel })}
      </div>
    </ThemeProvider>
  );
};
