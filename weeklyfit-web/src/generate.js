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
    `- Goal: lose ${profile.goalKg}kg in ${profile.goalMonths} months${profile.startWeight ? ', current '+profile.startWeight+'kg' : ''}`,
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
    `WEIGHT LOSS RULES (lose ${profile.goalKg}kg in ${profile.goalMonths} months = ~500 kcal/day deficit):`,
    '- Rice is fine in 3/4 cup portions paired with high-protein side',
    '- Roti is fine, 2 whole wheat rotis per meal',
    '- NO deep-fried mains daily: poori, bhatura, puri, kachori',
    '- NO heavy cream curries every day',
    '- EVERY dinner must have protein (dal, rajma, chole, paneer, tofu, eggs, legumes) AND a vegetable',
    '- Dinner: 450-550 kcal, 25-35g protein. Breakfast: 300-400 kcal, 15-25g protein.',
    `- Total daily protein target: ${proteinTarget}`,
    '- Cooking methods: minimal oil, grilled/baked/steamed preferred',
    profile.ethnicities.includes('Indian') ? '- Include South Indian dishes (idli+sambhar, upma, uttapam, pesarattu, rasam, lemon rice) not just North Indian' : '',
    `- Fun meal options this week (pick ONE, make it fun:true): ${funOpts.slice(0,8).join(', ')||'any healthy treat meal'}`,
    '',
    'WORKOUT RULES (evidence-based, ACSM + Schoenfeld 2016):',
    '- Weight lifting: 2-3x/week on non-consecutive days, Push/Pull/Legs split',
    '- Yoga/Stretching: max 1-2x/week',
    '- Cardio: 2-3x/week between strength days. Treadmill: speed mph + incline% + duration. Swim: laps + pool size. Cycling: cadence + zone.',
    '- 1-2 rest days, no back-to-back heavy strength',
    '- Guided workouts: give ytSuggestion. Use MET-based calorie estimates only.',
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
    if (!apiKey?.trim()) throw new Error('Groq API key required. Get one free at console.groq.com')
    url = 'https://api.groq.com/openai/v1/chat/completions'
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` }
    body = JSON.stringify({ model: 'llama-3.3-70b-versatile', max_tokens: 6000, temperature: 0.7, messages: [{ role: 'user', content: prompt }] })
    getText = data => data?.choices?.[0]?.message?.content || ''
  } else if (apiProvider === 'openrouter') {
    if (!apiKey?.trim()) throw new Error('OpenRouter API key required. Get one free at openrouter.ai/keys')
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
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))

  const text = getText(data)
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1) throw new Error('No JSON in response. Raw: ' + text.slice(0, 200))

  const plan = JSON.parse(text.slice(start, end + 1))

  // Inject real leftover names client-side
  const slots = profile.mealSlots || ['dinner']
  if (slots.includes('lunch')) {
    plan.days.forEach((d, i) => {
      if (i === 0) { if (d.lunch) d.lunch.idea = 'Leftovers from last week' }
      else { const prev = plan.days[i-1].dinner; if (d.lunch && prev) d.lunch.idea = `Leftovers: ${prev.name}` }
    })
  }

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
