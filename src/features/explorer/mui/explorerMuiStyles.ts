import type { SxProps, Theme } from '@mui/material/styles';
import { EXPLORER_PANEL_ROW_LIMITS } from './explorerPanelRowLimits';

/** Section chrome — readable at laptop width, not only on 1920px+ displays. */
export const sectionHeaderSx: SxProps<Theme> = {
  px: { xs: 1.25, xxl: 1.5, xxxl: 1.75 },
  py: { xs: 0.75, sm: 0.85, xxl: 1.1, xxxl: 1.25 },
  fontSize: { xs: 13, sm: 14, md: 15, lg: 16, xxl: 17, xxxl: 20 },
  fontWeight: 600,
  borderBottom: 1,
  borderColor: 'divider',
  bgcolor: 'action.hover',
};

export const panelBorderSx: SxProps<Theme> = {
  borderColor: 'divider',
};

/** Body text in move stats, variation lines, and other explorer panels. */
export const explorerPanelTextSx: SxProps<Theme> = {
  fontSize: { xs: 13, sm: 14, md: 15, lg: 16, xxl: 17, xxxl: 20 },
};

export const compactTableSx: SxProps<Theme> = {
  '& .MuiTableCell-root': {
    fontSize: { xs: 13, sm: 14, md: 15, lg: 16, xxl: 17, xxxl: 20 },
    py: { xs: 0.45, sm: 0.55, md: 0.7, lg: 0.8, xxl: 0.9, xxxl: 1.05 },
    px: { xs: 1, xxl: 1.5, xxxl: 1.75 },
    borderBottom: '1px solid',
    borderColor: 'divider',
    whiteSpace: 'nowrap',
  },
  '& .MuiTableCell-head': {
    fontWeight: 600,
    bgcolor: 'action.hover',
    py: { xs: undefined, xxl: 0.85, xxxl: 1 },
  },
};

export const explorerVariationsStripSx: SxProps<Theme> = {
  flex: '0 0 auto',
  display: 'flex',
  flexDirection: 'column',
  borderBottom: 1,
  ...panelBorderSx,
  ...explorerPanelTextSx,
};

export const explorerVariationsStripBodySx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: { xs: 0.75, xxl: 1 },
  px: { xs: 1.25, xxl: 1.5, xxxl: 1.75 },
  py: { xs: 0.75, xxl: 1, xxxl: 1.1 },
};

export const explorerVariationLineSx: SxProps<Theme> = {
  display: 'flex',
  width: '100%',
  alignItems: 'baseline',
  justifyContent: 'flex-start',
  gap: { xs: 1.5, xxl: 2 },
  ...explorerPanelTextSx,
};

export const explorerVariationLabelSx = (active: boolean): SxProps<Theme> => ({
  flex: 1,
  minWidth: 0,
  fontWeight: active ? 600 : 400,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  ...explorerPanelTextSx,
});

export const explorerVariationMetaSx: SxProps<Theme> = {
  flexShrink: 0,
  ...explorerPanelTextSx,
};

/** Second row on tabbed / stacked explorer layouts — stats wrap instead of clipping. */
export const explorerVariationMetaRowSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: { xs: 1, sm: 1.25 },
  color: 'text.secondary',
  ...explorerPanelTextSx,
};

/** Column labels aligned with {@link explorerVariationLineSx} data rows. */
export const explorerVariationColumnHeaderSx: SxProps<Theme> = {
  ...explorerVariationLineSx,
  flex: '0 0 auto',
  fontWeight: 600,
  color: 'text.secondary',
  bgcolor: 'action.hover',
  borderBottom: 1,
  borderColor: 'divider',
  py: { xs: 0.35, xxl: 0.5, xxxl: 0.6 },
};

export const explorerVariationColumnHeaderStackedSx: SxProps<Theme> = {
  ...explorerVariationMetaRowSx,
  flex: '0 0 auto',
  fontWeight: 600,
  bgcolor: 'action.hover',
  borderBottom: 1,
  borderColor: 'divider',
  py: { xs: 0.35, xxl: 0.5, xxxl: 0.6 },
};

export const explorerVariationLineWrappedSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 0.25,
  width: '100%',
  ...explorerPanelTextSx,
};

export const moveRowSx = (selected: boolean): SxProps<Theme> => ({
  cursor: 'pointer',
  '&:hover': { bgcolor: 'action.hover' },
  ...(selected ? { bgcolor: 'action.selected' } : {}),
});

