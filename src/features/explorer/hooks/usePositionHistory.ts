import { useCallback, useState } from "react";
import { applyLineSans } from "../positionUtils";

export type PositionHistoryEntry = {
  fen: string;
  /** SAN of the move played from the previous entry to reach this FEN. */
  lastSan?: string;
  /** UCI of the move played from the previous entry to reach this FEN. */
  lastUci?: string;
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
    (fen: string, lastSan?: string, lastUci?: string): PositionHistoryEntry => {
      setHistory((prev) => {
        const trimmed = prev.slice(0, historyIndex + 1);
        const next = [...trimmed, { fen, lastSan, lastUci }];
        setHistoryIndex(next.length - 1);
        return next;
      });
      return { fen, lastSan, lastUci };
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

  const goFirst = useCallback((): PositionHistoryEntry | null => {
    if (historyIndex <= 0) return null;
    const entry = history[0];
    setHistoryIndex(0);
    return entry;
  }, [history, historyIndex]);

  const goLast = useCallback((): PositionHistoryEntry | null => {
    if (historyIndex >= history.length - 1) return null;
    const entry = history[history.length - 1];
    setHistoryIndex(history.length - 1);
    return entry;
  }, [history, historyIndex]);

  const resetHistory = useCallback((fen: string): PositionHistoryEntry => {
    const entry = { fen };
    setHistory([entry]);
    setHistoryIndex(0);
    return entry;
  }, []);

  const pushEntries = useCallback(
    (entries: { fen: string; lastSan: string; lastUci?: string }[]) => {
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

  const currentFen = history[historyIndex]?.fen ?? initialFen;

  const replaceLineEntries = useCallback(
    (startFen: string, entries: { fen: string; lastSan: string; lastUci?: string }[]) => {
      setHistory([{ fen: startFen }, ...entries]);
      setHistoryIndex(entries.length);
    },
    [],
  );

  const lastMoveUci =
    historyIndex > 0 ? history[historyIndex]?.lastUci ?? null : null;

  return {
    canGoBack,
    canGoForward,
    lineSans,
    forwardSans,
    currentFen,
    lastMoveUci,
    pushEntry,
    pushEntries,
    replaceLineEntries,
    goBack,
    goForward,
    goFirst,
    goLast,
    resetHistory,
  };
}
