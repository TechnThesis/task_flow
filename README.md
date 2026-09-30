# TaskFlow — Collaborative Task & Sprint Manager

A high-performance productivity workspace designed for agile engineering and product teams. Features interactive drag-and-drop Kanban boards, multi-dimensional task views (List, Calendar, Team Workload), real-time peer collaboration simulation, and AI-powered automated daily summaries powered by Google Gemini.

---

## ⚡ Features

### 1. Drag-and-Drop Kanban Board
- **Fluid Drag-and-Drop**: Built using native HTML5 drag-and-drop with drop-target highlights and column reordering.
- **Workflow Stages**: Default pipeline includes `Backlog`, `To Do`, `In Progress`, `In Review`, and `Done`.
- **Quick Actions**: Add tasks directly to any column with one click.
- **Zero-Pill Typography**: Strict metadata design discipline with unboxed text and clean typographic separators (`·`) for maximum readability.

### 2. Multi-View Productivity System
- **Kanban Board**: Visual overview of sprint state and progress.
- **High-Density List Grid**: Sortable table view with inline priority/status editors, subtask progress metrics, and tabular numerals (`tabular-nums`).
- **Sprint Schedule & Calendar**: Monthly view for tracking upcoming deadlines and identifying delivery milestones.
- **Team Workload Matrix**: Visualizes active load distribution, capacity hours, and completion rates per team member to prevent team bottlenecks.

### 3. Smart Task Management
- **Priorities**: Visual priority indicators (`Urgent`, `High`, `Medium`, `Low`).
- **Relative Due Dates**: Intelligent date labels (`Overdue by 1 day`, `Due today`, `Due tomorrow`, `Due in 3 days`).
- **Subtask Checklist**: Break tasks down into discrete checklist items with live completion bars.
- **Tags & Categories**: Filter and organize tasks by engineering, design, security, or product domains.

### 4. Real-Time Team Collaboration
- **Team Roster & Live Presence**: Track availability with member status indicators (`Active`, `In Meeting`, `Offline`).
- **Persona Switcher**: Seamlessly switch active viewpoints between Tech Lead, Senior Backend Engineer, Product Designer, Product Manager, and DevOps.
- **In-Task Discussions**: Leave threaded comments and updates directly on task cards.
- **Activity Audit Feed**: Real-time log tracking all task creations, status transitions, checklist completions, and notes.
- **Simulate Peer Collaboration**: Test and preview real-time collaborative activity with simulated team actions.

### 5. Automated Daily Summaries (Google Gemini 3.8 Flash)
- **Morning Standup Briefing**: Synthesizes the current sprint state into executive highlights, blockers, overdue items, and top priorities for the day.
- **Evening Progress Wrap-up**: Summarizes completed accomplishments, velocity, and items rolling over into tomorrow.
- **AI Task Auto-Breakdown**: Decomposes complex tasks into actionable subtasks with realistic time estimates using Gemini.
- **AI Smart Suggest**: Automatically suggests task priority, estimated hours, and tags based on the task title and description.
- **Offline Heuristic Fallback**: Generates structured executive summaries locally if an API key is not present or offline.
- **One-Click Export**: Copy briefings directly to clipboard or export as Markdown (`.md`).

---

## 🛠️ Tech Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Proxy**: [Express](https://expressjs.com/), [Vite](https://vitejs.dev/) with middleware integration
- **AI Engine**: [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Gemini 3.8 Flash)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Runtime**: Node.js / tsx

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TechnThesis/task_flow.git
   cd task_flow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional for local testing, required for Gemini AI features):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

---

## 📂 Project Structure

```
├── server.ts                  # Full-stack Express server + Vite middlewares + Gemini proxy
├── src/
│   ├── components/
│   │   ├── BoardView.tsx       # Drag-and-drop Kanban board view
│   │   ├── ListView.tsx        # High-density sortable table view
│   │   ├── CalendarView.tsx    # Sprint deadline schedule view
│   │   ├── WorkloadView.tsx    # Team workload analytics & capacity view
│   │   ├── TopNav.tsx          # 3-zone header following design constitution
│   │   ├── FilterBar.tsx       # Search, segmented controls & sprint telemetry
│   │   ├── TaskModal.tsx       # Task details, AI subtask breakdown, comments
│   │   ├── NewTaskModal.tsx    # Task creation with AI auto-suggest
│   │   ├── DailySummaryModal.tsx # Automated daily standup generator (Gemini)
│   │   └── TeamDrawer.tsx      # Team roster, presence & live activity feed
│   ├── data/
│   │   └── mockData.ts         # Initial sprint tasks, team members, activity logs
│   ├── services/
│   │   └── api.ts              # Client API service for Gemini summaries & breakdown
│   ├── types/
│   │   └── task.ts             # TypeScript definitions for tasks, teams, and filters
│   ├── utils/
│   │   └── dateUtils.ts        # Relative due date calculation helpers
│   ├── App.tsx                 # Root application controller with persistence
│   ├── main.tsx                # React DOM entrypoint
│   └── index.css               # Tailwind CSS imports and custom utility styles
├── index.html                  # HTML entry point with Plus Jakarta Sans & JetBrains Mono
├── package.json
└── tsconfig.json
```

---

## 📜 Available Scripts

- `npm run dev`: Runs the full-stack dev server via `tsx server.ts` on port 3000.
- `npm run build`: Builds the production bundle using Vite.
- `npm run lint`: Runs TypeScript compiler check (`tsc --noEmit`).
- `npm start`: Runs the production server via `tsx server.ts`.

---

## 📄 License

This project is licensed under the Apache 2.0 License.
