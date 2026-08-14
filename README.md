# 🌧️ HYDRA-X — Smart Urban Flooding & Drainage Management System

### Challenge 7 — IBM University Engagement | Domain: Urban Infrastructure

An Agentic AI-powered urban flooding and drainage management system for **Ahmedabad and Surat**, designed to predict flood-prone zones, optimize drainage maintenance, coordinate real-time civic response, support citizen flood reporting, monitor urban resilience, and assist with post-disaster damage assessment.

Powered by **IBM Granite LLM**, **IBM Granite 4-H Small**, **IBM watsonx.ai**, **IBM Cloud**, **React JS**, and a specialized multi-agent architecture.

---

## 🧭 Problem Statement

Rapid urbanization in cities like **Ahmedabad and Surat** has outpaced stormwater drainage infrastructure, causing:

- Frequent monsoon flooding
- Traffic disruption
- Property damage
- Poor predictive planning
- Delayed civic response

The objective is to create an **Agentic AI solution** that predicts flood-prone zones, optimizes drainage maintenance schedules, and coordinates real-time civic response during heavy rainfall events.

---

## 🎯 Objectives

HYDRA-X focuses on:

- Predicting flood-prone zones
- Optimizing drainage maintenance schedules
- Coordinating real-time civic response
- Supporting citizen flood reporting
- Providing an urban resilience dashboard
- Supporting post-disaster damage assessment

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **LLM** | IBM Granite LLM |
| **Foundation Model** | IBM Granite 4-H Small |
| **AI Platform** | IBM watsonx.ai |
| **Cloud** | IBM Cloud |
| **Frontend** | React JS |
| **Architecture** | Agentic AI / Multi-Agent Orchestration |
| **Deployment** | Public Web Application |

---

## 🤖 AI Agents Architecture

