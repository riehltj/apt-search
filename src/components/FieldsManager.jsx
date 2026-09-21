import { useState } from 'react';
import { Lock, Plus, Trash2 } from 'lucide-react';
import { Modal, ModalBody } from './Modal.jsx';
import { CUSTOM_FIELD_TYPES } from '../lib/fields.js';
import { btnPrimary, inputCls, mutedCls } from '../lib/ui.js';

export function FieldsManager({ fields, onAdd, onDelete, onClose }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('text');
  const typeLabel = (t) => CUSTOM_FIELD_TYPES.find((x) => x.value === t)?.label ?? 'Choice';

  const submit = (e) => {
    e.preventDefault();
    if (!label.trim()) return;
    onAdd(label.trim(), type);
    setLabel('');
  };

  return (
    <Modal title="Fields" onClose={onClose}>
      <ModalBody>
        <form onSubmit={submit} className="mb-6 flex flex-col gap-2 sm:flex-row">
          <input
            className={inputCls}
            placeholder="New field, e.g. Balcony"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            aria-label="New field name"
          />
          <select className={`${inputCls} sm:w-36`} value={type} onChange={(e) => setType(e.target.value)} aria-label="Field type">
            {CUSTOM_FIELD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button type="submit" className={`${btnPrimary} !py-2.5`}>
            <Plus size={18} /> Add
          </button>
        </form>

        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-900">
          {fields.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{f.label}</div>
                <div className={`text-xs ${mutedCls}`}>{typeLabel(f.type)}</div>
              </div>
              {f.builtin ? (
                <span title="Built-in field" className="p-2 text-stone-400"><Lock size={16} /></span>
              ) : (
                <button
                  type="button"
                  aria-label={`Delete ${f.label}`}
                  onClick={() => onDelete(f)}
                  className="rounded-full p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  );
}
