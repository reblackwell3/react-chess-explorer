import type { CSSProperties } from "react";
import { DEFAULT_REFERENCE_LAYOUT } from "../referenceLayout";

export const panelStyle: CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontSize: 13,
};

export const tableStyle: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 12,
};

export const thStyle: CSSProperties = {
  textAlign: "left",
  padding: "4px 8px",
  borderBottom: "1px solid rgba(128,128,128,0.35)",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

export const tdStyle: CSSProperties = {
  padding: "3px 8px",
  borderBottom: "1px solid rgba(128,128,128,0.12)",
  whiteSpace: "normal",
  wordBreak: "break-word",
};

export const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 8px",
  borderBottom: "1px solid rgba(128,128,128,0.2)",
  background: "rgba(128,128,128,0.06)",
};

/** Full-width shell: board | reference — no wrap, no footer below. */
export const referenceShellStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: `${DEFAULT_REFERENCE_LAYOUT.boardColumn} ${DEFAULT_REFERENCE_LAYOUT.referenceColumn}`,
  width: "100%",
  height: "100%",
  minHeight: DEFAULT_REFERENCE_LAYOUT.minHeight,
  overflow: "hidden",
  boxSizing: "border-box",
};

export const boardColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  padding: "8px 12px",
  minHeight: 0,
  overflow: "auto",
  boxSizing: "border-box",
  gap: 8,
};

export const boardNavStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  width: "100%",
};

export const boardNavButtonStyle: CSSProperties = {
  minWidth: 44,
  padding: "6px 14px",
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
  border: "1px solid rgba(128,128,128,0.4)",
  borderRadius: 4,
  background: "rgba(128,128,128,0.1)",
};

export const referencePanelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  height: "100%",
  overflow: "hidden",
  borderLeft: "1px solid rgba(128,128,128,0.3)",
  boxSizing: "border-box",
};

export const referenceTabBarStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 10px",
  borderBottom: "1px solid rgba(128,128,128,0.35)",
  background: "rgba(128,128,128,0.08)",
  fontSize: 12,
};

export const referenceTabLabelStyle: CSSProperties = {
  padding: "2px 8px",
};

export const moveStatsSectionStyle: CSSProperties = {
  flex: "0 1 auto",
  maxHeight: "38%",
  minHeight: 120,
  overflow: "auto",
  borderBottom: "1px solid rgba(128,128,128,0.2)",
};

export const variationsStripStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "6px 10px",
  borderBottom: "1px solid rgba(128,128,128,0.2)",
  fontSize: 12,
  background: "rgba(128,128,128,0.04)",
};

export const variationsTabStyle: CSSProperties = {
  cursor: "default",
};

export const gamesSectionStyle: CSSProperties = {
  flex: "1 1 auto",
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
};

export const gamesHeaderStyle: CSSProperties = {
  flex: "0 0 auto",
  padding: "6px 10px",
  fontSize: 12,
  borderBottom: "1px solid rgba(128,128,128,0.15)",
  background: "rgba(128,128,128,0.05)",
};

export const gamesScrollStyle: CSSProperties = {
  flex: "1 1 auto",
  overflow: "auto",
  minHeight: 0,
};

export const gamesToolbarStyle: CSSProperties = {
  flex: "0 0 auto",
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 10,
  padding: "6px 10px",
  borderTop: "1px solid rgba(128,128,128,0.3)",
  background: "rgba(128,128,128,0.08)",
  fontSize: 12,
};

export const statusInlineStyle: CSSProperties = {
  flex: "0 0 auto",
  padding: "4px 10px",
  margin: 0,
  fontSize: 12,
};

/** @deprecated Use referenceShellStyle — kept for ExplorerPlaceholder */
export const layoutStyle: CSSProperties = referenceShellStyle;

/** @deprecated Use referencePanelStyle */
export const sidebarStyle: CSSProperties = referencePanelStyle;
