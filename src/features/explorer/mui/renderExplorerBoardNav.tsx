import { useTheme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import { IconButton, Stack, useMediaQuery } from '@mui/material';
import type { BoardNavRenderProps } from '../core/renderProps';

const ExplorerBoardNav = ({
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  onFlipBoard,
}: BoardNavRenderProps) => {
  const theme = useTheme();
  const isUltraWide = useMediaQuery(theme.breakpoints.up('xxxl'));
  const isWideDesktop = useMediaQuery(theme.breakpoints.up('xxl'));
  const iconSize = isUltraWide ? 32 : isWideDesktop ? 28 : 20;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      justifyContent="center"
      sx={{ py: { xs: 0.75, xxl: 1 } }}
    >
      <IconButton
        aria-label="Previous position"
        color="inherit"
        onClick={onBack}
        disabled={!canGoBack}
        sx={{ '& .MuiSvgIcon-root': { fontSize: iconSize } }}
      >
        <ChevronLeftIcon />
      </IconButton>
      <IconButton
        aria-label="Next position"
        color="inherit"
        onClick={onForward}
        disabled={!canGoForward}
        sx={{ '& .MuiSvgIcon-root': { fontSize: iconSize } }}
      >
        <ChevronRightIcon />
      </IconButton>
      <IconButton
        aria-label="Flip board"
        color="inherit"
        onClick={onFlipBoard}
        sx={{ '& .MuiSvgIcon-root': { fontSize: iconSize } }}
      >
        <SwapVertIcon />
      </IconButton>
    </Stack>
  );
};

/** Match PuzzleAnalysisSidebar ply navigation (circular IconButtons, no tooltips). */
export const renderExplorerBoardNav = (props: BoardNavRenderProps) => (
  <ExplorerBoardNav {...props} />
);
