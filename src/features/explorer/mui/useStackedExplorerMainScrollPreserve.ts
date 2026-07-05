import { useCallback, useLayoutEffect, useRef } from 'react';

const MAIN_SELECTOR = 'main';

/** Layout passes to keep restoring scroll after a stacked explorer navigation. */
const RESTORE_LAYOUT_PASSES = 4;

/**
 * Preserve `<main>` scroll on stacked explorer pages when move navigation
 * reflows the reference panel (mobile page scroll, not nested panel scroll).
 */
export function useStackedExplorerMainScrollPreserve(enabled: boolean) {
  const scrollTopRef = useRef(0);
  const restorePassesRemainingRef = useRef(0);

  const captureMainScroll = useCallback(() => {
    if (!enabled) {
      return;
    }
    const main = document.querySelector(MAIN_SELECTOR);
    if (!main) {
      return;
    }
    scrollTopRef.current = main.scrollTop;
    restorePassesRemainingRef.current = RESTORE_LAYOUT_PASSES;
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled || restorePassesRemainingRef.current <= 0) {
      return;
    }
    const main = document.querySelector(MAIN_SELECTOR);
    if (main) {
      main.scrollTop = scrollTopRef.current;
    }
    restorePassesRemainingRef.current -= 1;
  });

  return captureMainScroll;
}
