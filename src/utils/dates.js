export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target - today;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return 'TBD';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso.includes('Z') || iso.includes('+') ? iso : `${iso}Z`);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function countdownLabel(days) {
  if (days === null) return 'No target date';
  if (days < 0) return `${Math.abs(days)}d past target`;
  if (days === 0) return 'Opens today';
  return `${days}d to open`;
}
