# SwasthyaSetu — Rural & Tribal Healthcare Access Agent

> **IBM Hackathon · Problem Statement #19**
> Agentic AI for rural healthcare in tribal belts — Dangs, Narmada, Chhota Udepur, Gujarat

---

## Problem Statement

Tribal communities in the Dangs, Narmada, and Chhota Udepur districts of Gujarat face severe healthcare access gaps:
- Long distances to healthcare facilities
- Critical shortage of specialists
- ASHA workers stretched across large rural areas with limited tools
- Limited connectivity and low digital literacy

## Solution

**SwasthyaSetu** (Bridge to Health) is an Agentic AI system powered by IBM Granite that:

1. Provides multilingual (Gujarati/English) AI-assisted symptom triage
2. Classifies severity (ROUTINE / MODERATE / URGENT / EMERGENCY)
3. Recommends appropriate next steps including teleconsultation
4. Helps ASHA and PHC workers track medicine inventory
5. Monitors chronic patient follow-up schedules with automated alerts

---

## Architecture

```
Patient Input (Gujarati/English text or voice)
        ↓
  [Triage Agent]         ← IBM Granite LLM
        ↓
  [Severity Agent]       ← Classification logic
        ↓
  ┌─────────────────┐
  │                 │
  ▼                 ▼
[Teleconsult     [Emergency
  Agent]          Escalation]
        ↓
  ASHA/PHC Dashboard

ASHA/PHC Worker
        ↓
  [Stock Agent]          ← Inventory monitoring
        ↓
  Low-stock / expiry alerts

  [Follow-up Agent]      ← Chronic patient tracking
        ↓
  Overdue / due-today alerts
```

**Tech stack:**
- **AI:** IBM Granite 3.3 8B Instruct via IBM watsonx.ai
- **Backend:** Node.js + Express
- **Frontend:** React 18 + React Router
- **Language support:** Gujarati (gu-IN), English (en-IN)
- **Voice input:** Web Speech API (browser-native; Gujarati supported in Chrome)

---

## AI Agents

| Agent | Role |
|-------|------|
| **Triage Agent** | Analyses patient symptoms and produces preliminary triage |
| **Severity Agent** | Classifies severity: ROUTINE / MODERATE / URGENT / EMERGENCY |
| **Teleconsult Agent** | Recommends specialist, provides scheduling interface |
| **Stock Agent** | Monitors medicine inventory, generates reorder recommendations |
| **Follow-up Agent** | Tracks chronic patient follow-ups, flags overdue cases |

All agents are orchestrated through the backend API. The triage → severity → teleconsult flow runs automatically on symptom submission.

---

## IBM Granite Integration

The system uses **`ibm/granite-3-3-8b-instruct`** via the watsonx.ai Chat API.

- **Triage & Severity:** Granite receives patient data and returns a structured JSON triage result
- **Teleconsult reasoning:** Granite explains why teleconsultation is recommended
- **Stock & Follow-up summaries:** Granite generates prioritised action summaries

**Demo Mode:** Without IBM credentials, the system uses rule-based triage and clearly labelled demo responses. The full UI and workflow remain demonstrable.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in your credentials:

```env
WATSONX_API_KEY=your_ibm_watsonx_api_key
PROJECT_ID=your_watsonx_project_id
WATSONX_AI_URL=https://us-south.ml.cloud.ibm.com
PORT=5000
```

Obtain credentials from [IBM Cloud](https://cloud.ibm.com):
1. Create an IBM Cloud account
2. Create a watsonx.ai project
3. Generate an API key under IAM

---

## Project Structure

```
swasthyasetu/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server
│   │   ├── agents/
│   │   │   ├── triageAgent.js    # Triage + Severity agents
│   │   │   ├── teleconsultAgent.js
│   │   │   ├── stockAgent.js
│   │   │   └── followUpAgent.js
│   │   ├── services/
│   │   │   ├── granite.js        # IBM Granite / watsonx client
│   │   │   └── store.js          # In-memory data store + demo data
│   │   └── routes/
│   │       ├── triage.js
│   │       ├── teleconsult.js
│   │       ├── stock.js
│   │       ├── followup.js
│   │       ├── dashboard.js
│   │       └── insights.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js                # Router + sidebar + toast
│   │   ├── index.css             # Global styles
│   │   ├── services/api.js       # Axios API client
│   │   └── pages/
│   │       ├── HomePage.js
│   │       ├── TriagePage.js
│   │       ├── TeleconsultPage.js
│   │       ├── DashboardPage.js
│   │       ├── StockPage.js
│   │       ├── FollowUpPage.js
│   │       └── InsightsPage.js
│   └── package.json
├── start_project.bat
├── stop_project.bat
├── .gitignore
└── README.md
```

---

## Installation & Running

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### Quick Start (Windows)

```
Double-click start_project.bat
```

The script will:
1. Install backend dependencies (first run)
2. Install frontend dependencies (first run)
3. Start backend on port 5000
4. Start frontend on port 3000
5. Open browser to http://localhost:3000

### Manual Start

```bash
# Terminal 1 — Backend
cd backend
npm install
node src/index.js

# Terminal 2 — Frontend
cd frontend
npm install
set PORT=3000 && npx react-scripts start
```

### Stop (Windows)

```
Double-click stop_project.bat
```

---

## Demo Mode

Without IBM credentials, the application runs in **Demo Mode**:

- All AI outputs are generated by rule-based logic
- Demo patient data from Dangs, Narmada, Chhota Udepur is pre-loaded
- All UI flows (triage → severity → teleconsult → dashboard) are fully functional
- Clearly labelled "Demo AI" / "Demo Data" throughout the UI

---

## Demo Scenario

### Flow 1: Patient Triage
1. Go to **Patient Triage**
2. Enter: Age 45, Female, Village: Subir Dangs, Symptoms: "high fever, severe headache, body ache"
3. Triage Agent classifies → **URGENT**
4. Severity Agent explains reasoning
5. Teleconsult recommended → click Schedule Teleconsultation
6. Case appears in ASHA/PHC Dashboard

### Flow 2: Medicine Stock Alert
1. Go to **Medicine Stock**
2. Stock Agent automatically detects: ORS Sachet — CRITICAL (qty 12, min 50)
3. Recommendation generated for emergency resupply
4. Alert shown on Dashboard

### Flow 3: Chronic Patient Follow-up
1. Go to **Patient Follow-ups**
2. Follow-up Agent shows: Bhaviben Gamit (Diabetes) — OVERDUE by 3 days
3. ASHA worker recommendation generated
4. Mark as completed → next follow-up auto-scheduled

---

## Safety & Limitations

⚠️ **IMPORTANT DISCLAIMER**

- This system provides **preliminary AI-assisted decision support only**
- It does **NOT** diagnose disease, prescribe medication, or replace a qualified doctor
- Emergency symptoms are always escalated to professional emergency care (108)
- All data shown is demonstration data only — not real patient or government data
- For real deployment, clinical validation, regulatory approval, and data privacy compliance would be required

---

## URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Health Check | http://localhost:5000/api/health |

---

## IBM Granite Model

**Model:** `ibm/granite-3-3-8b-instruct`  
**Platform:** IBM watsonx.ai  
**API:** Chat Completions (`/ml/v1/text/chat`)  
**Features used:** Multilingual reasoning, structured JSON output, Gujarati language support

---

*Built for IBM Hackathon · Problem Statement #19 · Rural & Tribal Healthcare Access*
