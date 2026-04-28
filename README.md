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
- **Database:** MongoDB Atlas (Mongoose)
- **Utilities:** CORS, dotenv, nodemon

---

## ✨ Key Features

1. **Mission Control Landing Page:**
   - Custom WebGL animated shader background.
   - High-contrast Call-To-Action entry points.
2. **Admin Dashboard (The Eye):**
   - **Live Emergency Alerts:** Glowing red, priority-based notification cards for medical or technical failures.
   - **Project Activity Tracker:** Real-time visibility into team GitHub commits and project status (🟢 Active / 🟡 Idle / 🔴 Inactive).
   - **System Status:** Top-level metrics on active teams and system health.
3. **Team Portal:**
   - Individual team views showing members and recent commit history.
   - A critical "Trigger Emergency Alert" feature to instantly page event organizers.
4. **Secure Access Portal:**
   - Futuristic, minimalist authentication screen to access the system.

---

## 📂 Project Structure

\`\`\`text
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
\`\`\`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A MongoDB Connection URI (Local or Atlas)

### 1. Backend Setup
Open a terminal in the \`backend\` directory:
\`\`\`bash
cd backend
npm install
\`\`\`
Copy the environment variables template and configure your Database:
\`\`\`bash
cp .env.example .env
# Edit .env and insert your MongoDB URI
\`\`\`
Start the development server:
\`\`\`bash
npm run dev
# Server will run on http://localhost:5000
\`\`\`

### 2. Frontend Setup
Open a new terminal window in the \`frontend\` directory:
\`\`\`bash
cd frontend
npm install
\`\`\`
Start the Vite development server:
\`\`\`bash
npm run dev
# App will run on http://localhost:5173
\`\`\`

---

## 🎨 Design Philosophy
This system adheres to a strict "Dark Theme" architecture. It completely avoids generic SaaS white backgrounds in favor of deep navy and black tones (`bg-gray-950`). 
- **Orange/Yellow** accents represent general activity and warnings.
- **Red** accents are strictly reserved for emergency alerts and critical system failures.
- **Green** is utilized sparsely to verify active systems and nominal operations.
