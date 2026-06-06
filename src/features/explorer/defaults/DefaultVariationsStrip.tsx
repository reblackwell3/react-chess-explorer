import type { VariationsStripRenderProps } from '../core/renderProps';
import { variationsStripStyle, variationsTabStyle } from '../components/explorerStyles';

/** Placeholder for ChessBase middle pane (Variations / Popularity / Endgames). */
export const DefaultVariationsStrip = ({ theme }: VariationsStripRenderProps) => (
  <div style={variationsStripStyle} data-theme={theme}>
    <span style={{ ...variationsTabStyle, fontWeight: 600 }}>Variations</span>
    <span style={{ ...variationsTabStyle, opacity: 0.5 }}>Popularity</span>
    <span style={{ ...variationsTabStyle, opacity: 0.5 }}>Endgames</span>
    <span style={{ marginLeft: 'auto', fontSize: 11, opacity: 0.55 }}>
      Coming soon
    </span>
  </div>
);

export const defaultRenderVariationsStrip = (
  props: VariationsStripRenderProps,
) => <DefaultVariationsStrip {...props} />;
