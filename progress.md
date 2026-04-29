# Project Progress Log

Updates must align with commits to ensure transparency of work done.

## 🟢 Tasks Completed
- **Project Structure**: Initialized Vite React frontend and Node.js/Express backend.
- **UI Architecture**: Developed glassmorphism dark-theme layout using Tailwind CSS and Framer Motion.
- **Frontend Pages**: Built Landing Page, Auth Page, Admin Dashboard, and Team Dashboard.
- **Database Models**: Created `User`, `Team`, and `Alert` Mongoose schemas.
- **API Endpoints**: 
  - `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
  - `GET /api/teams`, `POST /api/teams/:id/commit`, `PATCH /api/teams/:id`
  - `GET /api/alerts`, `POST /api/alerts`, `PATCH /api/alerts/:id/resolve`
- **Authentication**: Implemented JWT signing, bcrypt password hashing, and role-based access control middleware (`admin` vs `participant`).
- **Real-Time WebSockets**: Integrated `socket.io` to instantly push live emergency alerts and team commits directly to the Admin Dashboard without manual refreshes.
- **GitHub Webhooks**: Created `POST /api/teams/:id/webhook` endpoint to automatically parse GitHub Push events and update team commit history.
- **Profile Management Backend**: Updated API access controls so participants can update their own team's repository details.
- **Team & Participant Management**: Implemented a secure system for users to create and join teams (`POST /api/teams/create`, `POST /api/teams/join`, `GET /api/teams/details`). Ensures users cannot join multiple teams and maintains a 1:1 relationship between participants and teams. Updated Participant dashboard to handle team creation/joining logic and display a randomized Join Code.
- **Frontend Integration**: Built `AuthContext` to manage local session state. Configured Axios/Fetch client to attach Bearer tokens.
- **Deployment Convenience**: 
  - Integrated `mongodb-memory-server` to automatically spin up a local DB and seed demo data if no Atlas URI is provided.
  - Setup Vite proxy (`/api`) to gracefully bypass CORS.
- **Frontend Profile Settings UI**: Built an animated settings modal for Participants to dynamically edit their repository link and team name.
- **Production Deployment**: Containerized the entire stack with Docker (`frontend` and `backend` Dockerfiles), managed orchestration via `docker-compose`, and implemented a CI/CD GitHub Actions pipeline.
- **Analytics & Export**: Created a secure admin endpoint to export an aggregated CSV report of all emergencies and team commits using `json2csv`, and integrated a direct download button on the frontend Settings dashboard.
- **GitHub Project Tracking API**: Implemented `POST /api/github/fetch` to allow on-demand repository analysis. It parses GitHub URLs, queries the GitHub API for commit metrics, calculates activity status, handles rate limits, and is seamlessly integrated into both the Admin Projects dashboard and the Participant Team Dashboard via manual sync buttons.
- **Intelligent Orchestrator**: Designed an event-driven centralized decision engine utilizing Redis Pub/Sub and Node.js. It actively listens to cross-system events (`new_alert`, `github_activity`, `inactivity_detected`) via decoupling, triggering rule-based decisions like broadcasting global warnings on fire alerts or dispatching inactivity warnings via `node-cron` schedulers.
- **Context-Aware AI Chatbot**: Built a floating chat assistant (`ChatbotWidget.tsx`) directly into the Participant dashboard over WebSockets. The backend handles live context injection (active emergencies, user's team, commit counts) and resolves queries via OpenAI (`gpt-3.5-turbo`) or a robust rule-based MongoDB FAQ fallback engine if no API key is provided. Features typing indicators and human coordinator escalation.
- **Intelligent Room Allocation System**: Engineered a backend allocation algorithm using Node.js and MongoDB to intelligently assign rooms based on team clustering (prioritizing identical colleges), optimizing capacity, and identifying conflicts.
- **Context-Aware Notice Board**: Designed a real-time (Socket.io) phase-aware notice board allowing admins to broadcast role-specific messages (e.g., "Submission closing soon" to participants during the "submission" phase) directly to dashboard UI widgets.
- **Smart Refreshment Management**: Created a batch-based meal scheduler using `node-cron`. The system dynamically splits active teams into cohorts and sends staggered, targeted meal invitations via Socket.io to prevent physical crowding.
- **Intelligent Leaderboard & Predictions**: Built a Chart.js-powered visual leaderboard evaluating teams on Innovation, Technical, and Impact metrics. Integrated a lightweight predictive rule engine (zero heavy ML) to flag "Rising Stars", "Top Performers" (based on high commit velocity and above-average scores), and "At-Risk Teams" (extended inactivity or critically low scores).
- **Checkpoints & Warnings Framework**: Established an automated phase tracking system. `node-cron` listeners track checkpoint deadlines, dispatch 30-minute auto-reminders, detect missed submissions, and send targeted urgent Socket.io warnings to idle teams.
- **Multi-Agent Architecture Rewrite**: Fully refactored the monolith orchestrator into a decoupled, Event-Driven Multi-Agent System (EventEmitter/Redis). Created autonomous `EmergencyAgent`, `ActivityAgent`, and `NotificationAgent` modules that react to internal events independently to dictate system flow.

## 🟡 Current Progress
- The core loop is fully functional: Users can register, log in, view role-specific dashboards, and log out.
- Participants can successfully trigger live emergency alerts.
- Admins can view alerts in real-time, track team commit status, and mark emergencies as resolved.
- GitHub webhooks are ready to be attached to real repositories for automatic tracking.

## 🔵 Next Steps

### 1. Polish & QA
- **User Acceptance Testing (UAT)**: Verify full workflow across different simulated user devices.
- **Cloud Database Cutover**: Switch `MONGO_URI` to a production MongoDB Atlas cluster before live launch.
