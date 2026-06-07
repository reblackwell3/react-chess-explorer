import type { CSSProperties } from "react";

export type EloRangeFilterProps = {
  minElo: number;
  maxElo: number;
  defaultMinElo: number;
  defaultMaxElo: number;
  onMinEloChange: (value: number) => void;
  onMaxEloChange: (value: number) => void;
};

const inputStyle: CSSProperties = {
  width: 64,
  padding: "2px 6px",
  fontSize: 12,
};

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  alignItems: "center",
};

export const EloRangeFilter = ({
  minElo,
  maxElo,
  defaultMinElo,
  defaultMaxElo,
  onMinEloChange,
  onMaxEloChange,
}: EloRangeFilterProps) => (
  <div style={rowStyle}>
    <span style={{ fontWeight: 600 }}>Filter</span>
    <input
      type="number"
      value={minElo}
      min={0}
      max={3000}
      onChange={(e) => onMinEloChange(Number(e.target.value) || defaultMinElo)}
      style={inputStyle}
      aria-label="Minimum Elo"
    />
    <span>–</span>
    <input
      type="number"
      value={maxElo}
      min={0}
      max={3000}
      onChange={(e) => onMaxEloChange(Number(e.target.value) || defaultMaxElo)}
      style={inputStyle}
      aria-label="Maximum Elo"
    />
  </div>
);
