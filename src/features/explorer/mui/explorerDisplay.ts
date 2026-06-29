/** Coerce API/scalar values to safe MUI table/button text (never raw objects). */
export function formatExplorerCell(value: unknown): string {
  if (value == null) {
    return '—';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : '—';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '—';
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (typeof value === 'bigint') {
    return String(value);
  }
  return '—';
}

export function formatExplorerPercent(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value}%`;
  }
  return '—';
}

export function formatExplorerCount(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString();
  }
  return '—';
}
