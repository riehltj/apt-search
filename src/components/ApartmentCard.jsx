import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { FeatureValue } from './FeatureValue.jsx';
import { btnDanger, btnSecondary, cardCls, mutedCls } from '../lib/ui.js';
import { fmtDay, fmtTime, mapUrl, money } from '../lib/format.js';
import { isPetFriendly, hasOneTimeCosts, monthlyCost, moveInCost } from '../lib/calc.js';
import { hasValue } from '../lib/fields.js';

export function Chip({ children, tone = 'stone' }) {
  const tones = {
    stone: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Row({ label, children }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className={`text-sm ${mutedCls}`}>{label}</dt>
      <dd className="text-right text-sm font-medium">{children}</dd>
    </div>
  );
}

export function ApartmentCard({ apt, fields, selected, compareFull, onToggleCompare, onOpen, onEdit, onDelete }) {
  const wd = apt.features.washerDryer;
  const featureRows = fields.filter((f) => hasValue(f, apt.features[f.id]));
  const washer = featureRows.find((f) => f.id === 'washerDryer');
  const others = featureRows.filter((f) => f.id !== 'washerDryer');

  return (
    <article className={`${cardCls} relative flex flex-col p-5 ${selected ? 'ring-2 ring-emerald-500' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          {fmtTime(apt.tourTime)}
          <span className={`ml-2 font-medium ${mutedCls}`}>{fmtDay(apt.tourDate)}</span>
        </div>
        <label
          className={`relative z-10 flex items-center gap-1.5 text-sm ${compareFull && !selected ? 'opacity-40' : 'cursor-pointer'}`}
          title={compareFull && !selected ? 'You can compare up to 4' : undefined}
        >
          <input
            type="checkbox"
            className="h-4 w-4 accent-emerald-600"
            checked={selected}
            disabled={compareFull && !selected}
            onChange={onToggleCompare}
          />
          Compare
        </label>
      </div>

      <h3 className="mt-1 text-xl font-bold leading-tight">
        <button type="button" onClick={onOpen} className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
          {apt.name}
        </button>
      </h3>
      <p className={`text-sm ${mutedCls}`}>{apt.address}</p>
      <p className="mt-2 text-2xl font-extrabold">
        {money(apt.rent)}
        <span className={`text-base font-medium ${mutedCls}`}>/mo</span>
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {wd === 'in_unit' && <Chip tone="emerald">W/D In Unit</Chip>}
        {wd === 'in_building' && <Chip tone="sky">W/D In Building</Chip>}
        {apt.parking != null && <Chip>{apt.parking > 0 ? 'Parking' : 'Free Parking'}</Chip>}
        {apt.features.walkInCloset === true && <Chip>Walk-in</Chip>}
        {isPetFriendly(apt) && <Chip tone="amber">Pet Friendly</Chip>}
      </div>

      <dl className="mt-3 divide-y divide-stone-100 dark:divide-stone-800/70">
        {washer && (
          <Row label={washer.label}><FeatureValue field={washer} value={apt.features.washerDryer} /></Row>
        )}
        {apt.petRent != null && <Row label="Cat Rent">{money(apt.petRent)}/mo</Row>}
        {apt.petDeposit != null && <Row label="Cat Deposit">{money(apt.petDeposit)}</Row>}
        {apt.parking != null && <Row label="Parking">{apt.parking > 0 ? `${money(apt.parking)}/mo` : 'Free'}</Row>}
        {others.map((f) => (
          <Row key={f.id} label={f.label}><FeatureValue field={f} value={apt.features[f.id]} /></Row>
        ))}
      </dl>

      <div className="mt-4 rounded-xl bg-stone-100 px-4 py-3 dark:bg-stone-800/60">
        <div className="text-sm">
          Estimated monthly cost: <strong className="text-base">{money(monthlyCost(apt))}</strong>
        </div>
        {hasOneTimeCosts(apt) && (
          <div className={`text-xs ${mutedCls}`}>Move-in cost: {money(moveInCost(apt))}</div>
        )}
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} className={btnSecondary}><Pencil size={15} /> Edit</button>
        <a href={mapUrl(apt.address)} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
          <MapPin size={15} /> Open Map
        </a>
        <button type="button" onClick={onDelete} className={`${btnDanger} ml-auto`}><Trash2 size={15} /> Delete</button>
      </div>
    </article>
  );
}
