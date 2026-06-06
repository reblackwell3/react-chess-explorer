import type { ReactNode } from 'react';
import type {
  FetchPositionGamesParams,
  PositionApiDto,
  PositionGameRowApiDto,
  PositionGamesApiDto,
  PositionMoveApiDto,
} from '../types';

export type ReferenceLayoutRenderProps = {
  theme: 'light' | 'dark';
  board: ReactNode;
  referencePanel: ReactNode;
};

export type BoardNavRenderProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
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
  minElo: number;
  maxElo: number;
  defaultMinElo: number;
  defaultMaxElo: number;
  topOnly: boolean;
  onMinEloChange: (value: number) => void;
  onMaxEloChange: (value: number) => void;
  onTopOnlyChange: (value: boolean) => void;
  /** Start replay training for a database game from the current board FEN. */
  onGameSelect?: (game: PositionGameRowApiDto) => void;
};

export type VariationsStripRenderProps = {
  theme: 'light' | 'dark';
};

export type PositionReferenceExplorerCoreProps = {
  fen?: string;
  onFenChange?: (fen: string) => void;
  fetchPosition: (fen: string) => Promise<PositionApiDto | null>;
  fetchPositionGames: (
    params: FetchPositionGamesParams,
  ) => Promise<PositionGamesApiDto>;
  theme?: 'light' | 'dark';
  boardWidth?: number;
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
};
