# Samvada Voice AI Platform — Frontend Portal

[![React Version](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2_(Strict)-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

> **Multi-Tenant Voice Operations & Real-Time Call Management Portal**  
> High-performance React SPA featuring an interactive Agent Studio, live audio wave visualizers, campaign management, and telephony provisioning.

---

## ✨ Features & Capabilities

- **Voice Agent Studio:** Visual configuration of agent system prompts, voice models, telephony assignments, and RAG knowledge bases.
- **Live Call Console:** Real-time conversational streaming with animated audio waveforms (`AnimatedVoiceWave.tsx`) and live transcription.
- **Outbound Campaign Orchestrator:** Bulk contact uploads, dialing schedule controls, and completion analytics.
- **Zero-Storage Security:** All access and refresh tokens are managed via secure `HttpOnly` cookies — 100% immune to XSS token theft.
- **Tenant Context Isolation:** Seamless workspace and organization switching with permission caching.
- **Dual-Theme Design System:** Built-in support for portal light and dark themes using CSS design tokens.

---

## 🗺️ Portal Screens & Route Directory

| Route | Page Component | Description |
|---|---|---|
| `/` | `LandingPage.tsx` | Platform introduction, value proposition, and live interactive audio demos |
| `/login` | `LoginPage.tsx` | Passwordless Email + OTP login with 30s resend timer |
| `/onboarding/*` | `OnboardingWizardPage.tsx` | Multi-step workspace setup, industry categorization, and initial profile |
| `/dashboard` | `DashboardOverviewPage.tsx` | Call volume trends, active concurrency gauge, recent calls, and agent health |
| `/agents` | `AgentListPage.tsx` | Voice agent catalog, status toggles, and performance summary |
| `/agents/create` | `AgentCreatePage.tsx` | 4-step wizard: persona prompt, voice selection, knowledge base, review |
| `/ai-studio` | `AiAgentStudioPage.tsx` | Interactive workflow canvas with drag-and-drop prompt nodes |
| `/calls` | `CallHistoryPage.tsx` | Filterable call history, sentiment tags, duration, and audio playback |
| `/calls/live` | `LiveCallConsolePage.tsx` | Real-time audio stream monitor with live transcript & supervisor controls |
| `/campaigns` | `CampaignListPage.tsx` | Outbound dialer scheduler, audience target selection, and progress bars |
| `/contacts` | `ContactsPage.tsx` | CRM contact management, bulk CSV uploads, and dialing status |
| `/knowledge` | `KnowledgebasePage.tsx` | Document upload (PDF, DOCX) and RAG vector indexing status |
| `/telephony` | `PhoneNumbersPage.tsx` | Inbound/outbound phone number inventory and SIP trunk binding |
| `/analytics` | `AnalyticsPage.tsx` | P50/P95 latency breakdown, CSAT trends, and conversion funnels |
| `/observability` | `ObservabilityPage.tsx` | Real-time system health, error rates, and active WebSocket sessions |
| `/settings/*` | `SettingsPage.tsx` | API keys, webhooks, team member invitations, and billing wallet |

---

## 📁 Directory Architecture

```
frontend-improved/
├── src/
│   ├── api/                   # 14 domain-driven Axios client modules
│   │   ├── client.ts          # Central client with token refresh & tenant header interceptors
│   │   └── auth.ts, agents.ts, campaigns.ts, telephony.ts, ...
│   ├── constants/             # Centralized route registry (routes.ts) & API config (api.ts)
│   ├── components/
│   │   ├── common/            # ErrorBoundary, AudioPlayer
│   │   ├── layout/            # AppLayout, Sidebar, Header
│   │   ├── modals/            # Modals (Agent creation, Campaign launch, Contacts)
│   │   └── ui/                # 13 reusable UI primitives (Button, Card, Modal, Waveforms)
│   ├── contexts/              # AuthContext, WorkspaceContext, ToastContext
│   ├── pages/                 # 17 feature page modules (all lazy-loaded via React.lazy)
│   ├── router/                # Central route map with ProtectedRoute guards
│   ├── styles/                # Tailwind CSS + Portal Light theme tokens
│   ├── types/                 # 411 lines of comprehensive TypeScript domain models
│   └── utils/                 # Formatting, session storage, and navigation helpers
├── .env.example               # Environment variables template
├── Dockerfile                 # Multi-stage production container (Node + NGINX)
└── vite.config.ts             # Dev proxy configuration to backend microservices
```

---

## ⚡ Quick Start

### 1. Environment Configuration
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Default variables:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8084
```

### 2. Install & Run
```bash
# Install dependencies
pnpm install

# Start Vite development server with proxy
pnpm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)**.

---

## 🛠️ Build & Verification

```bash
# Typecheck TypeScript without emitting bundle
npx tsc --noEmit

# Run ESLint
pnpm run lint

# Compile production bundle
pnpm run build

# Preview production build locally
pnpm run preview

# Build Docker image
docker build -t samvada-frontend .
```
