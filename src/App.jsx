import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Download, GitCompareArrows, Moon, Plus, SlidersHorizontal, Sun, Upload } from 'lucide-react';
import { ApartmentCard } from './components/ApartmentCard.jsx';
import { ApartmentForm } from './components/ApartmentForm.jsx';
import { CompareTable } from './components/CompareTable.jsx';
import { DetailView } from './components/DetailView.jsx';
import { FieldsManager } from './components/FieldsManager.jsx';
import { exportJson, load, normalize, save } from './lib/storage.js';
import { newId } from './lib/fields.js';
import { monthlyCost } from './lib/calc.js';
import { money, moneyRange } from './lib/format.js';
import { btnPrimary, btnSecondary, cardCls, mutedCls } from './lib/ui.js';

const MAX_COMPARE = 4;

// dir is the natural direction for each sort; users can flip it.
const SORTS = {
  tour: { label: 'Tour time', dir: 'asc', get: (a) => (a.tourDate ? `${a.tourDate}T${a.tourTime}` : null) },
  rent: { label: 'Rent', dir: 'asc', get: (a) => a.rent },
  cost: { label: 'Total monthly cost', dir: 'asc', get: monthlyCost },
  rating: { label: 'Rating', dir: 'desc', get: (a) => a.features.overall || null },
  name: { label: 'Name', dir: 'asc', get: (a) => a.name.toLowerCase() },
};

function sortApartments(list, key, dir) {
  const { get } = SORTS[key];
  const sign = dir === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const x = get(a);
    const y = get(b);
    if (x == null && y == null) return 0;
    if (x == null) return 1; // missing values always last
    if (y == null) return -1;
    return (x < y ? -1 : x > y ? 1 : 0) * sign;
  });
}

function useTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try { localStorage.setItem('apartment-hunt:theme', dark ? 'dark' : 'light'); } catch { /* ignore */ }
  }, [dark]);
  return [dark, () => setDark((d) => !d)];
}

