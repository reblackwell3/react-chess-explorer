export const EXPLORER_BOARD_SLOT_ATTR = 'data-explorer-board-slot';

const MAIN_SELECTOR = 'main';

/** Layout passes to keep restoring scroll after a stacked explorer navigation. */
export const STACKED_EXPLORER_SCROLL_RESTORE_PASSES = 8;

const readBoardAnchorScrollTop = (
  main: Element,
  boardAnchor: HTMLElement,
): number => {
  const mainRect = main.getBoundingClientRect();
  const anchorRect = boardAnchor.getBoundingClientRect();
  return main.scrollTop + (anchorRect.top - mainRect.top);
};

const restoreBoardAnchorScrollTop = (
  main: Element,
  boardAnchor: HTMLElement,
  anchorScrollTop: number,
): void => {
  const mainRect = main.getBoundingClientRect();
  const anchorRect = boardAnchor.getBoundingClientRect();
  main.scrollTop = anchorScrollTop - (anchorRect.top - mainRect.top);
};

let anchorScrollTop: number | null = null;
let restorePassesRemaining = 0;

export const captureStackedExplorerBoardScroll = (): void => {
  const main = document.querySelector(MAIN_SELECTOR);
  const boardAnchor = document.querySelector(
    `[${EXPLORER_BOARD_SLOT_ATTR}]`,
  );
  if (!main || !(boardAnchor instanceof HTMLElement)) {
    return;
  }
  anchorScrollTop = readBoardAnchorScrollTop(main, boardAnchor);
  restorePassesRemaining = STACKED_EXPLORER_SCROLL_RESTORE_PASSES;
};

export const restoreStackedExplorerBoardScrollIfPending = (
  enabled: boolean,
): void => {
  if (!enabled || restorePassesRemaining <= 0 || anchorScrollTop === null) {
    return;
  }
  const main = document.querySelector(MAIN_SELECTOR);
  const boardAnchor = document.querySelector(
    `[${EXPLORER_BOARD_SLOT_ATTR}]`,
  );
  if (!main || !(boardAnchor instanceof HTMLElement)) {
    return;
  }
  restoreBoardAnchorScrollTop(main, boardAnchor, anchorScrollTop);
  restorePassesRemaining -= 1;
};
