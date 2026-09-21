import { inputCls } from '../lib/ui.js';
import { StarInput } from './Stars.jsx';
import { Segmented, YES_NO } from './Segmented.jsx';

// Input for one configurable field, chosen by the field's type.
export function FieldInput({ field, value, onChange }) {
  switch (field.type) {
    case 'rating':
      return <StarInput label={field.label} value={value} onChange={onChange} />;
    case 'bool':
      return <Segmented label={field.label} options={YES_NO} value={value ?? null} onChange={onChange} />;
    case 'choice':
      return <Segmented label={field.label} options={field.options} value={value ?? null} onChange={onChange} />;
    case 'number':
      return (
        <input
          type="number"
          inputMode="decimal"
          step="any"
          className={inputCls}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    default:
      return <input className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} />;
  }
}
