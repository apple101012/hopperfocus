# ⏰ HopperFocus: Beating Time Blindness for ADHD

**A gamified productivity system that makes time visible, immediate, and impossible to ignore.**

---

## 🧠 The Problem: Time Blindness & Temporal Discounting

People with ADHD suffer from **time blindness**—an inability to accurately perceive how much time has passed or remains. Scientific literature on executive functioning refers to this as steep **temporal discounting**: an ADHD brain struggles to value rewards in the distant future.

**Real-world impact:**
- A project due in 2 weeks feels the same as one due in 2 years
- It "doesn't exist" until it's due tomorrow
- This causes massive panic, burnout, and failure cycles

---

## 🎯 The Solution: HopperFocus's 3 Core Powers

### 1. ⏰ **The Time Turner Timeline** (Combats Time Blindness)

Instead of a traditional 30-day calendar grid, HopperFocus visualizes time as a **shrinking horizontal progress bar**.

**How it works:**
- You input the **Final Deadline** for your massive project
- The UI renders a horizontal timeline from **Today** to **Deadline**
- As time passes, the "Today" marker **physically moves** closer to the end
- The remaining time bar **changes color** (green → yellow → red) based on urgency

**The Hackathon Flex:**  
This converts **abstract time into undeniable visual reality**. Your ADHD brain can no longer pretend the deadline doesn't exist—it's **shrinking in front of your eyes**.

---

### 2. 📜 **The Contract Board** (Adds Executive Control)

AI breaks down your syllabus/assignment, but **you have the final say**.

**How it works:**
1. Paste your massive assignment (essay, coding project, etc.)
2. **Gemini AI** breaks it into micro-tasks with suggested:
   - Title
   - Timer duration
   - Mana Stake (how much you risk)
   - Mana Bounty (how much you win)
3. **Before accepting**, you can customize **everything**:
   - Edit the task title (e.g., "Read Chapter 1" → "Skim Chapter 1 for keywords")
   - Adjust the timer (5 min → 10 min)
   - Assign a **specific due date** on your Time Turner timeline
   - **Crank up the stake** if you're distracted (risk 50 Mana instead of 10)

**The Hackathon Flex:**  
You're not just a passive recipient of AI suggestions—you **manufacture your own adrenaline** by manually increasing stakes when you need more focus.

---

### 3. 🔥 **Hyper-Focus Mode** (Eliminates Distraction)

When you accept a contract, the app enters **full-screen immersive mode**.

**How it works:**
- The rest of the interface **disappears completely**
- A massive **visual timer** fills the screen:
  - Shrinking magical aura that gets smaller as time runs out
  - Draining hourglass particles falling down
  - Color shifts from calm blue → urgent red
- Stakes and bounty are displayed prominently
- Only 2 buttons exist: **"Task Complete"** and **"Forfeit"**

**The Hackathon Flex:**  
Traditional number countdowns don't work for ADHD. HopperFocus uses **visceral visual feedback** (shrinking aura, color changes, falling particles) to make time passage **physically undeniable**.

---

## 🧪 The Science: Loss Aversion + Immediate Consequences

**Why standard to-do lists fail for ADHD:**
- No immediate consequences → brain doesn't prioritize
- Future rewards feel abstract → temporal discounting wins

**Why HopperFocus works:**
1. **Loss Aversion:** Humans fear losing what they already have more than they desire gains. Staking Mana triggers this primitive survival instinct.
2. **Immediate Consequences:** Unlike real deadlines (days away), HopperFocus's 5-15 minute timers create **instant accountability**.
3. **Visual Time Perception:** The shrinking timeline and visual timers bypass time blindness by making abstract time **spatially concrete**.

---

## 🚀 Tech Stack

### Backend (AI & Balance Tracking)
- **FastAPI** - High-performance async API
- **MongoDB** - Mana ledger (balance, wins, losses, quests completed)
- **Google Gemini 2.5 Flash** - AI task breakdown with JSON output
- **Motor** - Async MongoDB driver

### Frontend (Immersive UI)
- **React + TypeScript** - Component-based architecture
- **Vite** - Lightning-fast dev server
- **Tailwind CSS** - Utility-first styling with custom magical theme
- **Axios** - HTTP client for backend communication
- **ElevenLabs API** - Voice narration for task guidance

---

## 🎮 How to Use HopperFocus

### Step 1: Set Your Final Deadline
```
1. Click "Activate Timeline"
2. Input your project's actual due date
3. Watch the Time Turner render your shrinking runway
```

### Step 2: Generate Your Quest Log
```
1. Paste your syllabus/assignment text
2. AI breaks it into micro-tasks (5-15 min each)
3. Review the suggested contracts
```

### Step 3: Customize Your Contract
```
1. Click any task to open the Contract Customizer
2. Edit title, timer, stake, bounty
3. Assign it to a specific date on your timeline
4. Accept when ready
```

### Step 4: Enter Hyper-Focus Mode
```
1. Full-screen visual timer activates
2. Everything else disappears
3. Complete before timer hits zero
4. Claim bounty or lose stake
```

### Step 5: Beat Time Blindness
```
1. Watch your timeline shrink daily
2. Complete contracts assigned to "today"
3. Build momentum with small wins
4. Earn Mana and confidence
```

