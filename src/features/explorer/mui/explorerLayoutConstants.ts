const APP_BAR_OFFSET = 64;

export const explorerLayoutMinHeight = `calc(100vh - ${APP_BAR_OFFSET}px)`;

/** Stacked layouts cap board width; side-by-side desktop fills half the viewport column. */
export const EXPLORER_BOARD_WIDTH = 560;

/** Side-by-side desktop: board and reference each take half the width. */
export const EXPLORER_GRID_COLUMNS = {
  xs: '1fr',
  lg: 'minmax(0, 1fr) minmax(0, 1fr)',
} as const;

/** Max share of the grid height the board may use when stacked (board above reference). */
export const STACKED_BOARD_MAX_HEIGHT_FRACTION = 0.48;
