import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from './Modal.jsx';
import { FieldInput } from './FieldInput.jsx';
import { btnPrimary, btnSecondary, inputCls, labelCls, mutedCls } from '../lib/ui.js';
import { dateStr, money } from '../lib/format.js';
import { monthlyCost } from '../lib/calc.js';
import { newId } from '../lib/fields.js';

const MONEY_KEYS = ['rent', 'parking', 'petRent', 'otherMonthly', 'petDeposit', 'securityDeposit', 'applicationFee', 'otherOneTime'];
const ONE_TIME_KEYS = ['petDeposit', 'securityDeposit', 'applicationFee', 'otherOneTime'];

// Number inputs are edited as strings; '' means "not entered".
const toNumber = (s) => (s === '' || s === undefined ? null : Number(s));

function toDraft(a) {
  const d = {
    name: a?.name ?? '',
    address: a?.address ?? '',
    tourDate: a?.tourDate ?? dateStr(),
    tourTime: a?.tourTime ?? '',
    notes: a?.notes ?? '',
    features: { ...(a?.features ?? {}) },
  };
  for (const k of MONEY_KEYS) d[k] = a?.[k] == null ? '' : String(a[k]);
  return d;
}

function Money({ label, value, onChange, required, placeholder = '0' }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          required={required}
          placeholder={placeholder}
          className={`${inputCls} pl-7`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}

export function ApartmentForm({ initial, fields, onSave, onClose, onManageFields }) {
  const [d, setD] = useState(() => toDraft(initial));
  const set = (k, v) => setD((prev) => ({ ...prev, [k]: v }));
  const setFeature = (id, v) =>
    setD((prev) => {
      const features = { ...prev.features };
      if (v === null || v === undefined || v === '') delete features[id];
      else features[id] = v;
      return { ...prev, features };
    });

  const submit = (e) => {
    e.preventDefault();
    const apt = {
      id: initial?.id ?? newId(), // editing a seed apartment makes it "real" (isSeed is dropped)
      name: d.name.trim(),
      address: d.address.trim(),
      tourDate: d.tourDate,
      tourTime: d.tourTime,
      notes: d.notes,
      features: d.features,
    };
    for (const k of MONEY_KEYS) apt[k] = toNumber(d[k]);
    onSave(apt);
  };

  const preview = monthlyCost(Object.fromEntries(MONEY_KEYS.map((k) => [k, toNumber(d[k])])));

  return (
    <Modal title={initial ? 'Edit apartment' : 'Add apartment'} onClose={onClose} dismissOnBackdrop={false}>
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <ModalBody>
          <div className="space-y-7">
            <section className="space-y-3">
              <label className="block">
                <span className={labelCls}>Apartment name</span>
                <input
                  required
                  autoFocus={!initial}
                  className={inputCls}
                  placeholder="The Alpine"
                  value={d.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              </label>
              <label className="block">
                <span className={labelCls}>Address</span>
                <input
                  required
                  className={inputCls}
                  placeholder="1330 N Gaylord St"
                  autoComplete="street-address"
                  value={d.address}
                  onChange={(e) => set('address', e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={labelCls}>Tour date</span>
                  <input required type="date" className={inputCls} value={d.tourDate} onChange={(e) => set('tourDate', e.target.value)} />
                </label>
                <label className="block">
                  <span className={labelCls}>Tour time</span>
                  <input required type="time" className={inputCls} value={d.tourTime} onChange={(e) => set('tourTime', e.target.value)} />
                </label>
              </div>
              <Money required label="Monthly rent" placeholder="1650" value={d.rent} onChange={(v) => set('rent', v)} />
            </section>

            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500">Other monthly costs</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Money label="Parking" value={d.parking} onChange={(v) => set('parking', v)} />
                <Money label="Cat / pet rent" value={d.petRent} onChange={(v) => set('petRent', v)} />
                <Money label="Other fees" value={d.otherMonthly} onChange={(v) => set('otherMonthly', v)} />
              </div>
            </section>

            <details open={ONE_TIME_KEYS.some((k) => d[k] !== '')} className="group">
              <summary className="mb-2 cursor-pointer select-none text-sm font-bold uppercase tracking-wide text-stone-500">
                One-time costs <span className="font-normal normal-case tracking-normal">(optional)</span>
              </summary>
              <div className="grid grid-cols-2 gap-3">
                <Money label="Cat / pet deposit" value={d.petDeposit} onChange={(v) => set('petDeposit', v)} />
                <Money label="Security deposit" value={d.securityDeposit} onChange={(v) => set('securityDeposit', v)} />
                <Money label="Application fee" value={d.applicationFee} onChange={(v) => set('applicationFee', v)} />
                <Money label="Other one-time" value={d.otherOneTime} onChange={(v) => set('otherOneTime', v)} />
              </div>
            </details>

            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wide text-stone-500">Features &amp; ratings</h3>
                <button type="button" onClick={onManageFields} className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400">
                  <SlidersHorizontal size={14} /> Edit fields
                </button>
              </div>
              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f.id} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm font-medium">{f.label}</span>
                    <div className={f.type === 'text' || f.type === 'number' ? 'sm:w-56' : ''}>
                      <FieldInput field={f} value={d.features[f.id]} onChange={(v) => setFeature(f.id, v)} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <label className="block">
              <span className={labelCls}>Notes</span>
              <textarea
                rows={6}
                className={inputCls}
                placeholder="Really liked the kitchen. Bedroom felt a little small. Street seemed noisy."
                value={d.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
            </label>
          </div>
        </ModalBody>
        <ModalFooter>
          <span className={`text-sm ${mutedCls}`}>
            Est. monthly <strong className="text-stone-900 dark:text-stone-100">{money(preview)}</strong>
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
            <button type="submit" className={`${btnPrimary} !py-2`}>Save</button>
          </div>
        </ModalFooter>
      </form>
    </Modal>
  );
}
