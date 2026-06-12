/** Standard start position — placeholder until game replay is implemented. */
export const EXPLORER_START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** Default Elo band sent to explorer APIs (no user-facing filter). */
export const EXPLORER_DEFAULT_MIN_ELO = 2500;
export const EXPLORER_DEFAULT_MAX_ELO = 10_000;

/** Delay between plies when animating a clicked variation line. */
export const VARIATION_LINE_STEP_MS = 500;