```text
                         User / Citizen
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React JS UI       │
                    │  User Interface     │
                    └──────────┬──────────┘
                               │
                               ▼
                  ┌─────────────────────────┐
                  │ Agentic AI Orchestration │
                  └────────────┬────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
 ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
 │ Flood Risk     │   │ Drainage       │   │ Civic Response │
 │ Prediction     │   │ Maintenance    │   │ Coordination   │
 │ Agent          │   │ Agent          │   │ Agent          │
 └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
         │                    │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌─────────────────┐  ┌─────────────────────┐
          │ Citizen Flood   │  │ Urban Resilience    │
          │ Reporting Agent │  │ Dashboard Agent     │
          └────────┬────────┘  └──────────┬──────────┘
                   │                      │
                   └──────────┬───────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │ Post-Disaster Damage     │
                 │ Assessment Agent         │
                 └────────────┬─────────────┘
                              │
                              ▼
                    Actionable Urban
                  Infrastructure Insights













🤝 Six Specialized AI Agents
Agent	Responsibility
Flood Risk Prediction Agent	Identifies and prioritizes flood-prone zones.
Drainage Maintenance Scheduling Agent	Prioritizes drainage maintenance activities and schedules.
Real-Time Civic Response Coordination Agent	Coordinates civic response during heavy rainfall and flooding.
Citizen Flood Reporting Agent	Captures and processes citizen-reported flooding incidents.
Urban Resilience Dashboard Agent	Presents operational insights for urban flood management.
Post-Disaster Damage Assessment Agent	Supports damage assessment after flood events.

The six agents collaborate around a shared flood-management workflow.

🧠 IBM Granite Integration

HYDRA-X uses IBM Granite LLM through IBM watsonx.ai as the AI foundation for the Agentic AI solution.

Model
Model: IBM Granite 4-H Small
Platform: IBM watsonx.ai
Cloud: IBM Cloud
Granite is used for
Natural-language understanding
Reasoning
Agentic AI capabilities
Flood-risk insights
Drainage maintenance prioritization
Civic response guidance
Citizen reporting support
Urban resilience insights
Post-disaster assessment support
🌊 LangFlow / Agentic Components

The solution architecture includes the following components:

1. User / Chat Input

Accepts user queries or operational information through the application interface.

2. IBM watsonx.ai / Granite Agent

Processes inputs and generates intelligent infrastructure-management responses.

3. IBM Granite 4-H Small

Foundation model specified for Challenge 7.

4. Agent Outputs

Provides:

Flood-risk insights
Maintenance priorities
Civic response guidance
Citizen reporting guidance
Urban resilience information
Damage assessment support
5. React JS UI

Provides the user-facing interface for interacting with the system.

6. Multi-Agent Orchestration

Coordinates the six specialized urban-flood-management agents.

🔄 Agentic AI Workflow
User / Citizen Input
        ↓
React JS User Interface
        ↓
Agentic AI Orchestration
        ↓
Flood Risk Prediction
        ↓
Drainage Maintenance Scheduling
        ↓
Civic Response Coordination
        ↓
Citizen Flood Reporting
        ↓
Urban Resilience Dashboard
        ↓
Post-Disaster Damage Assessment
        ↓
Actionable Urban Infrastructure Insights
🏗️ Architecture Blueprint
┌─────────────────────────────────────────────┐
│              Presentation Layer             │
│             React JS Web Interface          │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              Agentic AI Layer               │
│                                             │
│ Flood Risk • Maintenance • Civic Response  │
│ Citizen Reporting • Resilience • Damage    │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 Model Layer                 │
│        IBM Granite LLM / Granite 4-H Small │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             IBM AI & Cloud Layer            │
│          IBM watsonx.ai + IBM Cloud         │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             Deployment / Access             │
│             Public Web Application          │
└─────────────────────────────────────────────┘
📁 Project Structure
HYDRA-X/
├── backend/
│   ├── src/
│   └── package.json
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── app.json
├── problem-statement.pdf
├── project-presentation.pptx
├── start_project.bat
├── stop_project.bat
├── vercel.json
├── .gitignore
└── README.md

The repository may contain additional project-specific files and folders.

🚀 Quick Start
Prerequisites
Node.js 18+
npm 9+
IBM Cloud / watsonx.ai access for IBM Granite integration
Windows Quick Start
Double-click start_project.bat

The project can be started using the provided Windows batch file.

Manual Start
# Terminal 1 — Backend
cd backend
npm install
npm start


# Terminal 2 — Frontend
cd frontend
npm install
npm start

Use the commands defined in the project's actual package.json files if they differ.

🔑 IBM Credentials Setup

The Challenge 7 environment requires IBM credentials for the Granite integration.

Create a local .env file and configure the required credentials.

Example:

PROJECT_ID=your_watsonx_project_id
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_AI_URL=your_watsonx_ai_url
PORT=5000
Security

Never publish real IBM API keys, passwords, project credentials, or other secrets on GitHub.

Keep the real .env file local and add it to .gitignore.

If required, publish only an .env.example file containing placeholder values.

🧪 Demo / Fallback Mode

If IBM credentials are unavailable, the application may provide a clearly labelled demonstration or fallback mode depending on the implementation.

Demo responses should not be represented as live IBM Granite inference unless the IBM Granite integration is actually active.

🌐 Public Project Links
GitHub Repository

https://github.com/AlkaRaikwar/HYDRA-X

Live Project

https://hydra-x-nine.vercel.app/flood

📦 Required Submission Files

The Challenge 7 submission requires:

app.json
Problem Statement PDF
Project Presentation PPTX
Other applicable project files

The repository should contain these files when submitting the final project.

💡 Role of Agentic AI

Agentic AI enables HYDRA-X to operate as a coordinated set of specialized agents rather than a single chatbot.

Each agent performs a focused task:

Flood-risk prediction
Drainage maintenance scheduling
Real-time civic response
Citizen flood reporting
Urban resilience monitoring
Post-disaster damage assessment

The agents work together to transform incoming operational information into actionable insights for urban authorities and citizens.

This supports:

Proactive planning
Faster civic response
Better drainage management
Citizen participation
Improved post-event assessment
✨ Novelty & Uniqueness
1. Multi-Agent Intelligence

Six specialized agents address different operational tasks in urban flood management.

2. Predictive Planning

Flood-risk prediction supports proactive action before severe flooding.

3. Maintenance Optimization

The drainage maintenance agent helps prioritize infrastructure maintenance activities.

4. Real-Time Coordination

The civic response agent supports coordinated action during heavy rainfall and flooding.

5. Citizen Participation

Citizen flood reporting adds on-ground information to the urban flood-management workflow.

6. Resilience & Recovery

Urban resilience monitoring and post-disaster damage assessment extend the solution beyond simple flood prediction.

🔮 Future Scope
1. Real-Time Weather & Rainfall Integration

Connect rainfall forecasts and live weather signals to improve flood-risk prediction.

2. IoT / Drain Sensors

Integrate water-level and blockage sensors for continuous drainage monitoring.

3. Automated Civic Alerts

Trigger prioritized notifications for authorities and field teams during high-risk events.

4. Mobile Citizen Reporting

Expand citizen reporting with location, photos, and incident severity.

5. Advanced Damage Assessment

Use images and geospatial data to improve post-disaster assessment.

6. City-Scale Expansion

Extend the architecture beyond Ahmedabad and Surat to other flood-prone cities.

⚠️ Safety & Limitations
HYDRA-X is an AI-assisted urban infrastructure decision-support system.
AI-generated recommendations should be validated by responsible civic authorities.
The system should not replace official emergency-management procedures.
Demonstration data should not be represented as real government or emergency data unless verified.
Production deployment would require proper validation, security, privacy, and operational integration.
📊 Token Usage

Token usage data was not provided in the Challenge 7 source material.

Therefore, no token numbers are claimed in this README.

🏆 Challenge 7 Summary

Challenge: Smart Urban Flooding & Drainage Management System for Ahmedabad–Surat

Domain: Urban Infrastructure

AI: IBM Granite LLM

Foundation Model: IBM Granite 4-H Small

AI Platform: IBM watsonx.a




