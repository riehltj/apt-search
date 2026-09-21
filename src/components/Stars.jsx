// Read-only stars.
export function Stars({ value = 0 }) {
  return (
    <span className="whitespace-nowrap tracking-wide" role="img" aria-label={`${value} out of 5 stars`}>
      <span className="text-amber-500">{'★'.repeat(value)}</span>
      <span className="text-stone-300 dark:text-stone-700">{'★'.repeat(5 - value)}</span>
    </span>
  );
}

// 1–5 star control. Tapping the current value clears it (ratings are optional).
export function StarInput({ value, onChange, label }) {
  return (
    <div className="flex" role="group" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          aria-pressed={n === value}
          onClick={() => onChange(n === value ? null : n)}
          className={`h-11 w-10 text-3xl leading-none transition-colors ${
            n <= (value || 0) ? 'text-amber-500' : 'text-stone-300 hover:text-amber-300 dark:text-stone-700'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
