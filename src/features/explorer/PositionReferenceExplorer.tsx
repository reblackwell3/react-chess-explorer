import { PositionReferenceExplorerCore } from "./core/PositionReferenceExplorerCore";
import type { PositionReferenceExplorerCoreProps } from "./core/renderProps";

export type PositionReferenceExplorerProps = PositionReferenceExplorerCoreProps;

/** Reference explorer with library default layout and renderers (ChessBase-style grid). */
export const PositionReferenceExplorer = (
  props: PositionReferenceExplorerProps,
) => <PositionReferenceExplorerCore {...props} />;
