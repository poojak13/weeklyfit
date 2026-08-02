import { FUN_MEALS, ETH_STAPLES } from './data.js'

function buildPrompt(profile, weights, lastPlan, feedback, pantry, eatOut, eatOutCuisine) {
  const slots = profile.mealSlots || ['dinner']
  const avoids = [...(profile.allergies||[]), ...(profile.avoids||[]), ...(profile.customAvoid ? [profile.customAvoid] : [])]
  const wNote = weights.length
    ? 'Weight log: ' + weights.map(w => `${w.date}:${w.kg}kg`).join(',') + '. Adjust on 2-week trend.'
    : 'No weight data yet.'
  const lNote = lastPlan
    ? 'Last week dinners: ' + lastPlan.days.map(d => d.dinner.name).join(', ') + '. Do not repeat.'
    : 'First week.'
  const leftoverRule = slots.includes('lunch') && slots.includes('dinner')
    ? 'LEFTOVER RULE: Mon lunch = "Leftovers from last week". Tue-Sun lunch = "Leftovers from [prev night dinner]". Lunch is never a new recipe.'
    : ''
  const proteinTarget = profile.startWeight ? Math.round(parseFloat(profile.startWeight) * 1.8) + 'g' : '120g'
  const ytNote = Object.entries(profile.ytChannels||{}).filter(([,v]) => v?.trim()).map(([k,v]) => `${k}:${v}`).join(';')
  const funOpts = (profile.ethnicities||[]).flatMap(e => FUN_MEALS[e] || [])
  const firstStore = (profile.stores||[])[0] || 'grocery store'

  return [
    'Generate a weekly meal and fitness plan as JSON. No markdown, no explanation, ONLY valid JSON.',
    '',
    'USER PROFILE:',
    `- Diet: ${profile.diet}${avoids.length ? ', avoid: '+avoids.join(', ') : ''}`,
    `- Cuisines (ONLY suggest meals from these, do not default to other cuisines): ${profile.ethnicities.length ? profile.ethnicities.join(', ') : 'varied international'}`,
    profile.goalKg && profile.goalMonths ? `- Weight loss goal: lose ${profile.goalKg}kg in ${profile.goalMonths} months${profile.startWeight ? ', current '+profile.startWeight+'kg' : ''}` : `- No specific weight goal set — focus on balanced, healthy meals`,
    `- Meal slots per day: ${slots.join(', ')}`,
    `- Stores (ONLY use these exact stores, no others): ${(profile.stores||[]).length ? profile.stores.join(', ') : 'any store'}`,
    `- Staples (never add to grocery list): ${(profile.staples||[]).slice(0,15).join(', ')||'none'}`,
    `- Perishables at home: ${pantry||'none'}`,
    `- Exercise preferences: ${(profile.exercisePrefs||[]).join(', ')||'any'}`,
    `- YouTube channels: ${ytNote||'none'}`,
    `- Last week feedback: ${feedback||'none'}`,
    `- ${wNote} ${lNote}`,
    `- ${eatOut ? 'Include one eat-out dinner (eatOut:true), cuisine: '+(eatOutCuisine||'any healthy') : 'No eating out'}`,
    '',
    leftoverRule,
    '',
    profile.goalKg && profile.goalMonths ? `WEIGHT LOSS RULES (lose ${profile.goalKg}kg in ${profile.goalMonths} months = ~500 kcal/day deficit):` : 'NUTRITION RULES (balanced healthy eating):',
    '- Rice is fine in 3/4 cup portions paired with high-protein side',
    '- Roti is fine, 2 whole wheat rotis per meal',
    '- NO deep-fried mains daily: poori, bhatura, puri, kachori',
    '- NO heavy cream curries every day',
    '- EVERY dinner must have protein (dal, rajma, chole, paneer, tofu, eggs, legumes) AND a vegetable',
    '- Dinner: 450-550 kcal, 25-35g protein. Breakfast: 300-400 kcal, 15-25g protein.',
    profile.startWeight ? `- Total daily protein target: ${proteinTarget}` : '- Aim for high protein in every meal (dal, paneer, legumes, eggs, tofu)',
    '- Cooking methods: minimal oil, grilled/baked/steamed preferred',
    profile.ethnicities.includes('Indian') ? '- Include South Indian dishes (idli+sambhar, upma, uttapam, pesarattu, rasam, lemon rice) not just North Indian' : '',
    `- Fun meal options this week (pick ONE, make it fun:true): ${funOpts.slice(0,8).join(', ')||'any healthy treat meal'}`,
    '',
    'WORKOUT RULES (evidence-based, ACSM + Schoenfeld 2016). Build a BALANCED week covering all movement types:',
    '',
    'MANDATORY WEEKLY BALANCE — every week must include ALL of these categories:',
    '  1. STRENGTH (2-3 days): Weight lifting on non-consecutive days (e.g. Mon/Wed/Fri or Mon/Thu/Sat). Rotate Push (chest/shoulders/triceps) → Pull (back/biceps) → Legs/glutes/core. Never do strength 2 days in a row.',
    '  2. CARDIO (2-3 days): Running, cycling, swimming, treadmill, elliptical, rowing — on days between strength. Give exact specs: treadmill = speed mph + incline% + duration mins. Swim = laps + pool length. Cycling = cadence rpm + zone. Running = pace + distance.',
    '  3. FLEXIBILITY/MOBILITY (1-2 days): Yoga, stretching, pilates. Max 2x/week — do not fill the week with yoga at the expense of strength or cardio.',
    '  4. REST (1-2 days): True rest days. No back-to-back heavy strength days ever.',
    '',
    'FORBIDDEN PATTERNS (never do these):',
    '  - Yoga every day or 3+ times a week',
    '  - Walking as the only cardio (walking is supplemental, not a cardio session)',
    '  - Same modality 3+ days in a row',
    '  - Two strength sessions back-to-back (Mon strength + Tue strength = never)',
    '  - All 7 days filled with exercise — must have 1-2 true rest days',
    '',
    'EXAMPLE BALANCED WEEK for someone who likes Yoga + Weight lifting + Swimming:',
    '  Mon: Weight lifting (Push), Tue: Swimming 30 laps, Wed: Yoga 30min, Thu: Weight lifting (Pull), Fri: Swimming 40 laps, Sat: Weight lifting (Legs), Sun: Rest',
    '',
    'For guided workouts (Yoga, Weight lifting, HIIT, Pilates): give a specific ytSuggestion video/series from their preferred channel.',
    'For cardio: give exact ACSM specs. Fat-burn zone = 60-70% HRmax. Treadmill fat-burn = 3.5-4.5mph at 3-5% incline for 45 mins.',
    'Use MET-based calorie estimates only — never make up numbers.',
    '',
    'RETURN EXACTLY THIS JSON (7 days Mon-Sun, no extra text before or after):',
    JSON.stringify({
      weekSummary: 'one sentence on this weeks focus',
      days: [{
        day: 'Mon',
        dinner: { name: 'Moong dal khichdi', desc: 'Light lentil rice one-pot', proteinG: 18, fun: false, eatOut: false },
        lunch: { idea: 'Leftovers from last week' },
        breakfast: { name: 'Oats upma', desc: 'Savoury oats with vegetables', proteinG: 12 },
        workout: { modality: 'Yoga', detail: '30 min morning flow', focus: 'mobility', ytSuggestion: 'Adriene Morning Flow', steps: 2500 }
      }],
      grocery: [{ store: firstStore, items: [{ name: 'Baby spinach', qty: '200g bag' }] }]
    }, null, 0),
    `Only include meal keys matching user slots: ${slots.join(', ')}. Always include workout key.`,
  ].filter(l => l !== undefined).join('\n')
}