function Stat({ label, value }) {
  return (
    <div className={`${cardCls} px-4 py-3`}>
      <div className={`text-xs font-semibold uppercase tracking-wide ${mutedCls}`}>{label}</div>
      <div className="mt-0.5 text-lg font-extrabold leading-snug sm:text-xl">{value}</div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(load);
  const { apartments, fields } = data;
  useEffect(() => save(data), [data]);

  const [dark, toggleTheme] = useTheme();
  const [sortKey, setSortKey] = useState('tour');
  const [sortDir, setSortDir] = useState('asc');
  const [compareIds, setCompareIds] = useState([]);
  const [editing, setEditing] = useState(null); // null | 'new' | apartment id
  const [detailId, setDetailId] = useState(null);
  const [showFields, setShowFields] = useState(false);
  const fileRef = useRef(null);

  const sorted = useMemo(() => sortApartments(apartments, sortKey, sortDir), [apartments, sortKey, sortDir]);
  const compared = compareIds.map((id) => apartments.find((a) => a.id === id)).filter(Boolean);
  const detailApt = apartments.find((a) => a.id === detailId);
  const editingApt = editing && editing !== 'new' ? apartments.find((a) => a.id === editing) : null;
  const hasSeed = apartments.some((a) => a.isSeed);

  const ratings = apartments.map((a) => a.features.overall).filter(Boolean);
  const avgRating = ratings.length ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1) : null;

  // ---- mutations ----
  const upsert = (apt) =>
    setData((d) => ({
      ...d,
      apartments: d.apartments.some((a) => a.id === apt.id)
        ? d.apartments.map((a) => (a.id === apt.id ? apt : a))
        : [...d.apartments, apt],
    }));

  const saveFromForm = (apt) => {
    upsert(apt);
    setEditing(null);
  };

  const removeApartments = (ids) => {
    setData((d) => ({ ...d, apartments: d.apartments.filter((a) => !ids.includes(a.id)) }));
    setCompareIds((c) => c.filter((id) => !ids.includes(id)));
    if (ids.includes(detailId)) setDetailId(null);
  };

  const deleteApartment = (apt) => {
    if (window.confirm(`Delete “${apt.name}”?`)) removeApartments([apt.id]);
  };

  const toggleCompare = (id) =>
    setCompareIds((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX_COMPARE ? [...c, id] : c));

  const addField = (label, type) =>
    setData((d) => ({ ...d, fields: [...d.fields, { id: `custom_${newId()}`, label, type }] }));

  const deleteField = (field) => {
    if (!window.confirm(`Delete the “${field.label}” field? Its values are removed from all apartments.`)) return;
    setData((d) => ({
      fields: d.fields.filter((f) => f.id !== field.id),
      apartments: d.apartments.map((a) => {
        const { [field.id]: _removed, ...features } = a.features;
        return { ...a, features };
      }),
    }));
  };

  const importFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const next = normalize(JSON.parse(await file.text()));
      if (!window.confirm(`Replace everything with ${next.apartments.length} apartment(s) from “${file.name}”? This overwrites your current data.`)) return;
      setData(next);
      setCompareIds([]);
      setDetailId(null);
    } catch (err) {
      window.alert(`Couldn't import that file. ${err.message}`);
    }
  };

  const changeSort = (key) => {
    setSortKey(key);
    setSortDir(SORTS[key].dir);
  };

  const addButton = (
    <button type="button" onClick={() => setEditing('new')} className={`${btnPrimary} text-lg`}>
      <Plus size={22} strokeWidth={3} /> Add Apartment
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-10">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Apartment Hunt</h1>
          <p className={`mt-1 ${mutedCls}`}>Tour it. Rate it. Compare it.</p>
        </div>
        <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode" className={`${btnSecondary} !rounded-full !p-2.5`}>
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {apartments.length === 0 ? (
        <div className={`${cardCls} flex flex-col items-center px-6 py-16 text-center`}>
          <div className="mb-3 text-5xl" aria-hidden>🏠</div>
          <h2 className="text-2xl font-bold">No apartments yet</h2>
          <p className={`mb-6 mt-1 ${mutedCls}`}>Add your first apartment to start comparing.</p>
          {addButton}
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Apartments" value={apartments.length} />
            <Stat label="Rent range" value={moneyRange(apartments.map((a) => a.rent))} />
            <Stat label="Avg rating" value={avgRating ? <><span className="text-amber-500">★</span> {avgRating}<span className={`text-sm font-medium ${mutedCls}`}> / 5</span></> : '—'} />
            <Stat label="Monthly cost range" value={moneyRange(apartments.map(monthlyCost))} />
          </div>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {addButton}
            <div className="flex items-center gap-2">
              <label className={`text-sm ${mutedCls}`} htmlFor="sort">Sort by</label>
              <select
                id="sort"
                value={sortKey}
                onChange={(e) => changeSort(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm font-medium dark:border-stone-700 dark:bg-stone-900 sm:flex-none"
              >
                {Object.entries(SORTS).map(([k, s]) => (
                  <option key={k} value={k}>{s.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                aria-label={sortDir === 'asc' ? 'Ascending — tap to reverse' : 'Descending — tap to reverse'}
                className={`${btnSecondary} !p-2.5`}
              >
                {sortDir === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
              </button>
            </div>
          </div>

          {hasSeed && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-dashed border-amber-400 bg-amber-50 px-4 py-3 text-sm dark:border-amber-700 dark:bg-amber-950/30">
              <span>👋 <strong>The Alpine</strong> is example data so you can see how things work.</span>
              <button
                type="button"
                onClick={() => removeApartments(apartments.filter((a) => a.isSeed).map((a) => a.id))}
                className="font-semibold text-red-600 hover:underline dark:text-red-400"
              >
                Remove example
              </button>
            </div>
          )}

          {compared.length > 0 && (
            <div className="mb-5">
              <CompareTable
                apartments={compared}
                fields={fields}
                onRemove={toggleCompare}
                onClear={() => setCompareIds([])}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((a) => (
              <ApartmentCard
                key={a.id}
                apt={a}
                fields={fields}
                selected={compareIds.includes(a.id)}
                compareFull={compareIds.length >= MAX_COMPARE}
                onToggleCompare={() => toggleCompare(a.id)}
                onOpen={() => setDetailId(a.id)}
                onEdit={() => setEditing(a.id)}
                onDelete={() => deleteApartment(a)}
              />
            ))}
          </div>
        </>
      )}

      <footer className="mt-10 flex flex-wrap items-center gap-2 border-t border-stone-200 pt-5 dark:border-stone-800">
        <button type="button" onClick={() => exportJson(data)} className={btnSecondary}><Download size={15} /> Export Data</button>
        <button type="button" onClick={() => fileRef.current?.click()} className={btnSecondary}><Upload size={15} /> Import Data</button>
        <button type="button" onClick={() => setShowFields(true)} className={btnSecondary}><SlidersHorizontal size={15} /> Manage Fields</button>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={importFile} />
        <span className={`w-full text-xs ${mutedCls} sm:ml-auto sm:w-auto`}>Saved in this browser only — export a backup now and then.</span>
      </footer>

      {compared.length > 0 && (
        <a
          href="#compare"
          className="fixed bottom-5 left-1/2 z-30 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white shadow-lg md:hidden dark:bg-stone-100 dark:text-stone-900"
        >
          <GitCompareArrows size={16} /> Compare ({compared.length})
        </a>
      )}

      {detailApt && (
        <DetailView
          key={detailApt.id}
          apt={detailApt}
          fields={fields}
          onUpdate={upsert}
          onEdit={() => setEditing(detailApt.id)}
          onDelete={() => deleteApartment(detailApt)}
          onClose={() => setDetailId(null)}
        />
      )}
      {editing && (editing === 'new' || editingApt) && (
        <ApartmentForm
          key={editing}
          initial={editingApt}
          fields={fields}
          onSave={saveFromForm}
          onClose={() => setEditing(null)}
          onManageFields={() => setShowFields(true)}
        />
      )}
      {showFields && <FieldsManager fields={fields} onAdd={addField} onDelete={deleteField} onClose={() => setShowFields(false)} />}
    </div>
  );
}
