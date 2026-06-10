import type { BoardNavRenderProps } from "../core/renderProps";
import { boardNavButtonStyle, boardNavStyle } from "./explorerStyles";

export const DefaultBoardNav = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onFlipBoard,
}: BoardNavRenderProps) => (
  <div style={boardNavStyle}>
    <button
      type="button"
      style={boardNavButtonStyle}
      onClick={onBack}
      disabled={!canGoBack}
      aria-label="Previous position"
      title="Back"
    >
      ◀
    </button>
    <button
      type="button"
      style={boardNavButtonStyle}
      onClick={onForward}
      disabled={!canGoForward}
      aria-label="Next position"
      title="Forward"
    >
      ▶
    </button>
    <button
      type="button"
      style={boardNavButtonStyle}
      onClick={onFlipBoard}
      aria-label="Flip board"
      title="Flip board"
    >
      ⇅
    </button>
  </div>
);

export const defaultRenderBoardNav = (props: BoardNavRenderProps) => (
  <DefaultBoardNav {...props} />
);