export async function generatePlan(profile, weights, lastPlan, feedback, pantry, eatOut, eatOutCuisine, apiProvider, apiKey) {
  const prompt = buildPrompt(profile, weights, lastPlan, feedback, pantry, eatOut, eatOutCuisine)

  let url, headers, body, getText

  if (apiProvider === 'groq') {
    if (!apiKey?.trim()) throw new Error('Groq API key required — get a free key at console.groq.com (no billing needed)')
    url = 'https://api.groq.com/openai/v1/chat/completions'
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` }
    body = JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 6000, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
    getText = data => data?.choices?.[0]?.message?.content || ''
  } else if (apiProvider === 'openrouter') {
    if (!apiKey?.trim()) throw new Error('OpenRouter API key required — get a free key at openrouter.ai/keys (no billing needed)')
    url = 'https://openrouter.ai/api/v1/chat/completions'
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}`, 'HTTP-Referer': 'https://weeklyfit.app', 'X-Title': 'WeeklyFit' }
    body = JSON.stringify({ model: 'meta-llama/llama-3.3-70b-instruct:free', max_tokens: 6000, messages: [{ role: 'user', content: prompt }] })
    getText = data => data?.choices?.[0]?.message?.content || ''
  } else if (apiProvider === 'gemini') {
    if (!apiKey?.trim()) throw new Error('Gemini API key required. Get one free at aistudio.google.com/app/apikey')
    const model = 'gemini-2.0-flash'
    url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`
    headers = { 'Content-Type': 'application/json' }
    body = JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 6000, temperature: 0.7 } })
    getText = data => data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  } else {
    // Claude — works without key in dev, requires key in production
    url = 'https://api.anthropic.com/v1/messages'
    headers = { 'Content-Type': 'application/json' }
    if (apiKey?.trim()) {
      headers['x-api-key'] = apiKey.trim()
      headers['anthropic-version'] = '2023-06-01'
    }
    body = JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 6000, messages: [{ role: 'user', content: prompt }] })
    getText = data => (data.content||[]).filter(b => b.type === 'text').map(b => b.text).join('')
  }

  const res = await fetch(url, { method: 'POST', headers, body })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${apiProvider.toUpperCase()} API error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))

  const text = getText(data)
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1) throw new Error(`${apiProvider.toUpperCase()} returned no valid JSON. Try regenerating. Raw: ` + text.slice(0, 200))

  const plan = JSON.parse(text.slice(start, end + 1))

  // Inject real leftover names client-side
  const slots = profile.mealSlots || ['dinner']
  if (slots.includes('lunch')) {
    plan.days.forEach((d, i) => {
      if (i === 0) { if (d.lunch) d.lunch.idea = 'Leftovers from last week' }
      else { const prev = plan.days[i-1].dinner; if (d.lunch && prev) d.lunch.idea = `Leftovers: ${prev.name}` }
    })
  }

  // Validate workout balance and warn if skewed
  const modalityCounts = {}
  plan.days.forEach(d => {
    const mod = d.workout?.modality || 'Rest'
    modalityCounts[mod] = (modalityCounts[mod] || 0) + 1
  })

  const strengthMods = ['Weight lifting','HIIT']
  const cardioMods = ['Running','Swimming','Treadmill','Cycling','Rowing','Elliptical','Jump rope']
  const flexMods = ['Yoga','Stretching','Pilates','Dance']

  const strengthDays = strengthMods.reduce((a, m) => a + (modalityCounts[m] || 0), 0)
  const cardioDays = cardioMods.reduce((a, m) => a + (modalityCounts[m] || 0), 0)
  const flexDays = flexMods.reduce((a, m) => a + (modalityCounts[m] || 0), 0)
  const restDays = (modalityCounts['Rest'] || 0) + (modalityCounts['Walking'] || 0)

  // Check for any single modality dominating
  const dominant = Object.entries(modalityCounts).find(([mod, count]) => mod !== 'Rest' && count >= 4)
  if (dominant) {
    console.warn(`Workout imbalance: ${dominant[0]} appears ${dominant[1]} times. Consider regenerating.`)
    plan.workoutWarning = `This week is heavy on ${dominant[0]} (${dominant[1]} days). For best results regenerate for a more balanced mix.`
  }

  plan.workoutBalance = { strengthDays, cardioDays, flexDays, restDays }

  return plan
}

export function formatPlanText(plan) {
  const DAY = { Mon:'Monday',Tue:'Tuesday',Wed:'Wednesday',Thu:'Thursday',Fri:'Friday',Sat:'Saturday',Sun:'Sunday' }
  const lines = ['WEEKLY MEAL & WORKOUT PLAN', '='.repeat(32), '']
  if (plan.weekSummary) lines.push(plan.weekSummary, '')
  plan.days.forEach(d => {
    lines.push(`── ${(DAY[d.day]||d.day).toUpperCase()} ──`)
    if (d.breakfast) lines.push(`🍳 Breakfast: ${d.breakfast.name} — ${d.breakfast.desc} (${d.breakfast.proteinG}g protein)`)
    if (d.lunch) lines.push(`🥗 Lunch: ${d.lunch.idea}`)
    if (d.dinner) lines.push(`🍽️ Dinner: ${d.dinner.name} — ${d.dinner.desc} (${d.dinner.proteinG}g protein)${d.dinner.fun?' 🎉':''}${d.dinner.eatOut?' 🍴 eating out':''}`)
    if (d.workout?.modality !== 'Rest') lines.push(`💪 ${d.workout?.modality}: ${d.workout?.detail}${d.workout?.ytSuggestion ? ' | ▶ '+d.workout.ytSuggestion : ''}`)
    else lines.push('😴 Rest day')
    lines.push('')
  })
  lines.push('👣 Daily step goal: 10,000 steps')
  return lines.join('\n')
}

export function formatGroceryText(plan) {
  const lines = ['WEEKLY GROCERY LIST', '='.repeat(32), '']
  plan.grocery.forEach(g => {
    lines.push(`📍 ${g.store.toUpperCase()}`, '')
    g.items.forEach(it => lines.push(`  ☐ ${it.name} — ${it.qty}`))
    lines.push('')
  })
  return lines.join('\n')
}
