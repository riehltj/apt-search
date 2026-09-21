// Small pill selector. Tapping the selected option clears it (fields are optional).
export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? null : o.value)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              on
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-stone-300 bg-white hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export const YES_NO = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No' },
];
