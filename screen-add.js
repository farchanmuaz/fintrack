// Add Expense sheet — numpad-driven flow
const { useState: useStateA } = React;

function AddSheet({ onClose, onSave }) {
  // IDR has no decimals — store amount as a digit-string of whole rupiahs
  const [amount, setAmount] = useStateA('0');
  const [category, setCategory] = useStateA('food');
  const [merchant, setMerchant] = useStateA('');
  const [date, setDate] = useStateA(ymd(new Date()));

  const numericAmount = parseInt(amount, 10) || 0;
  const display = parseInt(amount || '0', 10).toLocaleString('id-ID');

  const press = (k) => {
    if (k === '⌫') {
      setAmount(a => a.length <= 1 ? '0' : a.slice(0, -1));
      return;
    }
    if (k === '000') {
      if (amount === '0') return;
      if (amount.length + 3 > 12) return;
      setAmount(a => a + '000');
      return;
    }
    if (amount.length >= 12) return;
    setAmount(a => a === '0' ? k : a + k);
  };

  const canSave = numericAmount > 0;
  const handleSave = () => {
    if (!canSave) return;
    onSave({
      amount: numericAmount,
      category,
      merchant: merchant.trim() || CATS[category].label,
      date,
    });
  };

  const dateLabel = (() => {
    const today = ymd(new Date());
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (date === today) return 'Today';
    if (date === ymd(y)) return 'Yesterday';
    return new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  })();

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet slide-up">
        <div className="sheet-handle" />
        {/* header */}
        <div className="spread" style={{ padding: '8px 20px 12px' }}>
          <button onClick={onClose} style={{ fontSize: 22, color: 'var(--ink-2)', padding: 4, marginLeft: -4 }}>×</button>
          <div style={{ fontWeight: 700, fontSize: 16 }}>New expense</div>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              padding: '8px 14px', borderRadius: 999,
              fontSize: 14, fontWeight: 700,
              background: canSave ? 'var(--brand)' : 'var(--surface-2)',
              color: canSave ? '#fff' : 'var(--ink-3)',
            }}
          >Save</button>
        </div>

        {/* amount */}
        <div style={{ padding: '8px 24px 4px', textAlign: 'center' }}>
          <div className="faint" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>
            Amount
          </div>
          <div className="tight" style={{
            fontSize: 52, fontWeight: 700, lineHeight: 1.1,
            letterSpacing: '-0.04em',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            marginTop: 2,
          }}>
            <span style={{ fontSize: 26, marginTop: 12, color: 'var(--ink-2)', fontWeight: 600, marginRight: 4 }}>Rp</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{display}</span>
            <span style={{
              width: 3, height: 40, background: 'var(--brand)',
              marginLeft: 4, marginTop: 12,
              animation: 'blink 1s infinite',
              borderRadius: 2,
            }} />
          </div>
        </div>

        {/* category chips */}
        <div style={{ padding: '12px 16px 4px' }}>
          <div className="faint" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', padding: '0 8px 8px' }}>
            Category
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 8px 4px', scrollbarWidth: 'none' }}>
            {Object.values(CATS).map(c => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    borderRadius: 999,
                    background: active ? c.color : 'var(--surface-2)',
                    color: active ? '#fff' : 'var(--ink)',
                    fontWeight: 600, fontSize: 13,
                    border: '1px solid ' + (active ? 'transparent' : 'var(--line)'),
                    transition: 'background .15s',
                  }}
                >
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: active ? '#fff' : c.color,
                  }} />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* note + date */}
        <div style={{ padding: '12px 24px 4px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="row" style={{ gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <span className="faint" style={{ fontSize: 13, width: 56, fontWeight: 500 }}>Note</span>
            <input
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              placeholder={`e.g. ${CATS[category].label} expense`}
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', color: 'var(--ink)',
                fontSize: 14, fontWeight: 500,
              }}
            />
          </div>
          <div className="row" style={{ gap: 12, padding: '10px 0' }}>
            <span className="faint" style={{ fontSize: 13, width: 56, fontWeight: 500 }}>Date</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{dateLabel}</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {(() => {
                const opts = [];
                for (let i = 0; i < 3; i++) {
                  const d = new Date(); d.setDate(d.getDate() - i);
                  opts.push({ iso: ymd(d), label: i === 0 ? 'Today' : i === 1 ? 'Yest' : d.toLocaleDateString('en-US', { weekday: 'short' }) });
                }
                return opts.map(o => (
                  <button
                    key={o.iso}
                    onClick={() => setDate(o.iso)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 12, fontWeight: 600,
                      background: date === o.iso ? 'var(--ink)' : 'var(--surface-2)',
                      color: date === o.iso ? 'var(--bg)' : 'var(--ink-2)',
                      border: '1px solid var(--line)',
                    }}
                  >{o.label}</button>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* numpad */}
        <div style={{ padding: '8px 16px 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {['1','2','3','4','5','6','7','8','9','000','0','⌫'].map((k) => (
              <button
                key={k}
                onClick={() => press(k)}
                style={{
                  padding: '14px 0',
                  fontSize: 24, fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  background: 'var(--surface)',
                  borderRadius: 14,
                  color: 'var(--ink)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--line)',
                  height: 52,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >{k}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// Day detail sheet — opens when tapping a heatmap cell
function DaySheet({ day, currentMonth, expenses, onClose }) {
  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
  const iso = ymd(date);
  const dayExp = expenses.filter(e => e.date === iso).sort((a, b) => b.id - a.id);
  const total = dayExp.reduce((s, e) => s + e.amount, 0);
  const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet slide-up" style={{ maxHeight: '70%' }}>
        <div className="sheet-handle" />
        <div style={{ padding: '8px 24px 0' }}>
          <div className="spread">
            <div>
              <div className="faint" style={{ fontSize: 12, fontWeight: 600 }}>{dateLabel}</div>
              <div className="tight" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', marginTop: 2 }}>
                {fmtMoney(total)}
              </div>
              <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>
                {dayExp.length} {dayExp.length === 1 ? 'expense' : 'expenses'}
              </div>
            </div>
            <button onClick={onClose} style={{ fontSize: 22, color: 'var(--ink-2)', padding: 4 }}>×</button>
          </div>
        </div>
        <div style={{ padding: '12px 24px 24px', overflowY: 'auto' }}>
          {dayExp.length === 0 ? (
            <div className="faint" style={{ padding: '32px 0', fontSize: 14, textAlign: 'center' }}>
              No expenses on this day
            </div>
          ) : (
            <div>
              {dayExp.map((e, i) => (
                <div key={e.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <ExpenseRow exp={e} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Expenses list screen
function ListScreen({ expenses }) {
  const groups = {};
  [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id).forEach(e => {
    (groups[e.date] = groups[e.date] || []).push(e);
  });
  const dates = Object.keys(groups);

  return (
    <div className="scroll" style={{ padding: '0 0 12px' }}>
      <div style={{ padding: '8px 24px 16px' }}>
        <div className="faint" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>All expenses</div>
        <h1 className="serif" style={{ margin: '2px 0 0', fontSize: 28, fontWeight: 400, fontStyle: 'italic' }}>Everything</h1>
      </div>
      <div style={{ padding: '0 16px' }}>
        {dates.length === 0 && (
          <div className="faint" style={{ padding: '40px 0', fontSize: 13, textAlign: 'center' }}>
            No expenses yet
          </div>
        )}
        {dates.map(d => {
          const sum = groups[d].reduce((s, e) => s + e.amount, 0);
          return (
            <div key={d} style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="spread" style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(d)}</span>
                <span className="faint" style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(sum)}</span>
              </div>
              {groups[d].map((e, i) => (
                <div key={e.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line)' }}>
                  <ExpenseRow exp={e} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Stub screens
function StubScreen({ title }) {
  return (
    <div className="scroll" style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
      <div className="faint" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' }}>Coming soon</div>
      <h1 className="serif" style={{ margin: '6px 0 12px', fontSize: 28, fontWeight: 400, fontStyle: 'italic' }}>{title}</h1>
      <div className="faint" style={{ fontSize: 13, maxWidth: 240 }}>
        We're focused on the home & add-expense flow for now. This screen comes next.
      </div>
    </div>
  );
}

Object.assign(window, { AddSheet, DaySheet, ListScreen, StubScreen });
