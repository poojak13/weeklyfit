# WeeklyFit Web

Weekly meal planner + workout tracker. Built with React + Vite. Deploys to GitHub Pages.

## Deploy to GitHub Pages (5 minutes)

### Step 1 — Create a GitHub repo
1. Go to github.com → click **+** → **New repository**
2. Name it `weeklyfit` (or anything you like)
3. Set to **Public**
4. Click **Create repository**

### Step 2 — Upload the files
1. On the repo page, click **uploading an existing file**
2. Drag ALL files from this zip into the upload area
   - Important: also drag the `.github` folder (hidden folder — might need to show hidden files)
3. Click **Commit changes**

### Step 3 — Enable GitHub Pages
1. Go to repo **Settings** → **Pages** (left sidebar)
2. Under **Source** select **GitHub Actions**
3. The deploy workflow runs automatically

### Step 4 — Get your URL
- After ~2 minutes, your app is live at:
- `https://YOUR_GITHUB_USERNAME.github.io/weeklyfit`

### Step 5 — Add to home screen (Android)
1. Open the URL in **Chrome on your Android phone**
2. Tap ⋮ menu → **Add to Home Screen**
3. It installs like a native app!

---

## API Keys (set in app Settings)

| Provider | Get key from | Works in browser? |
|---|---|---|
| Claude | console.anthropic.com | ✅ Yes |
| Gemini | aistudio.google.com/app/apikey (free) | ✅ Yes |

Keys are stored in your browser's localStorage — never sent to any server except the chosen AI provider.

---

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:5173
