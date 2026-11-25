// One formatter for every date shown on the site. Dates are calendar days, so
// they're always read in UTC to keep a 2026-08-24 entry from showing as Aug 23.
type DateInput = Date | string;

const toDate = (d: DateInput) => (d instanceof Date ? d : new Date(d));

// "Aug 24, 2026", or "Aug 24" with year: false.
export function formatDate(d: DateInput, { year = true }: { year?: boolean } = {}): string {
  return toDate(d).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    ...(year ? { year: 'numeric' as const } : {}),
  });
}

// "Sep 4, 2026, 13:38 UTC". Falls back to the raw string when it isn't a date.
export function formatDateTimeUTC(d: DateInput): string {
  const date = toDate(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return `${formatDate(date)}, ${date.toISOString().slice(11, 16)} UTC`;
}

// "2026-08-24", for datetime attributes.
export function isoDay(d: DateInput): string {
  return toDate(d).toISOString().slice(0, 10);
}
