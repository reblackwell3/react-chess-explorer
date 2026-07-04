import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import type { ExplorerStatusRenderProps } from '../core/renderProps';
import { explorerPanelTextSx } from './explorerMuiStyles';

export const renderExplorerStatus = ({
  error,
  loading,
}: ExplorerStatusRenderProps) => {
  if (!error && !loading) return null;

  return (
    <Box sx={{ px: 1.25, py: 0.5, flex: '0 0 auto' }}>
      {error && (
        <Alert severity="warning" sx={{ py: 0, ...explorerPanelTextSx }}>
          {error}
        </Alert>
      )}
      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
          <CircularProgress size={16} />
          <Typography color="text.secondary" sx={explorerPanelTextSx}>
            Loading…
          </Typography>
        </Box>
      )}
    </Box>
  );
};
