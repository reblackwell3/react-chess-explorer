import { useCallback, useLayoutEffect, useRef } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import type { ReferenceLayoutRenderProps } from '../core/renderProps';
import { responsiveMaxBoardWidth } from './boardLayoutConstants';
import { panelBorderSx } from './explorerMuiStyles';
import {
  EXPLORER_BOARD_WIDTH,
  EXPLORER_GRID_COLUMNS,
  explorerLayoutMinHeight,
} from './explorerLayoutConstants';
import {
  fitExplorerBoardWidth,
  fitStackedExplorerBoardWidth,
  fitTabletStackedExplorerBoardWidth,
  stackedExplorerSlotHeightCap,
} from './fitExplorerBoardWidth';
import { useStackedExplorerMainScrollPreserve } from './useStackedExplorerMainScrollPreserve';

const VIEWPORT_RESIZE_DEBOUNCE_MS = 100;
const BOARD_WIDTH_CHANGE_THRESHOLD_PX = 1;

type ExplorerLayoutProps = ReferenceLayoutRenderProps & {
  onBoardWidthChange: (width: number) => void;
};

export const ExplorerLayout = ({
  board,
  referencePanel,
  onBoardWidthChange,
}: ExplorerLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isStacked = useMediaQuery(theme.breakpoints.down('lg'));
  const isTabletStacked = isStacked && !isMobile;
  const maxBoardWidth = responsiveMaxBoardWidth(
    EXPLORER_BOARD_WIDTH,
    isMobile,
    isMobile ? { mobileMaxBoardWidth: EXPLORER_BOARD_WIDTH } : undefined,
  );
  const gridRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const boardStackRef = useRef<HTMLDivElement>(null);
  const lastBoardWidthRef = useRef<number | null>(null);
  const viewportResizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const captureMainScroll = useStackedExplorerMainScrollPreserve(isStacked);

  const publishBoardWidth = useCallback(
    (width: number) => {
      const rounded = Math.round(width);
      if (
        lastBoardWidthRef.current !== null &&
        Math.abs(lastBoardWidthRef.current - rounded) <=
          BOARD_WIDTH_CHANGE_THRESHOLD_PX
      ) {
        return;
      }
      lastBoardWidthRef.current = rounded;
      onBoardWidthChange(rounded);
    },
    [onBoardWidthChange],
  );

  const updateBoardWidth = useCallback(() => {
    const slot = slotRef.current;
    if (!slot) {
      return;
    }

    const slotRect = slot.getBoundingClientRect();
    const viewportHeight =
      typeof window !== 'undefined'
        ? (window.visualViewport?.height ?? window.innerHeight)
        : slotRect.height;
    const stack = boardStackRef.current;
    const navEl =
      stack && stack.children.length > 1
        ? (stack.children[stack.children.length - 1] as HTMLElement)
        : null;
    const navHeight = navEl?.getBoundingClientRect().height ?? 0;

    if (isMobile) {
      publishBoardWidth(
        fitStackedExplorerBoardWidth(slotRect.width, navHeight, maxBoardWidth),
      );
      return;
    }

    if (isTabletStacked) {
      publishBoardWidth(
        fitTabletStackedExplorerBoardWidth(slotRect.width, navHeight),
      );
      return;
    }

    const slotHeightForFit = isStacked
      ? stackedExplorerSlotHeightCap(viewportHeight)
      : slotRect.height;

    publishBoardWidth(
      fitExplorerBoardWidth(
        slotRect.width,
        slotHeightForFit,
        navHeight,
        isStacked ? maxBoardWidth : slotRect.width,
      ),
    );
  }, [
    isMobile,
    isStacked,
    isTabletStacked,
    maxBoardWidth,
    publishBoardWidth,
  ]);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    if (!slot) {
      return;
    }

    updateBoardWidth();

    const observer = new ResizeObserver(updateBoardWidth);
    observer.observe(slot);
    if (gridRef.current) {
      observer.observe(gridRef.current);
    }
    if (boardStackRef.current) {
      observer.observe(boardStackRef.current);
    }

    const onViewportChange = () => {
      if (viewportResizeTimerRef.current) {
        clearTimeout(viewportResizeTimerRef.current);
      }
      viewportResizeTimerRef.current = setTimeout(() => {
        viewportResizeTimerRef.current = null;
        updateBoardWidth();
      }, VIEWPORT_RESIZE_DEBOUNCE_MS);
    };
    window.addEventListener('resize', onViewportChange);
    if (!isMobile) {
      window.visualViewport?.addEventListener('resize', onViewportChange);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onViewportChange);
      if (!isMobile) {
        window.visualViewport?.removeEventListener('resize', onViewportChange);
      }
      if (viewportResizeTimerRef.current) {
        clearTimeout(viewportResizeTimerRef.current);
      }
    };
  }, [isMobile, updateBoardWidth]);

  return (
    <Box
      ref={gridRef}
      onPointerDownCapture={isStacked ? captureMainScroll : undefined}
      sx={{
        display: 'grid',
        gridTemplateColumns: EXPLORER_GRID_COLUMNS,
        gridTemplateRows: isStacked ? 'auto auto' : '1fr',
        width: '100%',
        height: isStacked ? 'auto' : '100%',
        minHeight: isStacked ? explorerLayoutMinHeight : 0,
        overflow: isStacked ? 'visible' : 'hidden',
        boxSizing: 'border-box',
        bgcolor: 'background.default',
      }}
    >
      <Box
        ref={slotRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          py: 0.5,
          px: isMobile ? 0 : 0.5,
          overflow: 'hidden',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        <Box
          ref={boardStackRef}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 'fit-content',
            maxWidth: '100%',
            mx: 'auto',
            ...(isMobile && isStacked ? { touchAction: 'none' } : {}),
          }}
        >
          {board}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: isStacked ? 'auto' : '100%',
          minHeight: isStacked ? 'auto' : 0,
          overflow: isStacked ? 'visible' : 'hidden',
          borderLeft: { xs: 0, lg: 1 },
          borderTop: { xs: 1, lg: 0 },
          ...panelBorderSx,
        }}
      >
        {referencePanel}
      </Box>
    </Box>
  );
};
