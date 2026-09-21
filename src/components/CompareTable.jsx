import { useState } from 'react';
import { X } from 'lucide-react';
import { FeatureValue } from './FeatureValue.jsx';
import { cardCls, mutedCls } from '../lib/ui.js';
import { fmtTour, money } from '../lib/format.js';
import { monthlyCost, moveInCost } from '../lib/calc.js';
import { hasValue } from '../lib/fields.js';

const dash = <span className="text-stone-400 dark:text-stone-600">—</span>;
const moneyOrDash = (v) => (v == null ? dash : money(v));
const perMonth = (v) => (v == null ? dash : v === 0 ? 'Free' : `${money(v)}/mo`);

// No winner is picked. Rows where the apartments differ get a marker so differences stand out.
export function CompareTable({ apartments, fields, onRemove, onClear }) {
  const [onlyDiff, setOnlyDiff] = useState(false);

  const rows = [
    { label: 'Tour', key: fmtTour, show: (a) => fmtTour(a) || dash },
    { label: 'Rent', key: (a) => a.rent, show: (a) => money(a.rent) },
    { label: 'Monthly cost', bold: true, key: monthlyCost, show: (a) => money(monthlyCost(a)) },
    { label: 'Move-in cost', key: moveInCost, show: (a) => money(moveInCost(a)) },
    { label: 'Parking', key: (a) => a.parking, show: (a) => perMonth(a.parking) },
    { label: 'Cat rent', key: (a) => a.petRent, show: (a) => perMonth(a.petRent) },
    { label: 'Cat deposit', key: (a) => a.petDeposit, show: (a) => moneyOrDash(a.petDeposit) },
    { label: 'Security deposit', key: (a) => a.securityDeposit, show: (a) => moneyOrDash(a.securityDeposit) },
    ...fields.map((f) => ({
      label: f.label,
      key: (a) => (hasValue(f, a.features[f.id]) ? a.features[f.id] : null),
      show: (a) => <FeatureValue field={f} value={a.features[f.id]} />,
    })),
  ].map((r) => ({ ...r, differs: new Set(apartments.map((a) => String(r.key(a) ?? ''))).size > 1 }));

  // Hide rows where nobody has a value at all (e.g. security deposit nobody entered).
  const visible = rows
    .filter((r) => apartments.some((a) => (r.key(a) ?? '') !== ''))
    .filter((r) => !onlyDiff || apartments.length < 2 || r.differs);

  return (
    <section id="compare" className={`${cardCls} scroll-mt-4 p-4`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold">
          Compare <span className={`text-sm font-medium ${mutedCls}`}>({apartments.length}/4)</span>
        </h2>
        <div className="flex items-center gap-4 text-sm">
          {apartments.length > 1 && (
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" className="accent-emerald-600" checked={onlyDiff} onChange={(e) => setOnlyDiff(e.target.checked)} />
              Only differences
            </label>
          )}
          <button type="button" onClick={onClear} className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">Clear</button>
        </div>
      </div>
      {apartments.length === 1 && <p className={`mb-3 text-sm ${mutedCls}`}>Tick “Compare” on another apartment to see them side by side.</p>}

      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white dark:bg-stone-900" />
              {apartments.map((a) => (
                <th key={a.id} className="min-w-36 px-3 pb-2 text-left align-bottom">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-base font-bold">{a.name}</span>
                    <button type="button" aria-label={`Remove ${a.name} from comparison`} onClick={() => onRemove(a.id)} className="rounded-full p-0.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800">
                      <X size={14} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const mark = r.differs && apartments.length > 1;
              return (
                <tr key={r.label} className={mark ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : ''}>
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 whitespace-nowrap border-t border-stone-100 py-2 pr-3 text-left font-medium dark:border-stone-800 ${mutedCls} ${
                      mark ? 'bg-emerald-50 dark:bg-emerald-950' : 'bg-white dark:bg-stone-900'
                    }`}
                  >
                    {r.label}
                  </th>
                  {apartments.map((a) => (
                    <td key={a.id} className={`border-t border-stone-100 px-3 py-2 dark:border-stone-800 ${r.bold ? 'font-bold' : ''}`}>
                      {r.show(a)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {apartments.length > 1 && <p className={`mt-3 text-xs ${mutedCls}`}>Shaded rows are where these apartments differ.</p>}
    </section>
  );
}
