import {
  EXPLORER_BOARD_WIDTH,
  STACKED_BOARD_MAX_HEIGHT_FRACTION,
} from './explorerLayoutConstants';
import {
  MIN_BOARD_WIDTH,
  PUZZLE_CONTROLS_BESIDE_RESERVE_PX,
  TABLET_MAX_BOARD_WIDTH,
} from './boardLayoutConstants';

const DEFAULT_NAV_RESERVE_PX = 44;

export const stackedExplorerSlotHeightCap = (
  gridHeight: number,
  fraction = STACKED_BOARD_MAX_HEIGHT_FRACTION,
): number => Math.floor(gridHeight * fraction);

export const fitExplorerBoardWidth = (
  slotWidth: number,
  slotHeight: number,
  navHeight = DEFAULT_NAV_RESERVE_PX,
  maxBoardWidth = EXPLORER_BOARD_WIDTH,
): number => {
  const maxByWidth = slotWidth;
  const maxByHeight = slotHeight - navHeight;
  const fitted = Math.min(maxBoardWidth, maxByWidth, maxByHeight);
  return Math.max(MIN_BOARD_WIDTH, Math.floor(fitted));
};

/** Size from slot width when stacked; height budget matches width so a viewport cap does not shrink the board. */
export const fitStackedExplorerBoardWidth = (
  slotWidth: number,
  navHeight = DEFAULT_NAV_RESERVE_PX,
  maxBoardWidth = EXPLORER_BOARD_WIDTH,
): number =>
  fitExplorerBoardWidth(
    slotWidth,
    slotWidth + navHeight,
    navHeight,
    maxBoardWidth,
  );

/** Full-width square board on phones; height budget matches width so the 48% cap does not shrink it. */
export const fitMobileExplorerBoardWidth = (
  slotWidth: number,
  navHeight = DEFAULT_NAV_RESERVE_PX,
  maxBoardWidth = EXPLORER_BOARD_WIDTH,
): number => fitStackedExplorerBoardWidth(slotWidth, navHeight, maxBoardWidth);

/** Stacked tablet explorer — same effective board width as review at the same viewport. */
export const fitTabletStackedExplorerBoardWidth = (
  slotWidth: number,
  navHeight = DEFAULT_NAV_RESERVE_PX,
  maxBoardWidth = TABLET_MAX_BOARD_WIDTH,
): number =>
  fitStackedExplorerBoardWidth(
    Math.max(0, slotWidth - PUZZLE_CONTROLS_BESIDE_RESERVE_PX),
    navHeight,
    maxBoardWidth,
  );
