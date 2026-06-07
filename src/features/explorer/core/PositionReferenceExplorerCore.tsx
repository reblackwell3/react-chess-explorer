import type { CSSProperties } from 'react';
import { ChessboardDnDProvider } from 'react-chessboard';
import { HighlightChessboard, ThemeProvider } from 'react-chess-core';
import { DefaultReferencePanel } from '../defaults/DefaultReferencePanel';
import {
  defaultRenderBoardNav,
  defaultRenderGamesPanel,
  defaultRenderLayout,
  defaultRenderMoveStats,
  defaultRenderStatus,
  defaultRenderVariationsStrip,
} from '../defaults/defaultRenderers';
import { DEFAULT_REFERENCE_LAYOUT } from '../referenceLayout';
import { usePositionReferenceData } from '../hooks/usePositionReferenceData';
import { useVariationLines } from '../hooks/useVariationLines';
import type { PositionReferenceExplorerCoreProps } from './renderProps';
export const PositionReferenceExplorerCore = ({
  fen: fenProp,
  onFenChange,
  fetchPosition,
  fetchPositionGames,
  fetchPositionVariations,
  theme = 'dark',
  boardWidth = DEFAULT_REFERENCE_LAYOUT.boardWidth,
  defaultMinElo = 2200,
  defaultMaxElo = 2800,
  fillHeight = true,
  layoutMinHeight,
  renderLayout = defaultRenderLayout,
  renderStatus = defaultRenderStatus,
  renderMoveStats = defaultRenderMoveStats,
  renderVariationsStrip = defaultRenderVariationsStrip,
  renderGamesPanel = defaultRenderGamesPanel,
  renderBoardNav = defaultRenderBoardNav,
  onGameSelect,
}: PositionReferenceExplorerCoreProps) => {
  const {
    fen,
    position,
    games,
    minElo,
    maxElo,
    topOnly,
    loading,
    error,
    lineLabel,
    canGoBack,
    canGoForward,
    variationsTab,
    forwardSans,
    selectedVariationKey,
    setMinElo,
    setMaxElo,
    setTopOnly,
    setVariationsTab,
    handleMoveSelect,
    handleLineSelect,
    handlePieceDrop,
    handleBack,
    handleForward,
  } = usePositionReferenceData({
    fenProp,
    onFenChange,
    fetchPosition,
    fetchPositionGames,
    defaultMinElo,
    defaultMaxElo,
  });

  const { lines: variationLines, loading: variationLinesLoading } =
    useVariationLines({
      fen,
      tab: variationsTab,
      minElo,
      maxElo,
      fetchPositionVariations,
      enabled: Boolean(position),
    });

  const outerStyle: CSSProperties = {
    width: '100%',
    height: fillHeight ? '100%' : 'auto',
    minHeight: layoutMinHeight ?? DEFAULT_REFERENCE_LAYOUT.minHeight,
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const board = (
    <>
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
      {renderBoardNav({
        canGoBack,
        canGoForward,
        onBack: handleBack,
        onForward: handleForward,
      })}
    </>
  );

  const referencePanel = (
    <DefaultReferencePanel
      theme={theme}
      status={renderStatus({ error, loading })}
      moveStats={renderMoveStats({
        moves: position?.moves ?? [],
        onMoveSelect: handleMoveSelect,
      })}
      variationsStrip={renderVariationsStrip({
        theme,
        tab: variationsTab,
        onTabChange: setVariationsTab,
        lines: variationLines,
        loading: variationLinesLoading,
        selectedLineKey: selectedVariationKey,
        forwardSans,
        onLineSelect: handleLineSelect,
      })}
      gamesPanel={renderGamesPanel({
        games: games?.games ?? [],
        lineLabel,
        minElo,
        maxElo,
        defaultMinElo,
        defaultMaxElo,
        topOnly,
        onMinEloChange: setMinElo,
        onMaxEloChange: setMaxElo,
        onTopOnlyChange: setTopOnly,
        onGameSelect,
      })}
    />
  );

  return (
    <ThemeProvider theme={theme}>
      <div style={outerStyle}>
        {renderLayout({ theme, board, referencePanel })}
      </div>
    </ThemeProvider>
  );
};
