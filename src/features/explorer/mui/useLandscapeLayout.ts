import { useMediaQuery } from '@mui/material';

export const LANDSCAPE_ORIENTATION_QUERY = '(orientation: landscape)';

/** Landscape → side-by-side explorer; portrait → stacked board above reference. */
export const useLandscapeLayout = (): boolean =>
  useMediaQuery(LANDSCAPE_ORIENTATION_QUERY);
