# WeeklyFit

A personal weekly meal planner and workout tracker powered by AI. Tell it your cuisine background, dietary preferences, and fitness goals and it generates a 7-day meal plan, a balanced workout schedule, and a grocery list split by store, every week.

> ⚠️ **Hobby project.** Nutrition values, calorie counts, and exercise recommendations are AI-generated approximations. Not reviewed by a doctor, dietitian, or certified trainer. 
---

## What it does

**Meals**
- Plans your week based on your cuisine background (Indian, East Asian, Mediterranean, Mexican, etc.)
- Respects your diet type, allergies, and foods you avoid
- Supports 5 meal configurations: breakfast only, lunch only, dinner only, lunch (leftovers) + dinner, or all 3 meals
- When you pick "lunch + dinner", lunch is always last night's dinner. Zero extra cooking
- Includes one fun meal per week (chaat, ramen, nacho plate, shakshuka, etc.)
- Avoids deep-fried daily mains and keeps meals balanced for your weight goal
- South Indian, North Indian, East Asian, Mediterranean and rotates so you don't eat the same thing every day

**Grocery list**
- Auto-generated from the week's meals
- Split by your stores (Indian grocery, Costco, Trader Joe's, H Mart, etc.)
- Excludes pantry staples you already have (rice, dal, spices, soy sauce, etc.)
- Checkboxes to tick off as you shop
- Email the list to yourself directly from the app

**Workouts**
- Science-based weekly schedule (ACSM + Schoenfeld 2016 guidelines)
- Weight training 2-3x per week, non-consecutive days, Push/Pull/Legs split
- Cardio 2-3x per week with exact specs: treadmill speed + incline + duration, swim laps, cycling cadence + zone
- Flexibility (yoga, stretching, pilates) max 1-2x per week
- 1-2 true rest days
- YouTube video suggestions from your preferred channels
- Balance scoreboard shows strength / cardio / flexibility / rest days at a glance

**Progress tracking**
- Weekly weigh-in reminders
- Weight trend chart (2-week rolling and filters out daily water weight noise)
- Daily checklist: 10,000 steps · today's workout · followed meals
- Streak counter

---

## How to use it

Try it live at **[poojak13.github.io/weeklyfit](https://poojak13.github.io/weeklyfit)** . It works in any browser, installable on Android as a home screen app.

### First time setup (onboarding)

1. **Choose your AI provider** and paste your API key (see API keys section below)
2. **Pick your cuisine backgrounds** - this sets your meal variety and pantry staples
3. **Set your goal** (optional) - weight, height, how much you want to lose and by when
4. **Choose how many meals** you want planned per day
5. **Add your stores** - the grocery list will be split across these
6. **Confirm your pantry staples** - pre-filled from your cuisine, never added to grocery list
7. **Pick exercises you enjoy** - the weekly plan will mix these for full-body coverage

### Every week

1. Go to the **Week** tab → tap **Plan my week**
2. Tell it what perishables you still have at home (optional - removes them from the grocery list)
3. Note how last week went (optional - the AI adjusts)
4. Choose whether you want to eat out once this week
5. Your 7-day plan generates in seconds

### Shopping

Go to the **Grocery** tab - items are grouped by store, tap to check off as you go. Tap **✉️ Email grocery list** to send it to yourself before heading out.

### Daily

Check the **Today** tab - see today's meals and workout, tick off your 10,000 steps, workout, and meals as you complete them.

---

## API keys

WeeklyFit uses an AI model to generate your plans. You bring your own API key and it's stored only in your browser, never on any server.

| Provider | Cost | Speed | Get key from |
|---|---|---|---|
| **Groq** ⚡ | Free tier, no billing info required | 2–3 sec | [console.groq.com](https://console.groq.com) |
| **OpenRouter** | Free tier available | 5–8 sec | [openrouter.ai/keys](https://openrouter.ai/keys) |
| **Gemini** | Free tier (1,500 req/day), billing info required | 10–15 sec | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| **Claude** | Paid | 10–15 sec | [console.anthropic.com](https://console.anthropic.com) |

**Recommendation:** Start with Groq - completely free, no credit card, fastest generation, and Llama 3.3 70B is more than capable for meal planning.

---

## Deploy your own copy

Want to host your own version? Fork this repo and deploy to GitHub Pages in a few minutes.

### Step 1 - Create a GitHub repo
1. Go to [github.com](https://github.com) → **+** → **New repository**
2. Name it `weeklyfit`, set to **Public**, click **Create repository**

### Step 2 - Upload the files
1. Unzip the project folder on your computer
2. On the repo page click **uploading an existing file**
3. Drag everything inside the `weeklyfit-web` folder into the upload area
4. Click **Commit changes**

### Step 3 - Create the deploy workflow
1. In your repo click **Add file → Create new file**
2. Type `.github/workflows/deploy.yml` in the filename box
3. Paste the contents of the included `deploy.yml` file
4. Click **Commit new file**

### Step 4 - Enable GitHub Pages
1. Go to repo **Settings → Pages**
2. Under **Source** select **GitHub Actions**

### Step 5 - Wait ~2 minutes
Go to the **Actions** tab and watch it build. When all steps show ✅ your app is live at:

```
https://YOUR_GITHUB_USERNAME.github.io/weeklyfit
```

### Step 6 - Install on Android
1. Open the URL in **Chrome on your Android phone**
2. Tap ⋮ → **Add to Home Screen**
3. Works like a native app - full screen, home screen icon

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Disclaimer

WeeklyFit is a personal hobby project. All nutrition information, calorie estimates, and exercise recommendations are generated by AI and are approximations only. They have not been reviewed or verified by a registered dietitian, nutritionist, doctor, or certified personal trainer. Do not use this app as a substitute for professional medical or nutritional advice.