---

## 📊 MVP Feature Checklist

- ✅ Time Turner Timeline (horizontal visual progress bar)
- ✅ AI-powered task breakdown (Gemini 2.5 Flash)
- ✅ Contract Customizer (edit title, timer, stake, bounty, due date)
- ✅ Hyper-Focus Mode (full-screen visual timer)
- ✅ Mana Ledger (stakes, bounties, balance tracking)
- ✅ Loss Aversion Mechanics (real stakes at risk)
- ✅ Visual Timer Feedback (shrinking aura, color changes)
- ✅ ElevenLabs Voice Narration (Harry Potter themed)

---

## 🏃 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running on `localhost:27017`
- Google Gemini API key

### Backend Setup
```bash
cd hopperfocus/backend
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start server
python main.py
# Or: uvicorn main:app --host 127.0.0.1 --port 8004 --reload
```

Backend runs on: `http://127.0.0.1:8004`

### Frontend Setup
```bash
cd hopperfocus/frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5175`

---

## 🧪 Testing

```bash
# Comprehensive backend tests (10 tests)
python hopperfocus/backend/comprehensive_test.py

# End-to-end integration test
python hopperfocus/backend/test_e2e.py

# AI-only test
python hopperfocus/backend/test_gemini_direct.py
```

**Expected Results:**
- 9/10 backend tests pass
- E2E test completes full user flow
- AI generates 15-50 tasks per assignment

---

## 🎯 Addressing Time Blindness: Before & After

### Before HopperFocus (Standard To-Do List)
```
❌ "Write 10-page paper" - due in 2 weeks
   └─ Feels abstract, no urgency
   └─ You check it tomorrow, then tomorrow, then tomorrow
   └─ Panic on night before deadline

❌ Future reward (good grade) doesn't motivate today
❌ No immediate consequences for not starting
❌ Time passage is invisible
```

### After HopperFocus (Time Turner + Contracts)
```
✅ Visual timeline shows 14 days → shrinking to 13, 12, 11...
   └─ Time is now SPATIAL and SHRINKING

✅ Assignment broken into 20 micro-tasks
   - "Read 3 research papers (10 min)" - Due: Today, Stake: 10 Mana
   - "Outline introduction (5 min)" - Due: Tomorrow, Stake: 15 Mana
   - "Write paragraph 1 (10 min)" - Due: Day 3, Stake: 10 Mana
   
   └─ Each task has IMMEDIATE consequences (10-15 min)
   └─ Loss aversion kicks in (Mana at risk RIGHT NOW)
   └─ Visual timer makes time passage UNDENIABLE

✅ You complete 2-3 contracts per day
✅ Mana balance grows
✅ Project gets done with zero panic
```

---

## 💡 Hackathon Innovation

### What Makes HopperFocus Different?

**NOT another Pomodoro app:**
- Pomodoro = generic 25-minute timer (no stakes, no customization)
- HopperFocus = customizable contracts with real loss aversion

**NOT another AI task planner:**
- Generic planners = AI dictates, you obey
- HopperFocus = AI suggests, **you customize** stakes/timers/dates

**NOT another calendar app:**
- Calendars = static 30-day grids (abstract boxes)
- HopperFocus = dynamic shrinking timeline (visual urgency)

**The Unique Combination:**
1. AI-powered breakdown (scalable)
2. User customization (agency + manufactured adrenaline)
3. Visual time representation (combats time blindness)
4. Loss aversion mechanics (immediate consequences)
5. Hyper-focus immersion (eliminates distractions)

---

## 🏆 Target Tracks

- **Best Diversity & Inclusion** - Solves ADHD executive dysfunction through neurological accessibility
- **Best UI/UX** - Time Turner + Hyper-Focus Mode with immersive visual feedback
- **Best AI/ML Immersion** - Gemini-powered adaptive task breakdown
- **Best Use of Gemini API** - Structured JSON output for micro-task generation

---

## 📈 Future Roadmap

### Phase 1: Core Experience (✅ MVP Complete)
- Time Turner Timeline
- Contract Customizer
- Hyper-Focus Mode
- Mana Ledger

### Phase 2: Social Accountability
- Buddy system (wager with friends)
- Leaderboards (most contracts completed)
- Contract sharing (trade custom missions)

### Phase 3: Advanced AI
- Personalized difficulty adjustment
- Pattern recognition (when you fail most often)
- Adaptive stake suggestions
- Voice personality selection

---

## 🤝 Contributing

HopperFocus is built for the ADHD community. Contributions welcome!

**Areas to improve:**
- UI/UX refinements for visual timers
- More visual timer styles (hourglass, candle, etc.)
- Mobile app version (React Native)
- Browser extension (inject timers into any tab)

---

## 📄 License

MIT License - Built at WICSHackathon 2026

---

## 🙏 Acknowledgments

- **ADHD Research:** Dr. Russell Barkley's work on executive dysfunction
- **Behavioral Economics:** Kahneman & Tversky's loss aversion research
- **AI Partner:** Google Gemini 2.5 Flash API
- **ADHD Community:** For validating that time blindness is real and brutal

---

**Make time visible. Beat time blindness. Conquer ADHD. ⏰✨**
