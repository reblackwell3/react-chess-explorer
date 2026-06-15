import type { VariationsStripRenderProps } from "../core/renderProps";
import { variationsStripStyle } from "../components/explorerStyles";
import { isVariationLineActive } from "../variationLines";

export const DefaultVariationsStrip = ({
  theme,
  lines,
  loading,
  selectedLineKey,
  forwardSans,
  onLineSelect,
}: VariationsStripRenderProps) => (
  <div
    style={{
      ...variationsStripStyle,
      flexDirection: "column",
      alignItems: "stretch",
      gap: 6,
    }}
    data-theme={theme}
  >
    <div
      style={{
        minWidth: 0,
        maxHeight: 132,
        overflow: "auto",
      }}
    >
      {loading ? (
        <span style={{ fontSize: 11, opacity: 0.55 }}>Loading…</span>
      ) : lines.length === 0 ? (
        <span style={{ fontSize: 11, opacity: 0.55 }}>No lines</span>
      ) : (
        lines.map((line) => {
          const active = isVariationLineActive(
            line,
            selectedLineKey,
            forwardSans,
          );

          return (
            <button
              key={line.key}
              type="button"
              onClick={() => onLineSelect(line)}
              style={{
                display: "flex",
                width: "100%",
                gap: 12,
                alignItems: "baseline",
                border: "none",
                background: "transparent",
                padding: "2px 0",
                cursor: "pointer",
                textAlign: "left",
                color: active ? "#2e7d32" : "inherit",
                font: "inherit",
                fontSize: 12,
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>{line.label}</span>
              <span>N = {line.games.toLocaleString()}</span>
              <span>{line.scorePercent ?? "—"}%</span>
              <span>
                {line.lastPlayedYear
                  ? `Last played ${line.lastPlayedYear}`
                  : "Last played —"}
              </span>
              <span>{line.avgElo ?? "—"}</span>
            </button>
          );
        })
      )}
    </div>
  </div>
);

export const defaultRenderVariationsStrip = (
  props: VariationsStripRenderProps,
) => <DefaultVariationsStrip {...props} />;
