import { useState } from 'react';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from './Modal.jsx';
import { FeatureValue } from './FeatureValue.jsx';
import { StarInput } from './Stars.jsx';
import { Row } from './ApartmentCard.jsx';
import { btnDanger, btnSecondary, cardCls, inputCls, mutedCls } from '../lib/ui.js';
import { fmtTour, mapUrl, money } from '../lib/format.js';
import { hasOneTimeCosts, monthlyCost, moveInCost } from '../lib/calc.js';

function Section({ title, children }) {
  return (
    <section className={`${cardCls} p-4`}>
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">{title}</h3>
      {children}
    </section>
  );
}

const Total = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-3 border-t border-stone-200 pt-2 dark:border-stone-800">
    <span className="text-sm font-semibold">{label}</span>
    <span className="text-lg font-extrabold">{money(value)}</span>
  </div>
);

// Ratings and notes are editable right here; everything else goes through Edit.
export function DetailView({ apt, fields, onUpdate, onEdit, onDelete, onClose }) {
  const [notes, setNotes] = useState(apt.notes);
  const setFeature = (id, v) => {
    const features = { ...apt.features };
    if (v === null) delete features[id];
    else features[id] = v;
    onUpdate({ ...apt, features });
  };
  const saveNotes = () => notes !== apt.notes && onUpdate({ ...apt, notes });

  const ratings = fields.filter((f) => f.type === 'rating');
  const others = fields.filter((f) => f.type !== 'rating');

  return (
    <Modal title={apt.name} onClose={onClose}>
      <ModalBody>
        <div className="space-y-4">
          <div>
            <a href={mapUrl(apt.address)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
              <MapPin size={16} className="text-emerald-600" /> {apt.address}
            </a>
            <div className={`mt-1 text-sm ${mutedCls}`}>Tour: {fmtTour(apt)}</div>
          </div>

          <Section title="Monthly cost">
            <dl>
              <Row label="Rent">{money(apt.rent)}</Row>
              {apt.parking != null && <Row label="Parking">{money(apt.parking)}</Row>}
              {apt.petRent != null && <Row label="Cat rent">{money(apt.petRent)}</Row>}
              {apt.otherMonthly != null && <Row label="Other fees">{money(apt.otherMonthly)}</Row>}
            </dl>
            <Total label="Estimated monthly cost" value={monthlyCost(apt)} />
          </Section>

          {hasOneTimeCosts(apt) && (
            <Section title="One-time costs">
              <dl>
                {apt.petDeposit != null && <Row label="Cat deposit">{money(apt.petDeposit)}</Row>}
                {apt.securityDeposit != null && <Row label="Security deposit">{money(apt.securityDeposit)}</Row>}
                {apt.applicationFee != null && <Row label="Application fee">{money(apt.applicationFee)}</Row>}
                {apt.otherOneTime != null && <Row label="Other one-time">{money(apt.otherOneTime)}</Row>}
                <Row label="First month's rent">{money(apt.rent)}</Row>
              </dl>
              <Total label="Move-in cost" value={moveInCost(apt)} />
            </Section>
          )}

          <Section title="Features">
            <dl>
              {others.map((f) => (
                <Row key={f.id} label={f.label}><FeatureValue field={f} value={apt.features[f.id]} /></Row>
              ))}
            </dl>
          </Section>

          {ratings.length > 0 && (
            <Section title="Ratings (tap stars to update)">
              <div className="divide-y divide-stone-100 dark:divide-stone-800/70">
                {ratings.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3">
                    <span className={`text-sm ${mutedCls}`}>{f.label}</span>
                    <StarInput label={f.label} value={apt.features[f.id]} onChange={(v) => setFeature(f.id, v)} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="Notes">
            <textarea
              rows={5}
              className={`${inputCls} mt-1`}
              placeholder="Add notes…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
            />
          </Section>
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" onClick={onDelete} className={btnDanger}><Trash2 size={15} /> Delete</button>
        <button type="button" onClick={() => { saveNotes(); onEdit(); }} className={btnSecondary}><Pencil size={15} /> Edit details</button>
      </ModalFooter>
    </Modal>
  );
}
