// fintrack hi-fi prototype — shared components & data
const { useState, useEffect, useMemo, useRef } = React;

// ── data ────────────────────────────────────────────────────────
const CATS = {
  food:      { id: 'food',      label: 'Food',       color: 'var(--c-food)',      glyph: 'F' },
  transport: { id: 'transport', label: 'Transport',  color: 'var(--c-transport)', glyph: 'T' },
  bills:     { id: 'bills',     label: 'Bills',      color: 'var(--c-bills)',     glyph: 'B' },
  fun:       { id: 'fun',       label: 'Fun',        color: 'var(--c-fun)',       glyph: 'P' },
  shopping:  { id: 'shopping',  label: 'Shopping',   color: 'var(--c-shopping)',  glyph: 'S' },
  health:    { id: 'health',    label: 'Health',     color: 'var(--c-health)',    glyph: 'H' },
  home:      { id: 'home',      label: 'Home',       color: 'var(--c-home)',      glyph: 'H' },
  other:     { id: 'other',     label: 'Other',      color: 'var(--c-other)',     glyph: '·' },
};

function fmtMoney(n) {
  // IDR — no decimals, dot thousands separator (id-ID)
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function fmtMoneyShort(n) {
  // compact: Rp45rb (ribu = thousand), Rp1,2jt (juta = million)
  if (n >= 1_000_000) return 'Rp' + (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace('.', ',') + 'jt';
  if (n >= 1_000)     return 'Rp' + Math.round(n / 1_000) + 'rb';
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  const today = new Date();
  const todayY = ymd(today);
  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  if (iso === todayY) return 'Today';
  if (iso === ymd(yest)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// build seed data — the current month, with realistic-ish IDR spending
function buildSeed() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const items = [];
  let id = 1;

  const choose = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // IDR amounts: round to nearest 500
  const rand = (min, max) => Math.round((min + Math.random() * (max - min)) / 500) * 500;

  for (let day = 1; day <= today; day++) {
    const date = new Date(year, month, day);
    const iso = ymd(date);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const n = Math.floor(Math.random() * (isWeekend ? 5 : 4));
    for (let i = 0; i < n; i++) {
      const cat = choose(['food','food','food','transport','bills','fun','shopping','health']);
      const merchants = {
        food:      [['Kopi Kenangan', 18000, 32000], ['Warung Padang', 25000, 55000], ['GoFood', 35000, 95000], ['Indomaret', 15000, 75000], ['Starbucks', 45000, 75000]],
        transport: [['Gojek', 12000, 35000], ['Grab', 15000, 45000], ['TransJakarta', 3500, 3500], ['Pertamina', 50000, 200000], ['Bluebird', 25000, 80000]],
        bills:     [['PLN listrik', 250000, 600000], ['PDAM air', 80000, 180000], ['Telkomsel', 100000, 200000], ['IndiHome', 350000, 450000]],
        fun:       [['Spotify', 54990, 54990], ['Netflix', 65000, 65000], ['CGV', 50000, 100000], ['Steam', 50000, 500000]],
        shopping:  [['Tokopedia', 50000, 500000], ['Shopee', 35000, 350000], ['Uniqlo', 199000, 599000]],
        health:    [['Kimia Farma', 25000, 150000], ['Gym', 350000, 350000]],
      };
      const m = choose(merchants[cat] || merchants.food);
      const amount = rand(m[1], m[2]);
      items.push({ id: id++, date: iso, amount, category: cat, merchant: m[0] });
    }
  }
  return items;
}

// ── bits ────────────────────────────────────────────────────────
function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="right">
        {/* signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5"/>
          <rect x="5" y="6" width="3" height="6" rx="0.5"/>
          <rect x="10" y="3" width="3" height="9" rx="0.5"/>
          <rect x="15" y="0" width="3" height="12" rx="0.5"/>
        </svg>
        {/* wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 3.5C10.5 3.5 12.7 4.4 14.4 6L13.2 7.2C11.8 5.9 10 5.1 8 5.1C6 5.1 4.2 5.9 2.8 7.2L1.6 6C3.3 4.4 5.5 3.5 8 3.5Z"/>
          <path d="M8 7C9.4 7 10.7 7.6 11.6 8.5L10.4 9.7C9.8 9 8.9 8.6 8 8.6C7.1 8.6 6.2 9 5.6 9.7L4.4 8.5C5.3 7.6 6.6 7 8 7Z"/>
          <circle cx="8" cy="11" r="1.4"/>
        </svg>
        {/* battery */}
        <svg width="26" height="12" viewBox="0 0 26 12">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.4"/>
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill="currentColor"/>
          <path d="M24 4v4c0.7-0.3 1.2-1 1.2-2c0-1-0.5-1.7-1.2-2z" fill="currentColor" fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

function TabBar({ active, onChange, onAdd }) {
  const tabs = [
    { k: 'home', label: 'Home', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-8 9 8M5 10v10h14V10"/>
      </svg>
    ) },
    { k: 'list', label: 'Expenses', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h10"/>
      </svg>
    ) },
    { k: 'add',  label: '',     icon: null },
    { k: 'stats',label: 'Stats', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>
      </svg>
    ) },
    { k: 'me',   label: 'Me', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/>
      </svg>
    ) },
  ];
  return (
    <div className="tab-bar">
      {tabs.map(t => {
        if (t.k === 'add') {
          return (
            <button key={t.k} className="tab add" onClick={onAdd} aria-label="Add expense">
              <span className="add-dot">＋</span>
            </button>
          );
        }
        return (
          <button key={t.k} className={`tab${active === t.k ? ' active' : ''}`} onClick={() => onChange(t.k)}>
            {t.icon}
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CategoryIcon({ cat, size = 36 }) {
  const c = CATS[cat] || CATS.other;
  const glyphs = {
    food: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v9a3 3 0 003 3v8M9 14a3 3 0 003-3V2M18 2c-2 0-3 4-3 7s1 5 3 5v8"/></svg>,
    transport: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="6" width="16" height="11" rx="3"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/><path d="M4 11h16"/></svg>,
    bills: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 11h18M7 15h4"/></svg>,
    fun: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>,
    shopping: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h14l-1 13H6L5 7z"/><path d="M9 7V5a3 3 0 016 0v2"/></svg>,
    health: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 11c0 5.5-7 10-7 10z"/></svg>,
    home: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>,
    other: <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>,
  };
  return (
    <div style={{
      width: size, height: size, borderRadius: '30%',
      background: c.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ width: size * 0.6, height: size * 0.6 }}>{glyphs[cat] || glyphs.other}</div>
    </div>
  );
}

function ExpenseRow({ exp, animate = false }) {
  const c = CATS[exp.category] || CATS.other;
  return (
    <div className={`row${animate ? ' count-up' : ''}`} style={{ gap: 12, padding: '12px 0' }}>
      <CategoryIcon cat={exp.category} size={40} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15 }}>{exp.merchant}</div>
        <div className="faint" style={{ fontSize: 12, marginTop: 1 }}>{c.label}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>
        −{fmtMoney(exp.amount)}
      </div>
    </div>
  );
}

Object.assign(window, {
  CATS, fmtMoney, fmtMoneyShort, ymd, formatDate, buildSeed,
  StatusBar, TabBar, CategoryIcon, ExpenseRow,
});
