/** Smallest playable board (still readable on narrow phones). */
export const MIN_BOARD_WIDTH = 240;

export const MOBILE_MAX_BOARD_WIDTH = 300;

export const TABLET_MAX_BOARD_WIDTH = 960;

export const PUZZLE_CONTROLS_BESIDE_RESERVE_PX = 176;

export const responsiveMaxBoardWidth = (
  designWidth: number,
  isMobile: boolean,
  options?: { mobileMaxBoardWidth?: number },
): number => {
  if (isMobile) {
    return Math.min(designWidth, options?.mobileMaxBoardWidth ?? MOBILE_MAX_BOARD_WIDTH);
  }
  return designWidth;
};
