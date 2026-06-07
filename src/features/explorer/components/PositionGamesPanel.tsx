import type { CSSProperties } from "react";
import type { PositionGameRowApiDto } from "../types";
import { EloRangeFilter } from "./EloRangeFilter";
import { GamesTable } from "./GamesTable";
import {
  gamesHeaderStyle,
  gamesScrollStyle,
  gamesSectionStyle,
  gamesToolbarStyle,
} from "./explorerStyles";

export type PositionGamesPanelProps = {
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
  onGameSelect?: (game: PositionGameRowApiDto) => void;
};

const mainLineTitleStyle: CSSProperties = {
  fontWeight: 600,
};

export const PositionGamesPanel = ({
  games,
  lineLabel,
  minElo,
  maxElo,
  defaultMinElo,
  defaultMaxElo,
  topOnly,
  onMinEloChange,
  onMaxEloChange,
  onTopOnlyChange,
  onGameSelect,
}: PositionGamesPanelProps) => (
  <div style={gamesSectionStyle}>
    <div style={gamesHeaderStyle}>
      {lineLabel ? (
        <>
          <span style={mainLineTitleStyle}>Main line: </span>
          {lineLabel}
          <span style={{ opacity: 0.75 }}> ({games.length} games)</span>
        </>
      ) : (
        <span>
          Games <span style={{ opacity: 0.75 }}>({games.length})</span>
        </span>
      )}
    </div>

    <div style={gamesScrollStyle}>
      <GamesTable games={games} onGameSelect={onGameSelect} />
    </div>

    <div style={gamesToolbarStyle}>
      <EloRangeFilter
        minElo={minElo}
        maxElo={maxElo}
        defaultMinElo={defaultMinElo}
        defaultMaxElo={defaultMaxElo}
        onMinEloChange={onMinEloChange}
        onMaxEloChange={onMaxEloChange}
      />
      <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="checkbox"
          checked={topOnly}
          onChange={(e) => onTopOnlyChange(e.target.checked)}
        />
        Top games
      </label>
    </div>
  </div>
);
