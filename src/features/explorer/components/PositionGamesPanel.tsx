import type { CSSProperties } from "react";
import type { GameSource, PositionGameRowApiDto } from "../types";
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
  lineSans: string[];
  sources: GameSource[];
  onSourcesChange: (sources: GameSource[]) => void;
  onGameSelect?: (game: PositionGameRowApiDto) => void;
};

const mainLineTitleStyle: CSSProperties = {
  fontWeight: 600,
};

export const PositionGamesPanel = ({
  games,
  lineLabel,
  lineSans: _lineSans,
  sources,
  onSourcesChange,
  onGameSelect,
}: PositionGamesPanelProps) => {
  const toggleSource = (source: GameSource) => {
    if (sources.includes(source)) {
      if (sources.length === 1) {
        return;
      }
      onSourcesChange(sources.filter((value) => value !== source));
      return;
    }
    onSourcesChange([...sources, source]);
  };

  return (
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
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={sources.includes("lichess")}
            onChange={() => toggleSource("lichess")}
          />
          Lichess
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={sources.includes("twic")}
            onChange={() => toggleSource("twic")}
          />
          Master
        </label>
      </div>
    </div>
  );
};
