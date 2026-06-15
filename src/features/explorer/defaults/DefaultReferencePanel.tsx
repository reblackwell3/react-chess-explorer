import type { ReactNode } from "react";
import { panelStyle, referencePanelStyle } from "../components/explorerStyles";

export type DefaultReferencePanelProps = {
  theme: "light" | "dark";
  fillHeight?: boolean;
  status: ReactNode;
  moveStats: ReactNode;
  variationsStrip: ReactNode;
  gamesPanel: ReactNode;
};

/** Right column shell: tab bar + stacked sections (no page footer below). */
export const DefaultReferencePanel = ({
  theme,
  fillHeight = true,
  status,
  moveStats,
  variationsStrip,
  gamesPanel,
}: DefaultReferencePanelProps) => (
  <div
    style={{
      ...referencePanelStyle,
      ...panelStyle,
      ...(fillHeight
        ? {}
        : { height: "auto", minHeight: 0, overflow: "visible" }),
    }}
    data-theme={theme}
  >
    {status}
    <div style={{ flex: "0 0 auto", minHeight: 0 }}>{moveStats}</div>
    {variationsStrip}
    {gamesPanel}
  </div>
);
