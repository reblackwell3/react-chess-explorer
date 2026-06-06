import type { CSSProperties } from 'react';
import type { PositionGameRowApiDto } from '../types';
import { tableStyle, tdStyle, thStyle } from './explorerStyles';

export type GamesTableProps = {
  games: PositionGameRowApiDto[];
  onGameSelect?: (game: PositionGameRowApiDto) => void;
};

const linkStyle: CSSProperties = {
  color: 'inherit',
  textDecoration: 'underline',
  textUnderlineOffset: 2,
};

const LichessGameLink = ({
  url,
  name,
}: {
  url: string;
  name: string;
}) => (
  <a href={url} target="_blank" rel="noopener noreferrer" style={linkStyle}>
    {name}
  </a>
);

export const GamesTable = ({ games, onGameSelect }: GamesTableProps) => (
  <table style={tableStyle}>
    <thead>
      <tr>
        <th style={thStyle}>White</th>
        <th style={thStyle}>Elo</th>
        <th style={thStyle}>Black</th>
        <th style={thStyle}>Elo</th>
        <th style={thStyle}>Result</th>
        {onGameSelect && <th style={thStyle} />}
      </tr>
    </thead>
    <tbody>
      {games.length === 0 ? (
        <tr>
          <td
            colSpan={onGameSelect ? 6 : 5}
            style={{ ...tdStyle, opacity: 0.7, fontStyle: 'italic' }}
          >
            No games match this position and filter. Widen the Elo range or turn
            off Top games.
          </td>
        </tr>
      ) : (
        games.map((g) => (
          <tr key={g.gameId}>
            <td style={tdStyle}>
              <LichessGameLink url={g.url} name={g.white} />
            </td>
            <td style={tdStyle}>{g.whiteElo}</td>
            <td style={tdStyle}>
              <LichessGameLink url={g.url} name={g.black} />
            </td>
            <td style={tdStyle}>{g.blackElo}</td>
            <td style={tdStyle}>{g.result}</td>
            {onGameSelect && (
              <td style={tdStyle}>
                <button type="button" onClick={() => onGameSelect(g)}>
                  Train
                </button>
              </td>
            )}
          </tr>
        ))
      )}
    </tbody>
  </table>
);
