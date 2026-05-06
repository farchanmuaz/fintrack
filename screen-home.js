// Heatmap dashboard screen
const { useState: useState2, useMemo: useMemo2, useEffect: useEffect2 } = React;

function HomeScreen({ expenses, currentMonth, onChangeMonth, onSelectDay, recentlyAddedId }) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay(); // 0 = Sun
  // shift to Mon-first: 0 = Mon … 6 = Sun
  const leading = (firstDow + 6) % 7;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  // aggregate by day
  const byDay = useMemo2(() => {
    const m = {};
    for (const e of expenses) {
      const d = new Date(e.date + 'T12:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        const k = d.getDate();
        m[k] = (m[k] || 0) + e.amount;
      }
    }
    return m;
  }, [expenses, year, month]);

  const totalSpent = useMemo2(
    () => Object.values(byDay).reduce((s, v) => s + v, 0),
    [byDay]
  );
  const daysWithSpend = Object.keys(byDay).length;
  const avgPerDay = daysWithSpend ? totalSpent / daysWithSpend : 0;
  const maxDay = Math.max(...Object.values(byDay), 1);

  // top categories
  const topCats = useMemo2(() => {
    const m = {};
    for (const e of expenses) {
      const d = new Date(e.date + 'T12:00:00');
      if (d.getFullYear() === year && d.getMonth() === month) {
        m[e.category] = (m[e.category] || 0) + e.amount;
      }
    }
    return Object.entries(m).sort((a,b) => b[1] - a[1]).slice(0, 3);
  }, [expenses, year, month]);

  // build cells
  const cells = [];
  for (let i = 0; i < leading; i++) cells.push({ blank: true, key: `lead-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, key: `d-${d}` });
  }
  while (cells.length % 7 !== 0) cells.push({ blank: true, key: `tr-${cells.length}` });

  const recentExp = useMemo2(
    () => [...expenses].sort((a, b) => b.id - a.id).slice(0, 6),
    [expenses]
  );

  const recentExpObj = useMemo2(
    () => expenses.find(e => e.id === recentlyAddedId),
    [expenses, recentlyAddedId]
  );
  const recentDay = recentExpObj ? new Date(recentExpObj.date + 'T12:00:00').getDate() : null;

  const intensity = (amt) => {
    if (!amt) return 0;
    const r = amt / maxDay;
    if (r < 0.15) return 1;
    if (r < 0.35) return 2;
    if (r < 0.6)  return 3;
    return 4;
  };

  const heatColor = (level) => {
    if (level === 0) return 'var(--surface-2)';
    const opacities = [0, 0.15, 0.35, 0.6, 0.95];
    return `color-mix(in oklab, var(--brand) ${opacities[level] * 100}%, var(--surface-2))`;
  };

  return (
    <div className="scroll" style={{ padding: '0 0 12px' }}>
      {/* header */}
      <div style={{ padding: '4px 24px 8px' }}>
        <div className="spread" style={{ marginBottom: 4 }}>
          <button
            onClick={() => onChangeMonth(-1)}
            style={{ padding: 8, marginLeft: -8, color: 'var(--ink-2)' }}
            aria-label="Previous month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ textAlign: 'center' }}>
            <div className="faint" style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              {year}
            </div>
            <h1 className="serif" style={{ margin: 0, fontSize: 28, fontWeight: 400, fontStyle: 'italic' }}>{monthName}</h1>
          </div>
          <button
            onClick={() => onChangeMonth(1)}
            disabled={isCurrentMonth}
            style={{ padding: 8, marginRight: -8, color: isCurrentMonth ? 'var(--ink-3)' : 'var(--ink-2)' }}
            aria-label="Next month"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>

      {/* total */}
      <div style={{ padding: '4px 24px 16px', textAlign: 'center' }}>
        <div className="tight" style={{ fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em' }}>
          {fmtMoney(totalSpent)}
        </div>
        <div className="faint" style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>
          spent · avg <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{fmtMoney(avgPerDay)}/day</span>
        </div>
      </div>

      {/* heatmap card */}
      <div style={{ margin: '0 16px 16px', padding: 18, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
        {/* dow header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="faint" style={{ fontSize: 11, fontWeight: 600, textAlign: 'center' }}>{d}</div>
          ))}
        </div>
        {/* cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map(c => {
            if (c.blank) return <div key={c.key} style={{ aspectRatio: '1' }} />;
            const amt = byDay[c.day] || 0;
            const lvl = intensity(amt);
            const isToday = c.day === todayDate;
            const isFuture = isCurrentMonth && c.day > todayDate;
            const isRecent = c.day === recentDay;
            return (
              <button
                key={c.key}
                onClick={() => onSelectDay && onSelectDay(c.day)}
                disabled={isFuture}
                className={isRecent ? 'flash' : ''}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: heatColor(lvl),
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  border: isToday ? '2px solid var(--ink)' : '1px solid transparent',
                  opacity: isFuture ? 0.3 : 1,
                  color: lvl >= 3 ? '#fff' : 'var(--ink)',
                  fontSize: 13,
                  fontWeight: lvl >= 1 ? 600 : 500,
                  transition: 'transform .1s',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600 }}>{c.day}</span>
                {amt > 0 && (
                  <span style={{ fontSize: 9, opacity: 0.85, marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {fmtMoneyShort(amt)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* legend */}
        <div className="row" style={{ justifyContent: 'flex-end', gap: 4, marginTop: 12, fontSize: 10, color: 'var(--ink-3)' }}>
          <span>less</span>
          {[0,1,2,3,4].map(l => (
            <span key={l} style={{ width: 12, height: 12, borderRadius: 3, background: heatColor(l), border: '1px solid var(--line)' }} />
          ))}
          <span>more</span>
        </div>
      </div>

      {/* top categories card */}
      {topCats.length > 0 && (
        <div style={{ margin: '0 16px 16px', padding: 18, background: 'var(--surface)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="spread" style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Top categories</div>
            <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{monthName}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topCats.map(([catId, amt]) => {
              const cat = CATS[catId];
              const pct = (amt / totalSpent) * 100;
              return (
                <div key={catId}>
                  <div className="spread" style={{ marginBottom: 5 }}>
                    <div className="row" style={{ gap: 8 }}>
                      <CategoryIcon cat={catId} size={26} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(amt)}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: cat.color, borderRadius: 999, transition: 'width .5s ease-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* recent expenses */}
      <div style={{ margin: '0 16px', padding: '0 6px' }}>
        <div className="spread" style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-2)', textTransform: 'uppercase' }}>Recent</div>
          <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{expenses.length} this month</span>
        </div>
        {recentExp.length === 0 ? (
          <div className="faint" style={{ padding: '20px 0', fontSize: 13, textAlign: 'center' }}>
            No expenses yet — tap ＋ to add one
          </div>
        ) : (
          <div>
            {recentExp.map((e) => (
              <div key={e.id} style={{ borderTop: '1px solid var(--line)' }}>
                <ExpenseRow exp={e} animate={e.id === recentlyAddedId} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen });
