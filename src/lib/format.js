const moneyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const money = (v) => (v === null || v === undefined ? '—' : moneyFmt.format(v));

export function moneyRange(values) {
  const nums = values.filter((v) => typeof v === 'number');
  if (!nums.length) return '—';
  const lo = Math.min(...nums);
  const hi = Math.max(...nums);
  return lo === hi ? money(lo) : `${money(lo)} – ${money(hi)}`;
}

const pad = (x) => String(x).padStart(2, '0');

// Local (not UTC) YYYY-MM-DD, so "today" is right in the evening.
export const dateStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? 'PM' : 'AM'}`;
}

export function fmtDay(s) {
  if (!s) return '';
  const [y, m, d] = s.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const t = new Date();
  const diff = Math.round((date - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export const fmtTour = (a) => [fmtDay(a.tourDate), fmtTime(a.tourTime)].filter(Boolean).join(' · ');

export const mapUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
