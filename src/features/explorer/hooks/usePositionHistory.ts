import { useCallback, useState } from "react";
import { applyLineSans } from "../positionUtils";

export type PositionHistoryEntry = {
  fen: string;
  /** SAN of the move played from the previous entry to reach this FEN. */
  lastSan?: string;
};

export function initialHistoryState(
  initialFen: string,
  initialLineSans?: string[],
): { history: PositionHistoryEntry[]; historyIndex: number } {
  if (!initialLineSans?.length) {
    return { history: [{ fen: initialFen }], historyIndex: 0 };
  }

  const result = applyLineSans(initialFen, initialLineSans);
  if (!result) {
    return { history: [{ fen: initialFen }], historyIndex: 0 };
  }

  return {
    history: [{ fen: initialFen }, ...result.entries],
    historyIndex: result.entries.length,
  };
}

export function usePositionHistory(
  initialFen: string,
  initialLineSans?: string[],
) {
  const [history, setHistory] = useState<PositionHistoryEntry[]>(
    () => initialHistoryState(initialFen, initialLineSans).history,
  );
  const [historyIndex, setHistoryIndex] = useState(
    () => initialHistoryState(initialFen, initialLineSans).historyIndex,
  );

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < history.length - 1;

  const pushEntry = useCallback(
    (fen: string, lastSan?: string): PositionHistoryEntry => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const next = [...trimmed, { fen, lastSan }];
        setHistoryIndex(next.length - 1);
        return next;
      });
      return { fen, lastSan };
    },
    [historyIndex],
  );

  const goBack = useCallback((): PositionHistoryEntry | null => {
    if (historyIndex <= 0) return null;
    const nextIndex = historyIndex - 1;
    const entry = history[nextIndex];
    setHistoryIndex(nextIndex);
    return entry;
  }, [history, historyIndex]);

  const goForward = useCallback((): PositionHistoryEntry | null => {
    if (historyIndex >= history.length - 1) return null;
    const nextIndex = historyIndex + 1;
    const entry = history[nextIndex];
    setHistoryIndex(nextIndex);
    return entry;
  }, [history, historyIndex]);

  const resetHistory = useCallback((fen: string): PositionHistoryEntry => {
    const entry = { fen };
    setHistory([entry]);
    setHistoryIndex(0);
    return entry;
  }, []);

  const pushEntries = useCallback(
    (entries: { fen: string; lastSan: string }[]) => {
      if (entries.length === 0) return;
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const next = [...trimmed, ...entries];
        setHistoryIndex(next.length - 1);
        return next;
      });
    },
    [historyIndex],
  );

  const lineSans = history
    .slice(1, historyIndex + 1)
    .map((entry) => entry.lastSan)
    .filter((san): san is string => Boolean(san));

  const forwardSans = history
    .slice(historyIndex + 1)
    .map((entry) => entry.lastSan)
    .filter((san): san is string => Boolean(san));

  return {
    canGoBack,
    canGoForward,
    lineSans,
    forwardSans,
    pushEntry,
    pushEntries,
    goBack,
    goForward,
    resetHistory,
  };
}
