# Smart On-Site Hackathon Management System 🚀

A real-time, high-impact "Mission Control" system designed specifically to monitor, track, and manage live 24-hour hackathons. This is not a generic marketing page — it's a futuristic, dark-themed dashboard built to give event organizers instant visibility into team progress and critical emergencies.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React.js powered by Vite (for lightning-fast HMR)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark theme, glassmorphism, dynamic gradients)
- **Animations:** Framer Motion & Custom WebGL Shaders
- **Icons:** Lucide-React
- **Routing:** React Router v6

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose) + `mongodb-memory-server` for local testing
- **Real-Time:** Socket.io
- **Utilities:** CORS, dotenv, nodemon, JWT (jsonwebtoken), bcryptjs

---

## ✨ Key Features

1. **Mission Control Landing Page:**
   - Custom WebGL animated shader background.
   - High-contrast Call-To-Action entry points.
2. **Admin Dashboard (The Eye):**
   - **Real-Time WebSockets:** Instantly streams new emergencies and team commits directly to the UI without refreshing.
   - **Live Emergency Alerts:** Glowing red, priority-based notification cards for medical or technical failures.
   - **Project Activity Tracker:** Tracks team GitHub commits and project status (🟢 Active / 🟡 Idle / 🔴 Inactive).
   - **System Status:** Top-level metrics on active teams and system health.
3. **Team Portal:**
   - **GitHub Webhook Integration:** Live webhook endpoint (`/api/teams/:id/webhook`) that automatically parses GitHub push events to update commit counts.
   - Individual team views showing members and recent commit history.
   - A critical "Trigger Emergency Alert" feature to instantly page event organizers.
4. **Secure Access Portal:**
   - Futuristic, minimalist authentication screen to access the system.
   - Role-based access control (Admin vs. Participant).

---

## 📂 Project Structure

```text
hack/
├── backend/                  # Node/Express Server
│   ├── .env.example          # Environment variables template
│   ├── package.json          # Backend dependencies
│   └── server.js             # Express entry point & DB connection
│
├── frontend/                 # Vite React Client
│   ├── index.html            # HTML entry
│   ├── tailwind.config.js    # Tailwind theme & plugin settings
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite build & alias settings
│   └── src/
│       ├── App.tsx           # Main router & layout root
│       ├── main.tsx          # React DOM entry
│       ├── index.css         # Global styles & Tailwind layers
│       ├── components/
│       │   ├── dashboard/    # AlertCards, StatusBadges
│       │   ├── layout/       # Sidebar navigation
│       │   └── ui/           # Atomic components (e.g. animated-shader-hero)
│       └── pages/            # View components (Admin, Team, Landing, Auth)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Optional: A MongoDB Connection URI (Atlas) - If not provided, an in-memory database will run automatically for testing!

### 1. Backend Setup
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
```
Start the development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```
*Note: If no Atlas URI is provided in the `.env` file, the server uses `mongodb-memory-server` and pre-seeds demo users and alerts!*

### 2. Frontend Setup
Open a new terminal window in the `frontend` directory:
```bash
cd frontend
npm install
```
Start the Vite development server:
```bash
npm run dev
# App will run on http://localhost:5173
```
*Note: The frontend is configured to proxy API requests to `/api` locally avoiding any CORS issues.*

### 🔑 Demo Login Credentials
When starting with the seeded memory database, you can log in using:
- **Admin Role:** `admin@hackathon.dev` / `admin123`
- **Participant Role:** `alice@hackathon.dev` / `alice123`

---

## 🎨 Design Philosophy
This system adheres to a strict "Dark Theme" architecture. It completely avoids generic SaaS white backgrounds in favor of deep navy and black tones (`bg-gray-950`). 
- **Orange/Yellow** accents represent general activity and warnings.
- **Red** accents are strictly reserved for emergency alerts and critical system failures.
- **Green** is utilized sparsely to verify active systems and nominal operations.

---

## 📈 Development Tracking
See [progress.md](./progress.md) to track completed tasks, current status, and upcoming features.
