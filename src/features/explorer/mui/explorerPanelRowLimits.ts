import {
  VIEWPORT,
  viewportBandForWidth,
  type ViewportBand,
} from './viewportBreakpoints';

/** Explorer reference panel row caps per viewport band. */
export type ExplorerPanelRowLimits = {
  moves: number;
  variations: number;
  games: number;
};

/** Laptop / standard desktop (1366–1919px): compact moves + lines, games scroll below. */
const LAPTOP_LIMITS: ExplorerPanelRowLimits = {
  moves: 5,
  variations: 4,
  games: 50,
};

/** 1366–2559 CSS px (typical laptops incl. 13" at 1920 logical width). */
export const EXPLORER_PANEL_ROW_LIMITS: Record<
  ViewportBand | 'ultraWide',
  ExplorerPanelRowLimits
> = {
  mobile: { moves: 12, variations: 8, games: 30 },
  tabletPortrait: { moves: 10, variations: 6, games: 30 },
  tabletLandscape: LAPTOP_LIMITS,
  desktop: LAPTOP_LIMITS,
  ultraWide: { moves: 10, variations: 8, games: 50 },
};

export type ExplorerLayoutSize = keyof typeof EXPLORER_PANEL_ROW_LIMITS;

export const explorerLayoutSizeForWidth = (widthPx: number): ExplorerLayoutSize => {
  if (widthPx >= VIEWPORT.ultraWideMin) {
    return 'ultraWide';
  }
  return viewportBandForWidth(widthPx);
};

export const explorerPanelRowLimitsForSize = (
  size: ExplorerLayoutSize,
): ExplorerPanelRowLimits => EXPLORER_PANEL_ROW_LIMITS[size];
