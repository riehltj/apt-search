import { hasValue } from '../lib/fields.js';
import { Stars } from './Stars.jsx';

// Renders a field's value the same way on cards, detail view and the comparison table.
export function FeatureValue({ field, value }) {
  if (!hasValue(field, value)) return <span className="text-stone-400 dark:text-stone-600">—</span>;
  switch (field.type) {
    case 'rating':
      return <Stars value={value} />;
    case 'bool':
      return value ? 'Yes' : 'No';
    case 'choice':
      return field.options.find((o) => o.value === value)?.label ?? String(value);
    case 'number':
      return Number(value).toLocaleString();
    default:
      return String(value);
  }
}
