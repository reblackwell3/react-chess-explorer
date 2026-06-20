import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { EXPLORER_START_FEN } from "../constants";
import { normalizeFen } from "../positionUtils";
import { usePositionReferenceData } from "../hooks/usePositionReferenceData";
import { useVariationLines } from "../hooks/useVariationLines";
import {
  EXPLORER_DEFAULT_VARIATION_DEPTH,
  EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
  peekSessionVariations,
  variationsSessionKey,
} from "../explorerSessionCache";
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
    fetchPositionVariations,
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
    lastMoveUci,
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

  const [variationsEnabled, setVariationsEnabled] = useState(
    () => normalizeFen(fen) === normalizeFen(EXPLORER_START_FEN),
  );
  const isStartPosition =
    normalizeFen(fen) === normalizeFen(EXPLORER_START_FEN);

  useEffect(() => {
    const cachedVariations = peekSessionVariations(
      variationsSessionKey(
        fen,
        EXPLORER_DEFAULT_VARIATION_LINE_COUNT,
        EXPLORER_DEFAULT_VARIATION_DEPTH,
      ),
    );
    if (cachedVariations) {
      setVariationsEnabled(true);
      return;
    }

    if (!positionReady && !isStartPosition) {
      setVariationsEnabled(false);
      return;
    }

    if (loading && !isStartPosition) {
      setVariationsEnabled(false);
      return;
    }

    setVariationsEnabled(true);
  }, [fen, positionReady, loading, isStartPosition]);

  const { lines: variationLines, loading: variationLinesLoading } =
    useVariationLines({
      fen,
      fetchPositionVariations,
      enabled:
        variationsEnabled && (positionReady || isStartPosition),
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
    overflow: fillHeight ? "hidden" : "visible",
    boxSizing: "border-box",
  };

  const board = (
    <>
      <HighlightChessboard
        key={boardOrientation}
        boardWidth={boardWidth}
        position={boardFen}
        boardOrientation={boardOrientation}
        checkSquare=""
        hintSquare={null}
        incorrectMoveSquare={null}
        lastMoveUci={lastMoveUci}
        onPieceDrop={handlePieceDrop}
        promotionDialogVariant="modal"
      />
      {renderBoardNav(boardNavProps)}
    </>
  );

  const referencePanel = (
    <DefaultReferencePanel
      theme={theme}
      fillHeight={fillHeight}
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
