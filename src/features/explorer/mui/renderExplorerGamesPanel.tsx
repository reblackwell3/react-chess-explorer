import { useMemo } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { GamesPanelRenderProps } from '../core/renderProps';
import type { PositionGameRowApiDto } from '../types';
import { fenLineFromOpeningSans } from 'react-chess-core';
import {
  formatExplorerCell,
  formatExplorerCount,
} from './explorerDisplay';
import {
  compactTableSx,
  explorerPanelTextSx,
  panelBorderSx,
  sectionHeaderSx,
} from './explorerMuiStyles';
import { useLandscapeLayout } from './useLandscapeLayout';

export type ExplorerGamesPanelHostProps = {
  /** Wrap each game row (e.g. hover preview). Defaults to identity. */
  renderGameRowWrapper?: (
    props: { gameId: string; startFen?: string; children: React.ReactNode },
  ) => React.ReactNode;
  renderViewedIcon?: (viewed: boolean) => React.ReactNode;
  renderOpeningLabel?: (
    game: PositionGameRowApiDto,
    sx?: SxProps<Theme>,
  ) => React.ReactNode;
  formatTimeControl?: (
    timeControl: unknown,
    timeClass: unknown,
  ) => string | null;
  formatDate?: (date: unknown) => string | null;
  formatGameSource?: (source: unknown) => string;
  renderSourceFilter?: (props: {
    sources: GamesPanelRenderProps['sources'];
    onSourcesChange: GamesPanelRenderProps['onSourcesChange'];
  }) => React.ReactNode;
  browseGamesHref?: string;
  LinkComponent?: React.ElementType;
  useViewedGameIds?: (games: PositionGameRowApiDto[]) => Set<string>;
  selectableRowSx?: SxProps<Theme>;
  seenColumnCellSx?: SxProps<Theme>;
  wrappedGameTableSx?: SxProps<Theme>;
  wrappedGameRowLine1Sx?: SxProps<Theme>;
  wrappedGameRowLine2Sx?: SxProps<Theme>;
};

export type ExplorerGamesPanelRenderProps = GamesPanelRenderProps &
  ExplorerGamesPanelHostProps & {
    showBrowseLink?: boolean;
    wrappedRows?: boolean;
    /** Explorer board FEN; derived from `lineSans` when omitted. */
    positionFen?: string;
  };

const EXPLORER_GAMES_COLUMN_COUNT = 10;

const defaultOpeningLabel = (
  game: PositionGameRowApiDto,
): React.ReactNode => formatExplorerCell(game.event);

const ExplorerGameRow = ({
  game,
  startFen,
  onGameSelect,
  wrappedRows,
  isGameViewed,
  host,
}: {
  game: ExplorerGamesPanelRenderProps['games'][number];
  startFen?: string;
  onGameSelect?: ExplorerGamesPanelRenderProps['onGameSelect'];
  wrappedRows: boolean;
  isGameViewed: (gameId: string) => boolean;
  host: Required<
    Pick<
      ExplorerGamesPanelHostProps,
      | 'renderGameRowWrapper'
      | 'renderViewedIcon'
      | 'renderOpeningLabel'
      | 'formatTimeControl'
      | 'formatDate'
      | 'formatGameSource'
      | 'selectableRowSx'
      | 'seenColumnCellSx'
      | 'wrappedGameRowLine1Sx'
      | 'wrappedGameRowLine2Sx'
    >
  >;
}) => {
  const rowProps = {
    hover: true as const,
    onClick: onGameSelect ? () => onGameSelect(game) : undefined,
    sx: onGameSelect ? host.selectableRowSx : undefined,
  };

  const rowContent = wrappedRows ? (
    <TableRow {...rowProps}>
      <TableCell sx={host.seenColumnCellSx}>
        {host.renderViewedIcon(isGameViewed(game.gameId))}
      </TableCell>
      <TableCell colSpan={EXPLORER_GAMES_COLUMN_COUNT - 1}>
        <ExplorerWrappedGameRow game={game} host={host} />
      </TableCell>
    </TableRow>
  ) : (
    <TableRow {...rowProps}>
      <TableCell sx={host.seenColumnCellSx}>
        {host.renderViewedIcon(isGameViewed(game.gameId))}
      </TableCell>
      <TableCell>{formatExplorerCell(game.white)}</TableCell>
      <TableCell>{formatExplorerCell(game.whiteElo)}</TableCell>
      <TableCell>{formatExplorerCell(game.black)}</TableCell>
      <TableCell>{formatExplorerCell(game.blackElo)}</TableCell>
      <TableCell>{formatExplorerCell(game.result)}</TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {host.formatTimeControl(game.timeControl, game.timeClass) ?? '—'}
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {host.formatDate(game.date) ?? '—'}
      </TableCell>
      <TableCell>{host.renderOpeningLabel(game)}</TableCell>
      <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {host.formatGameSource(game.source)}
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {host.renderGameRowWrapper({
        gameId: game.gameId,
        startFen,
        children: rowContent,
      })}
    </>
  );
};

const ExplorerWrappedGameRow = ({
  game,
  host,
}: {
  game: ExplorerGamesPanelRenderProps['games'][number];
  host: Pick<
    ExplorerGamesPanelHostProps,
    | 'renderOpeningLabel'
    | 'formatTimeControl'
    | 'formatDate'
    | 'formatGameSource'
    | 'wrappedGameRowLine1Sx'
    | 'wrappedGameRowLine2Sx'
  >;
}) => {
  const timeLabel = host.formatTimeControl!(game.timeControl, game.timeClass) ?? '—';
  const dateLabel = host.formatDate!(game.date) ?? '—';

  return (
    <Box>
      <Box sx={host.wrappedGameRowLine1Sx}>
        <Box component="span">{formatExplorerCell(game.white)}</Box>
        <Box component="span">{formatExplorerCell(game.whiteElo)}</Box>
        <Box component="span">{formatExplorerCell(game.black)}</Box>
        <Box component="span">{formatExplorerCell(game.blackElo)}</Box>
        <Box component="span">{formatExplorerCell(game.result)}</Box>
      </Box>
      <Box sx={host.wrappedGameRowLine2Sx}>
        <Box component="span">{timeLabel}</Box>
        <Box component="span">{dateLabel}</Box>
        {host.renderOpeningLabel!(game, {
          maxWidth: 'none',
          overflow: 'visible',
          textOverflow: 'clip',
          whiteSpace: 'normal',
        })}
        <Box component="span">{host.formatGameSource!(game.source)}</Box>
      </Box>
    </Box>
  );
};

const resolveHost = (
  props: ExplorerGamesPanelRenderProps,
): Required<
  Pick<
    ExplorerGamesPanelHostProps,
    | 'renderGameRowWrapper'
    | 'renderViewedIcon'
    | 'renderOpeningLabel'
    | 'formatTimeControl'
    | 'formatDate'
    | 'formatGameSource'
    | 'renderSourceFilter'
    | 'selectableRowSx'
    | 'seenColumnCellSx'
    | 'wrappedGameTableSx'
    | 'wrappedGameRowLine1Sx'
    | 'wrappedGameRowLine2Sx'
  >
> & { useViewedGameIds: (games: PositionGameRowApiDto[]) => Set<string> } => ({
  renderGameRowWrapper: props.renderGameRowWrapper ?? (({ children }) => children),
  renderViewedIcon: props.renderViewedIcon ?? (() => null),
  renderOpeningLabel: props.renderOpeningLabel ?? defaultOpeningLabel,
  formatTimeControl:
    props.formatTimeControl ?? (() => null),
  formatDate: props.formatDate ?? (() => null),
  formatGameSource:
    props.formatGameSource ?? ((source) => formatExplorerCell(source)),
  renderSourceFilter:
    props.renderSourceFilter ??
    (({ sources }) => (
      <Box component="span" sx={{ color: 'text.secondary' }}>
        Sources: {sources.join(', ')}
      </Box>
    )),
  useViewedGameIds: props.useViewedGameIds ?? (() => new Set()),
  selectableRowSx: props.selectableRowSx ?? {},
  seenColumnCellSx: props.seenColumnCellSx ?? {},
  wrappedGameTableSx: props.wrappedGameTableSx ?? {},
  wrappedGameRowLine1Sx: props.wrappedGameRowLine1Sx ?? { display: 'flex', gap: 1 },
  wrappedGameRowLine2Sx: props.wrappedGameRowLine2Sx ?? { display: 'flex', gap: 1 },
});