/** Visible move rows before scrolling inside the panel. */
export const MOVE_STATS_VISIBLE_ROWS = 5;
export const MOVE_STATS_VISIBLE_ROWS_MOBILE = 4;
export const MOVE_STATS_VISIBLE_ROWS_TABLET = 5;
export const MOVE_STATS_VISIBLE_ROWS_ULTRA =
  EXPLORER_PANEL_ROW_LIMITS.ultraWide.moves;

/** Approximate row + sticky header height for {@link compactTableSx}. */
const MOVE_STATS_ROW_PX = 32;
const MOVE_STATS_ROW_PX_TABLET = 34;
const MOVE_STATS_ROW_PX_ULTRA = 42;
const MOVE_STATS_TABLE_HEADER_PX = 34;
const MOVE_STATS_TABLE_HEADER_PX_TABLET = 36;
const MOVE_STATS_TABLE_HEADER_PX_ULTRA = 44;

export type ExplorerTableScrollDensity = 'default' | 'tablet' | 'ultra';

export const moveStatsTableMaxHeight = (
  visibleRows: number,
  density: ExplorerTableScrollDensity = 'default',
): string => {
  const rowPx =
    density === 'tablet'
      ? MOVE_STATS_ROW_PX_TABLET
      : density === 'ultra'
        ? MOVE_STATS_ROW_PX_ULTRA
        : MOVE_STATS_ROW_PX;
  const headerPx =
    density === 'tablet'
      ? MOVE_STATS_TABLE_HEADER_PX_TABLET
      : density === 'ultra'
        ? MOVE_STATS_TABLE_HEADER_PX_ULTRA
        : MOVE_STATS_TABLE_HEADER_PX;
  return `${visibleRows * rowPx + headerPx}px`;
};

/** Visible variation lines before scrolling inside the strip. */
export const VARIATION_LINES_VISIBLE_ROWS = 5;
export const VARIATION_LINES_VISIBLE_ROWS_TABLET = 4;
export const VARIATION_LINES_VISIBLE_ROWS_MOBILE = 3;
export const VARIATION_LINES_VISIBLE_ROWS_ULTRA =
  EXPLORER_PANEL_ROW_LIMITS.ultraWide.variations;

const VARIATION_LINE_ROW_PX = 28;
const VARIATION_LINE_ROW_PX_ULTRA = 38;

export const variationLinesMaxHeight = (
  visibleRows: number,
  density: ExplorerTableScrollDensity = 'default',
): string => {
  const rowPx =
    density === 'ultra' ? VARIATION_LINE_ROW_PX_ULTRA : VARIATION_LINE_ROW_PX;
  return `${visibleRows * rowPx}px`;
};

export const explorerMoveStatsScrollSx: SxProps<Theme> = {
  maxHeight: {
    xs: moveStatsTableMaxHeight(MOVE_STATS_VISIBLE_ROWS_MOBILE),
    sm: moveStatsTableMaxHeight(MOVE_STATS_VISIBLE_ROWS_TABLET, 'tablet'),
    lg: moveStatsTableMaxHeight(MOVE_STATS_VISIBLE_ROWS),
    xxxl: moveStatsTableMaxHeight(MOVE_STATS_VISIBLE_ROWS_ULTRA, 'ultra'),
  },
  overflow: 'auto',
};

export const explorerVariationsScrollSx: SxProps<Theme> = {
  maxHeight: {
    xs: variationLinesMaxHeight(VARIATION_LINES_VISIBLE_ROWS_MOBILE),
    sm: variationLinesMaxHeight(VARIATION_LINES_VISIBLE_ROWS_TABLET),
    lg: variationLinesMaxHeight(VARIATION_LINES_VISIBLE_ROWS),
    xxxl: variationLinesMaxHeight(
      VARIATION_LINES_VISIBLE_ROWS_ULTRA,
      'ultra',
    ),
  },
  overflow: 'auto',
};

/** Tabbed reference panel (mobile / tablet): grow with content, no nested scroll clip. */
export const stackedExplorerMoveStatsScrollSx: SxProps<Theme> = {
  overflow: 'visible',
};

/** Tabbed reference panel (mobile / tablet): grow with content, no nested scroll clip. */
export const stackedExplorerVariationsScrollSx: SxProps<Theme> = {
  overflow: 'visible',
};

/** Tabbed / stacked explorer: lines grow with the page instead of a nested scroll box. */
export const explorerVariationsStackedScrollSx: SxProps<Theme> = {
  overflow: 'visible',
};

export const explorerVariationWrappedRowSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  width: '100%',
  gap: 0.25,
};

export const explorerVariationWrappedMetaSx: SxProps<Theme> = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: { xs: 1, sm: 1.25 },
  color: 'text.secondary',
  ...explorerPanelTextSx,
};
