import type { PositionMoveApiDto } from '../types';
import { whiteScorePercent } from '../positionUtils';
import {
  moveStatsSectionStyle,
  sectionTitleStyle,
  tableStyle,
  tdStyle,
  thStyle,
} from './explorerStyles';

export type MoveStatsTableProps = {
  moves: PositionMoveApiDto[];
  selectedUci?: string;
  onMoveSelect: (move: PositionMoveApiDto) => void;
};

export const MoveStatsTable = ({
  moves,
  selectedUci,
  onMoveSelect,
}: MoveStatsTableProps) => (
  <div style={moveStatsSectionStyle}>
    <div style={sectionTitleStyle}>Moves</div>
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={thStyle}>Move</th>
          <th style={thStyle}>Games</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Score %</th>
          <th style={{ ...thStyle, textAlign: 'right' }}>Avg</th>
        </tr>
      </thead>
      <tbody>
        {moves.map((move) => {
          const score = whiteScorePercent(
            move.whiteWins,
            move.draws,
            move.blackWins,
          );
          const selected = move.uci === selectedUci;

          return (
            <tr
              key={move.uci}
              onClick={() => onMoveSelect(move)}
              style={{
                cursor: 'pointer',
                background: selected ? 'rgba(100,149,237,0.25)' : undefined,
              }}
            >
              <td style={tdStyle}>{move.san}</td>
              <td style={tdStyle}>{move.games.toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                {score !== null ? `${score}` : '—'}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right' }}>
                {move.avgElo ?? '—'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
