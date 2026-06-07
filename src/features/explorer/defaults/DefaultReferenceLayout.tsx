import type { ReferenceLayoutRenderProps } from "../core/renderProps";
import {
  boardColumnStyle,
  referenceShellStyle,
} from "../components/explorerStyles";

export const DefaultReferenceLayout = ({
  board,
  referencePanel,
}: ReferenceLayoutRenderProps) => (
  <div style={referenceShellStyle}>
    <div style={boardColumnStyle}>{board}</div>
    {referencePanel}
  </div>
);

export const defaultRenderLayout = (props: ReferenceLayoutRenderProps) => (
  <DefaultReferenceLayout {...props} />
);
