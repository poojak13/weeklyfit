import { useState, useEffect, useCallback } from 'react'
import { T, MODALITIES, MODALITY_COLOR, ETH_STAPLES, ALLERGIES, AVOIDS, GUIDED, QUICK_STORES, DAY_FULL, DAYS_SHORT, DEFAULT_PROFILE } from './data.js'
import { loadData, saveData, clearAll, loadApiKey, saveApiKey, loadApiProvider, saveApiProvider } from './storage.js'
import { generatePlan, formatPlanText, formatGroceryText } from './generate.js'
import { s, chip } from './theme.js'

function Chip({ on, onClick, children }) {
  return <button style={chip(on)} onClick={onClick}>{children}</button>
}

function Badge({ color, children }) {
  return <span style={{ fontSize: 11, fontWeight: 700, background: color, color: '#fff', padding: '2px 8px', borderRadius: 99, marginLeft: 4 }}>{children}</span>
}

function SlotRow({ color, emoji, label, children }) {
  return (
    <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 10, marginBottom: 10 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: color === T.green ? T.green : T.sub, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
        {emoji} {label}
      </div>
      {children}
    </div>
  )
}

// ── ONBOARDING ────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [p, setP] = useState({ ...DEFAULT_PROFILE })
  const [storeIn, setStoreIn] = useState('')
  const [stapleIn, setStapleIn] = useState('')

  const up = patch => setP(prev => ({ ...prev, ...patch }))

  const toggleEth = e => {
    setP(prev => {
      const next = prev.ethnicities.includes(e) ? prev.ethnicities.filter(x => x !== e) : [...prev.ethnicities, e]
      const st = [...new Set(next.flatMap(x => ETH_STAPLES[x] || []))]
      return { ...prev, ethnicities: next, staples: st }
    })
  }

  const toggle = (field, val) => {
    setP(prev => {
      const cur = prev[field] || []
      return { ...prev, [field]: cur.includes(val) ? cur.filter(x => x !== val) : [...cur, val] }
    })
  }

  const setMeals = n => {
    const slots = n === 1 ? ['dinner'] : n === 2 ? ['lunch','dinner'] : ['breakfast','lunch','dinner']
    up({ mealsPerDay: n, mealSlots: slots })
  }

  const steps = [
    {
      title: 'Your background & diet',
      body: (
        <div style={s.grid(16)}>
          <div>
            <span style={s.lbl}>Cuisine backgrounds</span>
            <p style={{ color: T.sub, fontSize: 13, marginBottom: 10 }}>Your meals will be based on these. East Asian = stir fries/miso/tofu. Indian = dal/rice/idli/upma.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {Object.keys(ETH_STAPLES).map(e => <Chip key={e} on={p.ethnicities.includes(e)} onClick={() => toggleEth(e)}>{e}</Chip>)}
            </div>
          </div>
          <div>
            <span style={s.lbl}>Diet type</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {['No restriction','Vegetarian','Vegan','Eggetarian','Pescatarian','Halal','Kosher'].map(d => <Chip key={d} on={p.diet === d} onClick={() => up({ diet: d })}>{d}</Chip>)}
            </div>
          </div>
          <div>
            <span style={s.lbl}>Allergies</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {ALLERGIES.map(a => <Chip key={a} on={(p.allergies||[]).includes(a)} onClick={() => toggle('allergies', a)}>{a}</Chip>)}
            </div>
          </div>
          <div>
            <span style={s.lbl}>Foods you avoid</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
              {AVOIDS.map(a => <Chip key={a} on={(p.avoids||[]).includes(a)} onClick={() => toggle('avoids', a)}>{a}</Chip>)}
            </div>
            <input style={s.inp} placeholder="Anything else? e.g. jackfruit, tofu…" value={p.customAvoid||''} onChange={e => up({ customAvoid: e.target.value })} />
          </div>
        </div>
      )
    },
    {
      title: 'Goal & body',
      body: (
        <div style={s.grid(14)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={s.lbl}>Current weight (kg)</span>
              <input style={s.inp} inputMode="decimal" placeholder="e.g. 78" value={p.startWeight||''} onChange={e => up({ startWeight: e.target.value })} />
            </div>
            <div>
              <span style={s.lbl}>Height (cm)</span>
              <input style={s.inp} inputMode="decimal" placeholder="e.g. 172" value={p.heightCm||''} onChange={e => up({ heightCm: e.target.value })} />
            </div>
          </div>
          <div>
            <span style={s.lbl}>Weight loss goal</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Lose</span>
              <input style={{ ...s.inp, width: 70 }} inputMode="decimal" value={p.goalKg||''} onChange={e => up({ goalKg: e.target.value })} />
              <span>kg in</span>
              <input style={{ ...s.inp, width: 60 }} inputMode="numeric" value={p.goalMonths||''} onChange={e => up({ goalMonths: e.target.value })} />
              <span>months</span>
            </div>
          </div>
          <div style={{ ...s.card, background: T.citrusSoft, borderColor: '#EAD9A8' }}>
            <div style={{ fontWeight: 700 }}>👣 Daily step goal</div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 4 }}>10,000 steps/day</div>
            <div style={{ color: T.sub, fontSize: 13 }}>Evidence-based daily target. Combined with workouts keeps you on track.</div>
          </div>
        </div>
      )
    },
    {
      title: 'How many meals planned?',
      body: (
        <div style={s.grid(10)}>
          <p style={{ color: T.sub, fontSize: 14 }}>Each planned meal hits your protein target — fewer meals just means each works harder.</p>
          {[
            { n: 1, l: '1 meal — Dinner only', d: 'You handle breakfast and lunch. We plan one solid dinner each night.' },
            { n: 2, l: '2 meals — Lunch + Dinner', d: "Lunch = yesterday's dinner leftovers (zero extra cooking). Fresh dinner each night." },
            { n: 3, l: '3 meals — All three', d: 'Quick 10-min breakfast. Lunch = leftovers. Full coverage.' },
          ].map(opt => (
            <label key={opt.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer', ...s.card, borderColor: p.mealsPerDay === opt.n ? T.green : T.line }}>
              <input type="radio" checked={p.mealsPerDay === opt.n} onChange={() => setMeals(opt.n)} style={{ marginTop: 3, accentColor: T.green }} />
              <div><div style={{ fontWeight: 700 }}>{opt.l}</div><div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>{opt.d}</div></div>
            </label>
          ))}
          <div>
            <span style={s.lbl}>Snack preference</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {['store-bought','homemade','either'].map(opt => (
                <Chip key={opt} on={p.snackPref === opt} onClick={() => up({ snackPref: opt })}>{opt.charAt(0).toUpperCase()+opt.slice(1)}</Chip>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Where do you shop?',
      body: (
        <div style={s.grid(12)}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {(p.stores||[]).map(st => <Chip key={st} on onClick={() => up({ stores: (p.stores||[]).filter(x => x !== st) })}>{st} ✕</Chip>)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={s.inp} value={storeIn} placeholder="Add a store…" onChange={e => setStoreIn(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && storeIn.trim()) { up({ stores: [...(p.stores||[]), storeIn.trim()] }); setStoreIn('') } }} />
            <button style={s.ghost} onClick={() => { if (storeIn.trim()) { up({ stores: [...(p.stores||[]), storeIn.trim()] }); setStoreIn('') } }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {QUICK_STORES.filter(st => !(p.stores||[]).includes(st)).map(st => (
              <Chip key={st} on={false} onClick={() => up({ stores: [...(p.stores||[]), st] })}>+ {st}</Chip>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Pantry staples',
      body: (
        <div style={s.grid(12)}>
          <p style={{ color: T.sub, fontSize: 14 }}>Pre-filled from your cuisines — never added to grocery lists. Remove anything you don't keep.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {(p.staples||[]).map(st => <Chip key={st} on onClick={() => up({ staples: (p.staples||[]).filter(x => x !== st) })}>{st} ✕</Chip>)}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={s.inp} value={stapleIn} placeholder="Add a staple…" onChange={e => setStapleIn(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && stapleIn.trim()) { up({ staples: [...(p.staples||[]), stapleIn.trim()] }); setStapleIn('') } }} />
            <button style={s.ghost} onClick={() => { if (stapleIn.trim()) { up({ staples: [...(p.staples||[]), stapleIn.trim()] }); setStapleIn('') } }}>Add</button>
          </div>
        </div>
      )
    },
    {
      title: 'Exercise',
      body: (
        <div style={s.grid(16)}>
          <div>
            <span style={s.lbl}>Activities you enjoy</span>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              {MODALITIES.map(m => <Chip key={m} on={(p.exercisePrefs||[]).includes(m)} onClick={() => toggle('exercisePrefs', m)}>{m}</Chip>)}
            </div>
          </div>
          {(p.exercisePrefs||[]).some(m => GUIDED.includes(m)) && (
            <div>
              <span style={s.lbl}>YouTube channels (optional)</span>
              <p style={{ color: T.sub, fontSize: 13, marginBottom: 10 }}>We'll suggest specific videos from your favourites.</p>
              <div style={s.grid(8)}>
                {(p.exercisePrefs||[]).filter(m => GUIDED.includes(m)).map(m => (
                  <div key={m} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{m}</span>
                    <input style={s.inp} placeholder="e.g. Yoga with Adriene" value={(p.ytChannels||{})[m]||''}
                      onChange={e => up({ ytChannels: { ...(p.ytChannels||{}), [m]: e.target.value } })} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
  ]

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: 24, minHeight: '100vh', background: T.paper }}>
      <div style={{ margin: '24px 0 18px' }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: T.ink, fontFamily: "'Fraunces', serif" }}>
          Weekly<span style={{ color: T.citrus }}>.</span>Fit
        </div>
        <div style={{ color: T.sub, marginTop: 4 }}>One plan a week. Varied food, varied movement.</div>
      </div>
      <div style={s.card}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
          {steps.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? T.green : T.line }} />)}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px', color: T.ink }}>{steps[step].title}</h2>
        {steps[step].body}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
          <button style={{ ...s.ghost, visibility: step ? 'visible' : 'hidden' }} onClick={() => setStep(s => s - 1)}>Back</button>
          {step < steps.length - 1
            ? <button style={s.btn} onClick={() => setStep(s => s + 1)}>Next</button>
            : <button style={s.btn} onClick={() => onDone(p)}>Let's go →</button>}
        </div>
      </div>
    </div>
  )
}

// ── WEEK RIBBON ───────────────────────────────────────────────
function WeekRibbon({ days }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 5 }}>
      {days.map(d => {
        const mod = d.workout?.modality
        return (
          <div key={d.day} style={{ textAlign: 'center' }}>
            <div style={{ height: 46, borderRadius: 10, background: MODALITY_COLOR[mod] || T.line, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}>
              <span style={{ color: '#fff', fontSize: 8, fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,.3)', padding: '0 2px', lineHeight: 1.2 }}>
                {mod === 'Weight lifting' ? 'Weights' : mod || 'Rest'}
              </span>
            </div>
            <div style={{ fontSize: 10, color: T.sub, marginTop: 3, fontWeight: 600 }}>{d.day}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [plan, setPlan] = useState(null)
  const [weights, setWeights] = useState([])
  const [checked, setChecked] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [tab, setTab] = useState('week')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [modal, setModal] = useState(false)
  const [pantry, setPantry] = useState('')
  const [feedback, setFeedback] = useState('')
  const [eatOut, setEatOut] = useState(false)
  const [eatOutCuisine, setEatOutCuisine] = useState('')
  const [weightIn, setWeightIn] = useState('')
  const [apiProvider, setApiProvider] = useState('claude')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [emailModal, setEmailModal] = useState(null)
  const [emailTo, setEmailTo] = useState('')

  useEffect(() => {
    const p = loadData('profile', DEFAULT_PROFILE)
    const pl = loadData('plan', null)
    const w = loadData('weights', [])
    const ck = loadData('checked', {})
    setProfile(p); setPlan(pl); setWeights(w); setChecked(ck)
    setApiKey(loadApiKey()); setApiProvider(loadApiProvider())
    setLoaded(true)
  }, [])

  const persist = p => { setProfile(p); saveData('profile', p) }

  const doGenerate = useCallback(async () => {
    setBusy(true); setErr(''); setModal(false)
    try {
      const newPlan = await generatePlan(profile, weights, plan, feedback, pantry, eatOut, eatOutCuisine, apiProvider, apiKey)
      setPlan(newPlan); setChecked({})
      saveData('plan', newPlan); saveData('checked', {})
      setTab('week'); setFeedback(''); setPantry(''); setEatOut(false); setEatOutCuisine('')
    } catch (e) {
      setErr('Failed: ' + e.message)
    }
    setBusy(false)
  }, [profile, weights, plan, feedback, pantry, eatOut, eatOutCuisine, apiProvider, apiKey])

  const logWeight = () => {
    const kg = parseFloat(weightIn); if (!kg) return
    const next = [...weights, { date: new Date().toISOString().slice(0,10), kg }]
    setWeights(next); saveData('weights', next); setWeightIn('')
  }

  const toggleCk = k => {
    const n = { ...checked, [k]: !checked[k] }
    setChecked(n); saveData('checked', n)
  }

  const sendEmail = () => {
    if (!emailTo.trim() || !plan) return
    const subject = emailModal === 'plan' ? '🥗 Weekly Meal & Workout Plan' : '🛒 Weekly Grocery List'
    const body = emailModal === 'plan' ? formatPlanText(plan) : formatGroceryText(plan)
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailTo)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(url, '_blank')
    setEmailModal(null); setEmailTo('')
  }

  if (!loaded) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: T.paper }}>Loading…</div>

  if (!profile.onboarded) return <Onboarding onDone={p => { persist({ ...p, onboarded: true }) }} />

  const todayShort = DAYS_SHORT[new Date().getDay()]
  const todayKey = new Date().toISOString().slice(0,10)
  const TABS = [['week','Week'],['today','Today'],['grocery','Grocery'],['progress','Progress'],['settings','Settings']]

  const daysSinceWeigh = weights.length ? Math.floor((Date.now() - new Date(weights[weights.length-1].date)) / 86400000) : null

  return (
    <div style={{ background: T.paper, minHeight: '100vh', fontFamily: "'Public Sans', system-ui, sans-serif", color: T.ink }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 16px 90px' }}>

        {/* Header */}
        <div style={{ ...s.sb, marginBottom: 16 }}>
          <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Fraunces', serif" }}>Weekly<span style={{ color: T.citrus }}>.</span>Fit</div>
          {profile.startWeight && <div style={{ fontSize: 13, color: T.sub }}>Goal: −{profile.goalKg}kg / {profile.goalMonths}mo</div>}
        </div>

        {/* Weigh-in nudge */}
        {(daysSinceWeigh === null || daysSinceWeigh >= 7) && (
          <div style={{ ...s.card, background: T.citrusSoft, borderColor: '#EAD9A8', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>⚖️ Weekly weigh-in time</div>
            <input style={{ ...s.inp, width: 90 }} inputMode="decimal" placeholder="kg" value={weightIn} onChange={e => setWeightIn(e.target.value)} />
            <button style={{ ...s.btn, padding: '10px 14px' }} onClick={logWeight}>Log</button>
          </div>
        )}

        {err && <div style={{ ...s.card, borderColor: T.red, color: T.red }}>{err}</div>}

        {/* ── WEEK ── */}
        {tab === 'week' && (
          <div style={s.grid()}>
            {!plan && !busy && (
              <div style={{ ...s.card, textAlign: 'center', padding: 44 }}>
                <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>No plan yet</div>
                <p style={{ color: T.sub, marginBottom: 20 }}>Get your week of meals, workouts, and a grocery list.</p>
                <button style={s.btn} onClick={() => setModal(true)}>Plan my week</button>
              </div>
            )}
            {busy && (
              <div style={{ ...s.card, textAlign: 'center', padding: 44 }}>
                <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Building your week…</div>
                <p style={{ color: T.sub }}>Balancing nutrition, varying meals, splitting groceries.</p>
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: T.green, animation: `pulse 1.2s ${i*0.4}s infinite` }} />)}
                </div>
                <style>{`@keyframes pulse{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
              </div>
            )}
            {plan && !busy && (
              <>
                <div style={s.card}>
                  <span style={s.lbl}>Workouts this week</span>
                  <WeekRibbon days={plan.days} />
                  {plan.weekSummary && <p style={{ fontSize: 14, color: T.sub, marginTop: 12, marginBottom: 0 }}>{plan.weekSummary}</p>}
                </div>
                {plan.days.map(d => {
                  const isToday = d.day === todayShort
                  const hasFun = d.dinner?.fun
                  const hasEatOut = d.dinner?.eatOut
                  const wk = d.workout
                  return (
                    <div key={d.day} style={{ ...s.card, borderColor: hasFun ? T.citrus : hasEatOut ? '#7B9E3A' : isToday ? T.green : T.line, borderWidth: isToday ? 2 : 1 }}>
                      <div style={{ ...s.sb, marginBottom: 10 }}>
                        <div style={s.row}>
                          <div style={{ fontSize: 18, fontWeight: 700 }}>{DAY_FULL[d.day]}</div>
                          {isToday && <Badge color={T.green}>TODAY</Badge>}
                          {hasFun && <Badge color={T.citrus}>🎉 Fun</Badge>}
                          {hasEatOut && <Badge color="#7B9E3A">🍴 Out</Badge>}
                        </div>
                        {wk && <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: MODALITY_COLOR[wk.modality] || T.sub, padding: '3px 10px', borderRadius: 999 }}>{wk.modality === 'Weight lifting' ? 'Weights' : wk.modality}</span>}
                      </div>
                      {d.breakfast && <SlotRow color={T.line} emoji="🍳" label="Breakfast"><div style={{ fontWeight: 600 }}>{d.breakfast.name}</div><div style={{ fontSize: 13, color: T.sub }}>{d.breakfast.desc}{d.breakfast.proteinG ? ` · ${d.breakfast.proteinG}g protein` : ''}</div></SlotRow>}
                      {d.lunch && <SlotRow color={T.line} emoji="🥗" label="Lunch"><div style={{ fontSize: 14, color: T.sub, fontStyle: 'italic' }}>{d.lunch.idea}</div></SlotRow>}
                      {d.dinner && <SlotRow color={T.green} emoji="🍽️" label={`Dinner${hasFun?' 🎉':''}${hasEatOut?' 🍴':''}`}><div style={{ fontWeight: 700, fontSize: 15 }}>{d.dinner.name}</div><div style={{ fontSize: 13, color: T.sub }}>{d.dinner.desc}{d.dinner.proteinG ? ` · ${d.dinner.proteinG}g protein` : ''}</div></SlotRow>}
                      {wk && wk.modality !== 'Rest' && (
                        <SlotRow color={MODALITY_COLOR[wk.modality] || T.line} emoji="💪" label={wk.modality}>
                          <div style={{ fontSize: 13 }}>{wk.detail}</div>
                          {wk.ytSuggestion && <div style={{ fontSize: 12, color: T.red, marginTop: 2 }}>▶ {wk.ytSuggestion}</div>}
                        </SlotRow>
                      )}
                    </div>
                  )
                })}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button style={s.ghost} onClick={() => setModal(true)}>Plan next week →</button>
                  <button style={{ ...s.ghost, borderColor: T.citrus, color: T.citrus }} onClick={() => setEmailModal('plan')}>✉️ Email plan</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TODAY ── */}
        {tab === 'today' && (() => {
          if (!plan) return <div style={{ ...s.card, color: T.sub }}>Generate a plan first.</div>
          const todayPlan = plan.days.find(d => d.day === todayShort)
          const ckSteps = `ck|${todayKey}|steps`
          const ckWkt = `ck|${todayKey}|workout`
          const ckMeals = `ck|${todayKey}|meals`
          let streak = 0
          for (let i = 1; i <= 30; i++) {
            const d = new Date(); d.setDate(d.getDate() - i)
            const k = d.toISOString().slice(0,10)
            if (checked[`ck|${k}|steps`] && checked[`ck|${k}|workout`]) streak++; else break
          }
          return (
            <div style={s.grid()}>
              <div style={{ ...s.card, ...s.sb }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}</div>
                  <div style={{ color: T.sub, fontSize: 13 }}>Check off as you go</div>
                </div>
                {streak > 0 && <div style={{ textAlign: 'center', background: T.citrusSoft, borderRadius: 12, padding: '10px 16px', border: '1px solid #EAD9A8' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{streak}🔥</div>
                  <div style={{ fontSize: 10, color: T.sub, fontWeight: 700 }}>DAY STREAK</div>
                </div>}
              </div>
              <div style={s.card}>
                <span style={s.lbl}>Today's checklist</span>
                <div style={s.grid(10)}>
                  {[
                    { key: ckSteps, emoji: '👣', title: '10,000 steps', sub: 'Daily movement goal' },
                    { key: ckWkt, emoji: '💪', title: todayPlan?.workout?.modality !== 'Rest' ? `${todayPlan?.workout?.modality} — ${todayPlan?.workout?.detail}` : 'Rest day', sub: todayPlan?.workout?.ytSuggestion ? `▶ ${todayPlan.workout.ytSuggestion}` : '' },
                    { key: ckMeals, emoji: '🥗', title: "Followed today's meals", sub: '' },
                  ].map(item => {
                    const done = !!checked[item.key]
                    return (
                      <label key={item.key} style={{ display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', padding: 14, borderRadius: 12, background: done ? T.greenLight : T.paper, border: `1.5px solid ${done ? T.green : T.line}` }}>
                        <input type="checkbox" checked={done} onChange={() => toggleCk(item.key)} style={{ width: 22, height: 22, accentColor: T.green, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, textDecoration: done ? 'line-through' : 'none', color: done ? T.sub : T.ink }}>{item.emoji} {item.title}</div>
                          {item.sub && <div style={{ fontSize: 13, color: T.sub, marginTop: 2 }}>{item.sub}</div>}
                        </div>
                        {done && <span style={{ fontSize: 18 }}>✅</span>}
                      </label>
                    )
                  })}
                </div>
              </div>
              {todayPlan && (
                <div style={s.card}>
                  <span style={s.lbl}>Today's meals</span>
                  {todayPlan.breakfast && <SlotRow color={T.line} emoji="🍳" label="Breakfast"><div style={{ fontWeight: 600 }}>{todayPlan.breakfast.name}</div><div style={{ fontSize: 13, color: T.sub }}>{todayPlan.breakfast.desc}</div></SlotRow>}
                  {todayPlan.lunch && <SlotRow color={T.line} emoji="🥗" label="Lunch"><div style={{ fontSize: 14, color: T.sub, fontStyle: 'italic' }}>{todayPlan.lunch.idea}</div></SlotRow>}
                  {todayPlan.dinner && <SlotRow color={T.green} emoji="🍽️" label="Dinner"><div style={{ fontWeight: 700 }}>{todayPlan.dinner.name}</div><div style={{ fontSize: 13, color: T.sub }}>{todayPlan.dinner.desc}</div></SlotRow>}
                </div>
              )}
            </div>
          )
        })()}

        {/* ── GROCERY ── */}
        {tab === 'grocery' && (
          <div style={s.grid()}>
            {!plan ? <div style={{ ...s.card, color: T.sub }}>Generate a plan first.</div> : (
              <>
                <button style={{ ...s.ghost, borderColor: T.citrus, color: T.citrus }} onClick={() => setEmailModal('grocery')}>✉️ Email grocery list</button>
                {plan.grocery.map(g => {
                  const storeChecked = g.items.filter(it => checked[`${g.store}|${it.name}`]).length
                  return (
                    <div key={g.store} style={s.card}>
                      <div style={{ ...s.sb, marginBottom: 10 }}>
                        <div style={{ fontSize: 19, fontWeight: 700 }}>{g.store}</div>
                        <div style={{ fontSize: 13, color: T.sub }}>{storeChecked}/{g.items.length}</div>
                      </div>
                      {g.items.map(it => {
                        const k = `${g.store}|${it.name}`
                        const done = !!checked[k]
                        return (
                          <label key={k} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '8px 0', borderBottom: `1px solid ${T.line}`, opacity: done ? 0.45 : 1 }}>
                            <input type="checkbox" checked={done} onChange={() => toggleCk(k)} style={{ width: 18, height: 18, accentColor: T.green }} />
                            <span style={{ textDecoration: done ? 'line-through' : 'none', fontSize: 15 }}>{it.name} <span style={{ color: T.sub, fontSize: 13 }}>— {it.qty}</span></span>
                          </label>
                        )
                      })}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── PROGRESS ── */}
        {tab === 'progress' && (
          <div style={s.grid()}>
            <div style={s.card}>
              <span style={s.lbl}>Log today's weight</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={s.inp} inputMode="decimal" placeholder="kg" value={weightIn} onChange={e => setWeightIn(e.target.value)} />
                <button style={s.btn} onClick={logWeight}>Log</button>
              </div>
            </div>
            {weights.length >= 2 && (() => {
              const r = weights.slice(-4)
              const trend = (r[r.length-1].kg - r[0].kg).toFixed(1)
              return (
                <div style={{ ...s.card, ...s.sb }}>
                  <div><span style={s.lbl}>Recent trend</span><div style={{ fontSize: 28, fontWeight: 700, color: parseFloat(trend) <= 0 ? T.green : T.red }}>{trend > 0 ? '+' : ''}{trend} kg</div></div>
                  <div style={{ fontSize: 13, color: T.sub, maxWidth: 180 }}>Adjusted on 2-week trends — daily swings are mostly water.</div>
                </div>
              )
            })()}
            <div style={{ ...s.card, textAlign: 'center', padding: 20, background: T.citrusSoft, borderColor: '#EAD9A8' }}>
              <div style={{ fontSize: 28 }}>👣</div>
              <div style={{ fontSize: 26, fontWeight: 700 }}>10,000</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Daily step goal</div>
            </div>
            {weights.length > 0 && (
              <div style={s.card}>
                <span style={s.lbl}>History</span>
                {[...weights].reverse().map((w, i) => (
                  <div key={i} style={{ ...s.sb, padding: '9px 0', borderBottom: `1px solid ${T.line}` }}>
                    <span style={{ color: T.sub }}>{w.date}</span><strong>{w.kg} kg</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div style={s.grid()}>
            {/* API */}
            <div style={s.card}>
              <span style={s.lbl}>AI Provider</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 14 }}>
                {[['groq','Groq (free ⚡)'],['openrouter','OpenRouter (free)'],['gemini','Gemini (free)'],['claude','Claude']].map(([id, label]) => (
                  <Chip key={id} on={apiProvider === id} onClick={() => { setApiProvider(id); saveApiProvider(id) }}>{label}</Chip>
                ))}
              </div>
              <span style={s.lbl}>API Key</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={s.inp} type={showKey ? 'text' : 'password'}
                  placeholder={
                    apiProvider === 'groq' ? 'gsk_… from console.groq.com (free, no billing)' :
                    apiProvider === 'openrouter' ? 'sk-or-… from openrouter.ai/keys (free, no billing)' :
                    apiProvider === 'gemini' ? 'AIza… from aistudio.google.com/app/apikey (free)' :
                    'sk-ant-… from console.anthropic.com'
                  }
                  value={apiKey} onChange={e => { setApiKey(e.target.value); saveApiKey(e.target.value) }} />
                <button style={{ ...s.ghost, padding: '11px 14px', whiteSpace: 'nowrap' }} onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</button>
              </div>
              <div style={{ fontSize: 12, color: T.sub, marginTop: 8 }}>
                {apiProvider === 'groq'
                  ? '⚡ Fastest — plans generate in 2-3 seconds. Completely free, no billing ever. console.groq.com'
                  : apiProvider === 'openrouter'
                  ? '🔀 Access to 10+ free models. No billing ever. openrouter.ai/keys'
                  : apiProvider === 'gemini'
                  ? '✅ Free tier — 1,500 requests/day. aistudio.google.com/app/apikey'
                  : '✅ Best quality. Paid — console.anthropic.com'}
              </div>
            </div>
            {/* Diet */}
            <div style={s.card}>
              <span style={s.lbl}>Cuisine backgrounds</span>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {Object.keys(ETH_STAPLES).map(e => (
                  <Chip key={e} on={(profile.ethnicities||[]).includes(e)} onClick={() => {
                    const next = (profile.ethnicities||[]).includes(e) ? profile.ethnicities.filter(x => x !== e) : [...(profile.ethnicities||[]), e]
                    const st = [...new Set(next.flatMap(x => ETH_STAPLES[x] || []))]
                    persist({ ...profile, ethnicities: next, staples: st })
                  }}>{e}</Chip>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <span style={s.lbl}>Diet type</span>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {['No restriction','Vegetarian','Vegan','Eggetarian','Pescatarian','Halal','Kosher'].map(d => (
                  <Chip key={d} on={profile.diet === d} onClick={() => persist({ ...profile, diet: d })}>{d}</Chip>
                ))}
              </div>
            </div>
            {/* Meals */}
            <div style={s.card}>
              <span style={s.lbl}>Meals per day</span>
              {[{n:1,l:'1 — Dinner only'},{n:2,l:'2 — Lunch (leftovers) + Dinner'},{n:3,l:'3 — Breakfast + Lunch + Dinner'}].map(opt => (
                <label key={opt.n} style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer', padding: '10px 0', borderBottom: `1px solid ${T.line}` }}>
                  <input type="radio" checked={profile.mealsPerDay === opt.n} onChange={() => {
                    const slots = opt.n === 1 ? ['dinner'] : opt.n === 2 ? ['lunch','dinner'] : ['breakfast','lunch','dinner']
                    persist({ ...profile, mealsPerDay: opt.n, mealSlots: slots })
                  }} style={{ accentColor: T.green }} />
                  <span style={{ fontWeight: 600 }}>{opt.l}</span>
                </label>
              ))}
            </div>
            {/* Exercise */}
            <div style={s.card}>
              <span style={s.lbl}>Exercise preferences</span>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {MODALITIES.map(m => (
                  <Chip key={m} on={(profile.exercisePrefs||[]).includes(m)} onClick={() => {
                    const cur = profile.exercisePrefs || []
                    persist({ ...profile, exercisePrefs: cur.includes(m) ? cur.filter(x => x !== m) : [...cur, m] })
                  }}>{m}</Chip>
                ))}
              </div>
            </div>
            {/* Stores */}
            <div style={s.card}>
              <span style={s.lbl}>Stores</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 8 }}>
                {(profile.stores||[]).map(st => (
                  <Chip key={st} on onClick={() => persist({ ...profile, stores: (profile.stores||[]).filter(x => x !== st) })}>{st} ✕</Chip>
                ))}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {QUICK_STORES.filter(st => !(profile.stores||[]).includes(st)).map(st => (
                  <Chip key={st} on={false} onClick={() => persist({ ...profile, stores: [...(profile.stores||[]), st] })}>+ {st}</Chip>
                ))}
              </div>
            </div>
            <button style={s.ghostRed} onClick={() => { clearAll(); setProfile({ ...DEFAULT_PROFILE }); setPlan(null); setWeights([]); setChecked({}); setTab('week') }}>Reset everything</button>
          </div>
        )}
      </div>

      {/* Plan modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,34,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 20 }}>
          <div style={{ ...s.card, maxWidth: 480, width: '100%' }}>
            <h3 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 14px' }}>Before we plan</h3>
            <span style={s.lbl}>Perishables still at home</span>
            <textarea style={{ ...s.inp, minHeight: 52, resize: 'vertical', marginBottom: 12 }} placeholder="e.g. spinach, yogurt, paneer…" value={pantry} onChange={e => setPantry(e.target.value)} />
            {plan && <>
              <span style={{ ...s.lbl, display: 'block' }}>How did last week go?</span>
              <textarea style={{ ...s.inp, minHeight: 52, resize: 'vertical', marginBottom: 12 }} placeholder="e.g. skipped yoga, meals too heavy…" value={feedback} onChange={e => setFeedback(e.target.value)} />
            </>}
            <div style={{ ...s.card, background: T.citrusSoft, borderColor: '#EAD9A8', marginBottom: 14 }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input type="checkbox" checked={eatOut} onChange={e => setEatOut(e.target.checked)} style={{ marginTop: 2, width: 18, height: 18, accentColor: T.green }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>🍴 Eat out once this week</div>
                  {eatOut && <input style={{ ...s.inp, marginTop: 8 }} placeholder="Cuisine? e.g. Indian, sushi…" value={eatOutCuisine} onChange={e => setEatOutCuisine(e.target.value)} />}
                </div>
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={s.ghost} onClick={() => setModal(false)}>Cancel</button>
              <button style={s.btn} onClick={doGenerate}>Generate my week</button>
            </div>
          </div>
        </div>
      )}

      {/* Email modal */}
      {emailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(30,43,34,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 30 }}>
          <div style={{ ...s.card, maxWidth: 420, width: '100%' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>{emailModal === 'plan' ? '✉️ Email weekly plan' : '✉️ Email grocery list'}</h3>
            <p style={{ color: T.sub, fontSize: 13, marginTop: 0, marginBottom: 14 }}>Opens Gmail compose with content pre-filled.</p>
            <span style={s.lbl}>Send to</span>
            <input style={s.inp} type="email" placeholder="you@example.com" value={emailTo} onChange={e => setEmailTo(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendEmail()} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
              <button style={s.ghost} onClick={() => { setEmailModal(null); setEmailTo('') }}>Cancel</button>
              <button style={s.btn} onClick={sendEmail}>Open in Gmail →</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.line}`, display: 'flex', justifyContent: 'center', gap: 2, padding: '8px 4px' }}>
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex: 1, maxWidth: 120, background: tab === k ? T.paper : 'transparent', border: 'none', borderRadius: 10, padding: '9px 2px', fontWeight: tab === k ? 700 : 500, color: tab === k ? T.green : T.sub, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>{l}</button>
        ))}
      </div>
    </div>
  )
}
