import { Box, ButtonBase, Typography, useMediaQuery, useTheme } from '@mui/material';
import { isVariationLineActive } from '../variationLines';
import type { VariationsStripRenderProps } from '../core/renderProps';
import {
  formatExplorerCell,
  formatExplorerCount,
  formatExplorerPercent,
} from './explorerDisplay';
import {
  explorerPanelTextSx,
  explorerVariationColumnHeaderStackedSx,
  explorerVariationColumnHeaderSx,
  explorerVariationLabelSx,
  explorerVariationLineSx,
  explorerVariationLineWrappedSx,
  explorerVariationMetaRowSx,
  explorerVariationMetaSx,
  explorerVariationsScrollSx,
  explorerVariationsStripBodySx,
  explorerVariationsStripSx,
  stackedExplorerVariationsScrollSx,
} from './explorerMuiStyles';

const EXPLORER_VARIATION_COLUMN_LABELS = [
  'Games',
  'Score %',
  'Last played',
  'Avg',
] as const;

const ExplorerVariationColumnHeader = ({ stacked }: { stacked: boolean }) => {
  if (stacked) {
    return (
      <Box sx={explorerVariationColumnHeaderStackedSx}>
        {EXPLORER_VARIATION_COLUMN_LABELS.map((label) => (
          <Typography key={label} component="span" sx={explorerVariationMetaSx}>
            {label}
          </Typography>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={explorerVariationColumnHeaderSx}>
      <Typography
        component="span"
        sx={{ flex: 1, minWidth: 0, fontWeight: 600, ...explorerPanelTextSx }}
      >
        Line
      </Typography>
      {EXPLORER_VARIATION_COLUMN_LABELS.map((label) => (
        <Typography key={label} component="span" sx={explorerVariationMetaSx}>
          {label}
        </Typography>
      ))}
    </Box>
  );
};

const ExplorerVariationMeta = ({
  games,
  scorePercent,
  lastPlayedYear,
  avgElo,
}: {
  games: number;
  scorePercent: number | null | undefined;
  lastPlayedYear: number | null | undefined;
  avgElo: unknown;
}) => (
  <>
    <Typography component="span" sx={explorerVariationMetaSx}>
      N = {formatExplorerCount(games)}
    </Typography>
    <Typography component="span" sx={explorerVariationMetaSx}>
      {formatExplorerPercent(scorePercent)}
    </Typography>
    <Typography component="span" sx={explorerVariationMetaSx}>
      {lastPlayedYear != null
        ? `Last played ${lastPlayedYear}`
        : 'Last played —'}
    </Typography>
    <Typography component="span" sx={explorerVariationMetaSx}>
      {formatExplorerCell(avgElo)}
    </Typography>
  </>
);

export const ExplorerVariationsStrip = ({
  theme,
  lines,
  loading,
  selectedLineKey,
  forwardSans,
  onLineSelect,
}: VariationsStripRenderProps) => {
  const muiTheme = useTheme();
  const isStacked = useMediaQuery(muiTheme.breakpoints.down('lg'));

  const showColumnHeader = loading || lines.length > 0;

  return (
    <Box data-theme={theme} sx={explorerVariationsStripSx}>
        <Box sx={explorerVariationsStripBodySx}>
          {showColumnHeader ? (
            <ExplorerVariationColumnHeader stacked={isStacked} />
          ) : null}
          <Box
            sx={
              isStacked
                ? stackedExplorerVariationsScrollSx
                : explorerVariationsScrollSx
            }
          >
          {loading ? (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={explorerPanelTextSx}
            >
              Loading…
            </Typography>
          ) : lines.length === 0 ? (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={explorerPanelTextSx}
            >
              No variations for this position
            </Typography>
          ) : (
            lines.map((line) => {
              const active = isVariationLineActive(
                line,
                selectedLineKey,
                forwardSans,
              );

              return (
                <ButtonBase
                  key={line.key}
                  onClick={() => onLineSelect(line)}
                  sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: isStacked ? 'stretch' : 'baseline',
                    justifyContent: 'flex-start',
                    gap: { xs: 1.5, xxl: 2 },
                    py: { xs: 0.35, xxl: 0.4, xxxl: 0.55 },
                    px: 0,
                    borderRadius: 0,
                    textAlign: 'left',
                    color: active ? 'success.main' : 'text.primary',
                  }}
                >
                  {isStacked ? (
                    <Box component="span" sx={explorerVariationLineWrappedSx}>
                      <Typography
                        component="span"
                        sx={explorerVariationLabelSx(active)}
                      >
                        {formatExplorerCell(line.label)}
                      </Typography>
                      <Box component="span" sx={explorerVariationMetaRowSx}>
                        <ExplorerVariationMeta
                          games={line.games}
                          scorePercent={line.scorePercent}
                          lastPlayedYear={line.lastPlayedYear}
                          avgElo={line.avgElo}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box component="span" sx={explorerVariationLineSx}>
                      <Typography
                        component="span"
                        sx={explorerVariationLabelSx(active)}
                      >
                        {formatExplorerCell(line.label)}
                      </Typography>
                      <ExplorerVariationMeta
                        games={line.games}
                        scorePercent={line.scorePercent}
                        lastPlayedYear={line.lastPlayedYear}
                        avgElo={line.avgElo}
                      />
                    </Box>
                  )}
                </ButtonBase>
              );
            })
          )}
          </Box>
        </Box>
    </Box>
  );
};

export const renderExplorerVariationsStrip = (
  props: VariationsStripRenderProps,
) => <ExplorerVariationsStrip {...props} />;
