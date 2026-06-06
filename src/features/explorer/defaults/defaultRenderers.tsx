import { defaultRenderBoardNav } from '../components/DefaultBoardNav';
import { ExplorerStatusBanner } from '../components/ExplorerStatusBanner';
import { MoveStatsTable } from '../components/MoveStatsTable';
import { PositionGamesPanel } from '../components/PositionGamesPanel';
import type {
  ExplorerStatusRenderProps,
  GamesPanelRenderProps,
  MoveStatsRenderProps,
} from '../core/renderProps';
import { defaultRenderLayout } from './DefaultReferenceLayout';
import { defaultRenderVariationsStrip } from './DefaultVariationsStrip';

export {
  defaultRenderLayout,
  defaultRenderVariationsStrip,
  defaultRenderBoardNav,
};

export const defaultRenderStatus = (props: ExplorerStatusRenderProps) => (
  <ExplorerStatusBanner {...props} />
);

export const defaultRenderMoveStats = (props: MoveStatsRenderProps) => (
  <MoveStatsTable {...props} />
);

export const defaultRenderGamesPanel = (props: GamesPanelRenderProps) => (
  <PositionGamesPanel {...props} />
);
