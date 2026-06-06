export { EXPLORER_START_FEN } from './constants';
export {
  ExplorerPlaceholder,
  type ExplorerPlaceholderProps,
} from './ExplorerPlaceholder';
export {
  PositionReferenceExplorer,
  type PositionReferenceExplorerProps,
} from './PositionReferenceExplorer';
export {
  PositionReferenceExplorerCore,
} from './core/PositionReferenceExplorerCore';
export type {
  PositionReferenceExplorerCoreProps,
  ReferenceLayoutRenderProps,
  ExplorerStatusRenderProps,
  MoveStatsRenderProps,
  GamesPanelRenderProps,
  VariationsStripRenderProps,
  BoardNavRenderProps,
} from './core/renderProps';
export {
  DEFAULT_REFERENCE_LAYOUT,
  DefaultReferenceLayout,
  DefaultReferencePanel,
  DefaultVariationsStrip,
  defaultRenderLayout,
  defaultRenderStatus,
  defaultRenderMoveStats,
  defaultRenderGamesPanel,
  defaultRenderVariationsStrip,
  defaultRenderBoardNav,
  DefaultBoardNav,
} from './defaults';
export type { ReferenceLayoutConfig } from './referenceLayout';
export {
  GameReplayTrainer,
  type GameReplayTrainerProps,
} from './GameReplayTrainer';
export { useGameReplayTraining } from './hooks/useGameReplayTraining';
export type {
  PositionApiDto,
  PositionGamesApiDto,
  PositionGameRowApiDto,
  PositionMoveApiDto,
  FetchPositionGamesParams,
  ExplorerGameReplayApiDto,
} from './types';
export { mockFetchPosition, mockFetchPositionGames } from './mocks';
export {
  fenAfterUci,
  normalizeFen,
  whiteScorePercent,
} from './positionUtils';
export { findPlyIndexForFen, fenAtPly } from './gameReplayUtils';
