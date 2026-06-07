import { statusInlineStyle } from "./explorerStyles";

export type ExplorerStatusBannerProps = {
  error: string | null;
  loading: boolean;
};

export const ExplorerStatusBanner = ({
  error,
  loading,
}: ExplorerStatusBannerProps) => {
  if (!error && !loading) return null;

  return (
    <>
      {error && (
        <p style={{ ...statusInlineStyle, color: "#e57373" }} role="alert">
          {error}
        </p>
      )}
      {loading && (
        <p style={{ ...statusInlineStyle, opacity: 0.7 }}>Loading…</p>
      )}
    </>
  );
};
