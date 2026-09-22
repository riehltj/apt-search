import { DEFAULT_FIELDS, mergeFields } from './fields.js';
import { dateStr } from './format.js';

const KEY = 'apartment-hunt:v1';

// The tours already lined up, baked in as the starting data so every device starts from the same list.
export const seedApartments = () => [
  {
    id: 'mubfoyurwj051o',
    name: 'Alpine',
    address: '1330 N Gaylord St, Denver, CO 80206',
    tourDate: '2026-09-22',
    tourTime: '16:30',
    rent: 1650,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
  {
    id: 'mubfqsxhcedtam',
    name: 'SBK',
    address: '1000 South Broadway, Denver, CO, 80209',
    tourDate: '2026-09-22',
    tourTime: '15:30',
    rent: 0,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
  {
    id: 'mubfrl4xcn0wre',
    name: '8two8',
    address: '828 N Broadway, Denver, CO 80203',
    tourDate: '2026-09-22',
    tourTime: '16:45',
    rent: 0,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
  {
    id: 'mubft39oochh9k',
    name: 'Griffis',
    address: '350 South Jackson Street Denver CO 80209',
    tourDate: '2026-09-22',
    tourTime: '16:30',
    rent: 0,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
  {
    id: 'mubfv9q8i9y12g',
    name: 'Viceroy',
    address: '1910 S Josephine St, Denver, CO, 80210',
    tourDate: '2026-09-22',
    tourTime: '17:00',
    rent: 0,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
  {
    id: 'mubfwn6ufpgp6h',
    name: 'Courtland',
    address: '901 Colorado Blvd, Denver, CO 80206',
    tourDate: '2026-09-22',
    tourTime: '16:00',
    rent: 0,
    parking: null,
    petRent: null,
    otherMonthly: null,
    petDeposit: null,
    securityDeposit: null,
    applicationFee: null,
    otherOneTime: null,
    features: {},
    notes: '',
  },
];

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// Accepts anything shaped like our data (localStorage or an imported file) and returns clean data.
// Throws if it doesn't look like apartment data at all.
export function normalize(raw) {
  if (!raw || !Array.isArray(raw.apartments)) throw new Error('Missing "apartments" list.');
  const fields = mergeFields(raw.fields);
  const apartments = raw.apartments
    .filter((a) => a && typeof a === 'object' && a.id)
    .map((a) => ({
      id: String(a.id),
      ...(a.isSeed ? { isSeed: true } : {}),
      name: String(a.name ?? ''),
      address: String(a.address ?? ''),
      tourDate: String(a.tourDate ?? ''),
      tourTime: String(a.tourTime ?? ''),
      rent: num(a.rent),
      parking: num(a.parking),
      petRent: num(a.petRent),
      otherMonthly: num(a.otherMonthly),
      petDeposit: num(a.petDeposit),
      securityDeposit: num(a.securityDeposit),
      applicationFee: num(a.applicationFee),
      otherOneTime: num(a.otherOneTime),
      features: a.features && typeof a.features === 'object' ? a.features : {},
      notes: String(a.notes ?? ''),
    }));
  return { apartments, fields };
}

export function load() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEY);
    if (raw === null) return { apartments: seedApartments(), fields: DEFAULT_FIELDS };
    return normalize(JSON.parse(raw));
  } catch {
    // Don't silently overwrite something we couldn't read.
    try {
      if (raw) localStorage.setItem(`${KEY}:corrupt-backup`, raw);
    } catch { /* ignore */ }
    return { apartments: [], fields: DEFAULT_FIELDS };
  }
}

export function save(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* storage full or blocked; nothing sensible to do in an MVP */ }
}

export function exportJson(data) {
  const payload = { app: 'apartment-hunt', version: 1, exportedAt: new Date().toISOString(), ...data };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `apartment-hunt-${dateStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
