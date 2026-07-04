import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { whiteScorePercent } from '../positionUtils';
import type { MoveStatsRenderProps } from '../core/renderProps';
import {
  formatExplorerCell,
  formatExplorerCount,
  formatExplorerPercent,
} from './explorerDisplay';
import {
  compactTableSx,
  explorerMoveStatsScrollSx,
  moveRowSx,
  panelBorderSx,
} from './explorerMuiStyles';

export const renderExplorerMoveStats = ({
  moves,
  selectedUci,
  onMoveSelect,
}: MoveStatsRenderProps) => (
  <Box
    sx={{
      flex: '0 1 auto',
      minHeight: 0,
      borderBottom: 1,
      ...panelBorderSx,
    }}
  >
    <TableContainer sx={explorerMoveStatsScrollSx}>
      <Table size="small" stickyHeader sx={compactTableSx}>
        <TableHead>
          <TableRow>
            <TableCell>Move</TableCell>
            <TableCell>Games</TableCell>
            <TableCell align="right">Score %</TableCell>
            <TableCell align="right">Avg</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {moves.map((move) => {
            const score = whiteScorePercent(
              move.whiteWins,
              move.draws,
              move.blackWins,
            );
            const selected = move.uci === selectedUci;

            return (
              <TableRow
                key={move.uci}
                hover
                selected={selected}
                onClick={() => onMoveSelect(move)}
                sx={moveRowSx(selected)}
              >
                <TableCell>{formatExplorerCell(move.san)}</TableCell>
                <TableCell>{formatExplorerCount(move.games)}</TableCell>
                <TableCell align="right">
                  {score !== null ? formatExplorerPercent(score) : '—'}
                </TableCell>
                <TableCell align="right">
                  {formatExplorerCell(move.avgElo)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