export const ExplorerGamesPanel = (props: ExplorerGamesPanelRenderProps) => {
  const {
    games,
    lineLabel,
    lineSans,
    loading = false,
    sources,
    onSourcesChange,
    onGameSelect,
    showBrowseLink = true,
    wrappedRows: wrappedRowsProp,
    positionFen,
    browseGamesHref,
    LinkComponent = 'a',
  } = props;
  const host = resolveHost(props);
  const isStacked = !useLandscapeLayout();
  const wrappedRows = wrappedRowsProp ?? true;
  const viewedGameIds = host.useViewedGameIds(games);
  const isGameViewed = (gameId: string) => viewedGameIds.has(gameId);
  const startFen = useMemo(() => {
    if (positionFen?.trim()) {
      return positionFen;
    }
    const fens = fenLineFromOpeningSans(lineSans);
    return fens[fens.length - 1];
  }, [lineSans, positionFen]);

  return (
    <Box
      sx={{
        position: 'relative',
        flex: isStacked ? '0 0 auto' : '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: isStacked ? 'auto' : 0,
        overflow: isStacked ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{ ...sectionHeaderSx, flex: '0 0 auto' }}>
        {lineLabel ? (
          <>
            <Box component="span" sx={{ fontWeight: 700 }}>
              Main line:{' '}
            </Box>
            {lineLabel}
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
              ({formatExplorerCount(games.length)} games)
            </Box>
          </>
        ) : (
          <>
            Games
            <Box component="span" sx={{ color: 'text.secondary', ml: 0.5 }}>
              ({formatExplorerCount(games.length)})
            </Box>
          </>
        )}
      </Box>

      <TableContainer
        sx={{
          flex: isStacked ? '0 0 auto' : '1 1 auto',
          minHeight: isStacked ? 'auto' : 200,
          overflow: isStacked ? 'visible' : 'auto',
        }}
      >
        <Table
          size="small"
          stickyHeader
          sx={
            (wrappedRows
              ? { ...host.wrappedGameTableSx, ...compactTableSx }
              : compactTableSx) as SxProps<Theme>
          }
        >
          <TableHead>
            {wrappedRows ? (
              <TableRow>
                <TableCell sx={host.seenColumnCellSx}>Seen</TableCell>
                <TableCell colSpan={EXPLORER_GAMES_COLUMN_COUNT - 1}>
                  <Box sx={host.wrappedGameRowLine1Sx}>
                    <Box component="span">White</Box>
                    <Box component="span">Elo</Box>
                    <Box component="span">Black</Box>
                    <Box component="span">Elo</Box>
                    <Box component="span">Result</Box>
                  </Box>
                  <Box sx={{ ...host.wrappedGameRowLine2Sx, mt: 0 }}>
                    <Box component="span">Time</Box>
                    <Box component="span">Date</Box>
                    <Box component="span">Opening</Box>
                    <Box component="span">Source</Box>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell sx={host.seenColumnCellSx}>Seen</TableCell>
                <TableCell>White</TableCell>
                <TableCell>Elo</TableCell>
                <TableCell>Black</TableCell>
                <TableCell>Elo</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Opening</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={EXPLORER_GAMES_COLUMN_COUNT}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  Loading games…
                </TableCell>
              </TableRow>
            ) : games.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={EXPLORER_GAMES_COLUMN_COUNT}
                  sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                >
                  No games match this position and source filter.
                </TableCell>
              </TableRow>
            ) : (
              games.map((g: ExplorerGamesPanelRenderProps['games'][number]) => (
                <ExplorerGameRow
                  key={g.gameId}
                  game={g}
                  startFen={startFen}
                  onGameSelect={onGameSelect}
                  wrappedRows={wrappedRows}
                  isGameViewed={isGameViewed}
                  host={host}
                />
              ))
            )}
          </TableBody>
        </Table>
        {showBrowseLink && browseGamesHref ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              px: 1.25,
              py: 1,
              borderTop: 1,
              ...panelBorderSx,
            }}
          >
            <Button
              component={LinkComponent}
              {...(LinkComponent === 'a'
                ? { href: browseGamesHref }
                : { to: browseGamesHref })}
              size="small"
            >
              Browse games
            </Button>
          </Box>
        ) : null}
      </TableContainer>

      <Box
        sx={
          {
            flex: '0 0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 1.5,
            px: 1.25,
            py: 0.75,
            borderTop: 1,
            bgcolor: 'action.hover',
            ...explorerPanelTextSx,
            ...panelBorderSx,
          } as SxProps<Theme>
        }
      >
        {host.renderSourceFilter({ sources, onSourcesChange })}
      </Box>
    </Box>
  );
};

export const renderExplorerGamesPanel = (
  props: ExplorerGamesPanelRenderProps,
) => <ExplorerGamesPanel {...props} />;
