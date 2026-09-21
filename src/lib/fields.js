// Field definitions drive the form, cards, detail view and comparison table.
// type: 'text' | 'number' | 'bool' | 'rating' | 'choice' (choice is built-in only)

export const WASHER_DRYER_OPTIONS = [
  { value: 'in_unit', label: 'In Unit' },
  { value: 'in_building', label: 'In Building' },
  { value: 'none', label: 'None' },
  { value: 'unknown', label: 'Unknown' },
];

export const DEFAULT_FIELDS = [
  { id: 'washerDryer', label: 'Washer/Dryer', type: 'choice', options: WASHER_DRYER_OPTIONS, builtin: true },
  { id: 'walkInCloset', label: 'Walk-in Closet', type: 'bool', builtin: true },
  { id: 'kitchen', label: 'Kitchen', type: 'rating', builtin: true },
  { id: 'bathroom', label: 'Bathroom', type: 'rating', builtin: true },
  { id: 'naturalLight', label: 'Natural Light', type: 'rating', builtin: true },
  { id: 'noise', label: 'Noise', type: 'rating', builtin: true },
  { id: 'overall', label: 'Overall', type: 'rating', builtin: true },
];

export const CUSTOM_FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'bool', label: 'Yes/No' },
  { value: 'rating', label: 'Rating' },
];

// Built-ins always come from code (so they can't be corrupted); custom ones come from storage.
export function mergeFields(stored) {
  const custom = Array.isArray(stored)
    ? stored.filter((f) => f && !f.builtin && f.id && f.label && CUSTOM_FIELD_TYPES.some((t) => t.value === f.type))
    : [];
  return [...DEFAULT_FIELDS, ...custom.map(({ id, label, type }) => ({ id, label, type }))];
}

// Is there something worth displaying for this field value?
export function hasValue(field, value) {
  if (value === null || value === undefined || value === '') return false;
  if (field.type === 'rating') return value > 0;
  if (field.type === 'choice') return value !== 'unknown';
  return true;
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
