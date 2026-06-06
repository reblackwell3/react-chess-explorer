import { boardNavButtonStyle, boardNavStyle } from './explorerStyles';

export type BoardNavRenderProps = {
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
};

export const DefaultBoardNav = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
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
  </div>
);

export const defaultRenderBoardNav = (props: BoardNavRenderProps) => (
  <DefaultBoardNav {...props} />
);
