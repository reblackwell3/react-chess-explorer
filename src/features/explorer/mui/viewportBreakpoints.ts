export const VIEWPORT = {
  mobileMax: 767,
  tabletPortraitMin: 768,
  tabletPortraitMax: 1023,
  tabletLandscapeMin: 1024,
  tabletLandscapeMax: 1365,
  desktopMin: 1366,
  wideDesktopMin: 1920,
  ultraWideMin: 2560,
} as const;

export type ViewportBand =
  | 'mobile'
  | 'tabletPortrait'
  | 'tabletLandscape'
  | 'desktop';

export const viewportBandForWidth = (widthPx: number): ViewportBand => {
  if (widthPx <= VIEWPORT.mobileMax) {
    return 'mobile';
  }
  if (widthPx <= VIEWPORT.tabletPortraitMax) {
    return 'tabletPortrait';
  }
  if (widthPx <= VIEWPORT.tabletLandscapeMax) {
    return 'tabletLandscape';
  }
  return 'desktop';
};
