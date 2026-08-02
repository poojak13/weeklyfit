# Contributing to ApplyNinja

Thanks for wanting to help. This is a hobby project, so contributions are welcome but informal — no CLA, no bureaucracy.

---

## Ways to contribute

### 🐛 Report a broken ATS

The most useful thing you can do is report when a specific job application page doesn't fill correctly. Open an issue with:

- The URL (or at least the ATS platform and company name)
- Which fields didn't fill / filled incorrectly
- If you can: open DevTools → Console on the page after clicking Autofill, and paste any `[QuickApply]` diagnostic output you see

### 🏷️ Add field synonyms

The label-matching dictionary lives in `field-map.js` under `FIELD_SYNONYMS`. If a field isn't being matched because the ATS uses unusual label text, adding a synonym is a one-line fix:

```js
// Before
currentCompany: ["current company", "current employer", "^company$"],

// After — add the new phrasing
currentCompany: ["current company", "current employer", "^company$", "employer name"],
```

Run the test suite after:

```bash
node test-match.js   # if it exists, or test manually in the browser
```

### 🧩 Add ATS support

If you want to add support for a new ATS:

1. Identify how the ATS renders its labels and inputs (check DevTools → Elements on a live form)
2. Determine if it uses standard `<input>` with `<label>`, shadow DOM, custom components, or iframes
3. Add any needed synonyms to `field-map.js`
4. If it needs special handling (like Ashby's button-option widgets or SR's shadow DOM), add a dedicated pass in `content.js` and call it from `autofill()`
5. Test on a real live application form

### ✏️ Fix incorrect field filling

If a field fills with the wrong value (e.g. race picks "White" instead of "Asian"), the issue is usually in the option scoring. The relevant functions are:

- `scoreOptionMatch()` — general text similarity scoring
- `scoreOptionForKey()` — routes EEO fields to their classifier
- `classifyEeoOption()` — yes/no/decline classification for EEO fields
- `pickYesNoOption()` / `pickYesNoOption()` — picks yes/no from a set of options

Add a test case to the test block at the bottom of the repo (or in `test-match.js`) and fix the scoring.

---

## Dev setup

No build step, no bundler, no dependencies. It's plain JS.

```bash
git clone https://github.com/YOUR_USERNAME/apply-ninja.git
cd apply-ninja
```

Load in Chrome:
1. `chrome://extensions` → Developer mode on → Load unpacked → select the folder
2. Make a change to any `.js` file
3. Go back to `chrome://extensions` → click the reload icon on the extension card
4. Test on a live job application page

That's the entire dev loop.

---

## Code map

| File | What it does |
|---|---|
| `field-map.js` | Profile schema + synonym dictionary. Loaded by both `content.js` and `popup.js`. |
| `content.js` | Everything that runs on the page: scanning, matching, filling, shadow DOM traversal, floating button, toast, multi-page navigation. |
| `background.js` | Service worker: OpenAI API calls (essays + job search), ATS URL detection, badge. |
| `popup.html/js/css` | The popup that appears when you click the extension icon. |
| `options.html/js/css` | The full profile editor that opens in a tab. |
| `content.css` | Styles for the floating Autofill button and the toast notification injected into pages. |

---

## Guidelines

- **No build tooling** — keep it loadable as an unpacked extension with zero setup
- **No external dependencies** — no npm packages bundled into the extension
- **Test on real pages** — synthetic DOM tests are fine for matching logic, but always verify on a live ATS before calling it done
- **Don't break existing platforms** — when adding something new, run through Greenhouse, Ashby, and SmartRecruiters to make sure nothing regressed
- **Keep the disclaimer** — the "hobby project, verify before submitting" disclaimer stays in the UI

---

## Adding a new profile field

1. Add the field to `PROFILE_SCHEMA` in `field-map.js` (key, label, type, group)
2. Add its synonyms to `FIELD_SYNONYMS` in the same file
3. If it's a yes/no or EEO field, update the relevant classifier in `content.js`
4. The profile editor UI is generated automatically from `PROFILE_SCHEMA` — no HTML changes needed

---

## Submitting changes

Since this is a private repo, just push to a branch and open a PR, or push directly to `main` if you have access. There's no formal review process — use your judgment.

```bash
git checkout -b fix/ashby-race-field
# make changes
git add .
git commit -m "Fix: Ashby race field selecting White instead of Asian"
git push origin fix/ashby-race-field
# open a PR on GitHub
```
