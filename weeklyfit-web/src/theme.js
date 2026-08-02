import { T } from './data.js'

export const s = {
  card: { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 18, marginBottom: 12 },
  btn: { background: T.green, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 22px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' },
  ghost: { background: 'transparent', color: T.green, border: `1.5px solid ${T.green}`, borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  ghostRed: { background: 'transparent', color: T.red, border: `1.5px solid ${T.red}`, borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  inp: { border: `1.5px solid ${T.line}`, borderRadius: 10, padding: '11px 13px', fontSize: 15, width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fff', color: T.ink },
  lbl: { fontSize: 11, fontWeight: 700, color: T.sub, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'block' },
  row: { display: 'flex', alignItems: 'center' },
  sb: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  grid: (gap=12) => ({ display: 'grid', gap }),
}

export function chip(on) {
  return {
    padding: '7px 13px', borderRadius: 999, margin: 3, cursor: 'pointer', fontFamily: 'inherit',
    border: `1.5px solid ${on ? T.green : T.line}`, background: on ? T.green : '#fff',
    color: on ? '#fff' : T.ink, fontWeight: 500, fontSize: 13,
  }
}
