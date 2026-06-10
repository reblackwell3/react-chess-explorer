import type { ReactNode } from "react";
import type {
  FetchPositionGamesParams,
  FetchPositionParams,
  FetchPositionVariationsParams,
  GameSource,
  PositionApiDto,
  PositionGameRowApiDto,
  PositionGamesApiDto,
  PositionMoveApiDto,
  PositionVariationLineApiDto,
  PositionVariationsApiDto,
} from "../types";
import type { VariationsTab } from "../variationLines";

export type ReferenceLayoutRenderProps = {
  theme: "light" | "dark";
  board: ReactNode;
  referencePanel: ReactNode;
};

export type BoardOrientation = "white" | "black";

export type BoardNavRenderProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  boardOrientation: BoardOrientation;
  onFlipBoard: () => void;
};

export type ExplorerStatusRenderProps = {
  error: string | null;
  loading: boolean;
};

export type MoveStatsRenderProps = {
  moves: PositionMoveApiDto[];
  selectedUci?: string;
  onMoveSelect: (move: PositionMoveApiDto) => void;
};

export type LineHeaderRenderProps = {
  label: string;
  gameCount: number;
};

export type GamesPanelRenderProps = {
  games: PositionGameRowApiDto[];
  lineLabel: string;
  loading?: boolean;
  minElo: number;
  maxElo: number;
  defaultMinElo: number;
  defaultMaxElo: number;
  topOnly: boolean;
  sources: GameSource[];
  onMinEloChange: (value: number) => void;
  onMaxEloChange: (value: number) => void;
  onTopOnlyChange: (value: boolean) => void;
  onSourcesChange: (sources: GameSource[]) => void;
  /** Start replay training for a database game from the current board FEN. */
  onGameSelect?: (game: PositionGameRowApiDto) => void;
};

export type VariationsStripRenderProps = {
  theme: "light" | "dark";
  tab: VariationsTab;
  onTabChange: (tab: VariationsTab) => void;
  lines: PositionVariationLineApiDto[];
  loading: boolean;
  selectedLineKey?: string;
  forwardSans: string[];
  onLineSelect: (line: PositionVariationLineApiDto) => void;
};

export type PositionReferenceExplorerCoreProps = {
  fen?: string;
  onFenChange?: (fen: string) => void;
  /** Seed move history on mount (e.g. from URL). Applied from {@link EXPLORER_START_FEN}. */
  initialLineSans?: string[];
  /** Fired after mount when the played SAN line changes (back/forward/new move). */
  onLineSansChange?: (lineSans: string[]) => void;
  fetchPosition: (params: FetchPositionParams) => Promise<PositionApiDto | null>;
  fetchPositionGames: (
    params: FetchPositionGamesParams,
  ) => Promise<PositionGamesApiDto>;
  fetchPositionVariations: (
    params: FetchPositionVariationsParams,
  ) => Promise<PositionVariationsApiDto | null>;
  theme?: "light" | "dark";
  boardWidth?: number;
  /** Controlled board orientation. When omitted, orientation is managed internally. */
  boardOrientation?: BoardOrientation;
  /** Initial orientation when uncontrolled. Defaults to white. */
  defaultBoardOrientation?: BoardOrientation;
  /** Fired when the user flips the board (controlled or uncontrolled). */
  onBoardOrientationChange?: (orientation: BoardOrientation) => void;
  defaultMinElo?: number;
  defaultMaxElo?: number;
  /** When true, shell uses full viewport height (no extra content below the grid). */
  fillHeight?: boolean;
  layoutMinHeight?: string;
  renderLayout?: (props: ReferenceLayoutRenderProps) => ReactNode;
  renderStatus?: (props: ExplorerStatusRenderProps) => ReactNode;
  renderMoveStats?: (props: MoveStatsRenderProps) => ReactNode;
  renderVariationsStrip?: (props: VariationsStripRenderProps) => ReactNode;
  renderGamesPanel?: (props: GamesPanelRenderProps) => ReactNode;
  renderBoardNav?: (props: BoardNavRenderProps) => ReactNode;
  /** When set, games panel can launch per-game replay training. */
  onGameSelect?: (game: PositionGameRowApiDto) => void;
  /**
   * Register ArrowLeft/ArrowRight/Home/End shortcuts while the explorer is mounted.
   * Default true.
   */
  keyboardNav?: boolean;
};
