const PREFIX = 'wf:'

export function loadData(key, fallback) {
  try {
    const val = localStorage.getItem(PREFIX + key)
    return val ? JSON.parse(val) : fallback
  } catch { return fallback }
}

export function saveData(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) }
  catch (e) { console.error('Storage error:', e) }
}

export function clearAll() {
  // Only clear app data — never touch API keys (wf_apikey, wf_apiprovider)
  Object.keys(localStorage)
    .filter(k => k.startsWith('wf:'))
    .forEach(k => localStorage.removeItem(k))
}

// API keys stored separately
export function loadApiKey() { return localStorage.getItem('wf_apikey') || '' }
export function saveApiKey(v) { localStorage.setItem('wf_apikey', v) }
export function loadApiProvider() { return localStorage.getItem('wf_apiprovider') || 'claude' }
export function saveApiProvider(v) { localStorage.setItem('wf_apiprovider', v) }
