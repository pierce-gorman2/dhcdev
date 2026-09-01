const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateOnly(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function monthLabel(date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function inRange(date, start, end) {
  if (!start || !end) return false;
  const t = date.getTime();
  return t >= toDateOnly(start).getTime() && t <= toDateOnly(end).getTime();
}

// Returns an array of weeks, each an array of 7 Date objects (may spill into
// adjacent months to fill the grid), for the month containing `monthDate`.
export function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay();
  const gridStart = new Date(year, month, 1 - startOffset);

  const weeks = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor);
      cursor = new Date(cursor.getTime() + DAY_MS);
    }
    weeks.push(week);
    if (cursor.getMonth() !== month && cursor > firstOfMonth) break;
  }
  return weeks;
}
