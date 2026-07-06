import { useCallback, useLayoutEffect } from 'react';
import {
  captureStackedExplorerBoardScroll,
  restoreStackedExplorerBoardScrollIfPending,
} from './stackedExplorerScrollAnchor';

/** Preserve `<main>` scroll relative to the board slot on stacked explorer pages. */
export function useStackedExplorerMainScrollPreserve(enabled: boolean) {
  const captureMainScroll = useCallback(() => {
    if (!enabled) {
      return;
    }
    captureStackedExplorerBoardScroll();
  }, [enabled]);

  useLayoutEffect(() => {
    restoreStackedExplorerBoardScrollIfPending(enabled);
  });

  return captureMainScroll;
}
