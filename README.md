# Smart On-Site Hackathon Management System 🚀

A real-time, high-impact "Mission Control" system designed specifically to monitor, track, and manage live 24-hour hackathons. This futuristic, dark-themed dashboard is built to give event organizers instant visibility into team progress, active projects, and critical emergency alerts.

---

## 🛠️ Tech Stack

**Frontend:**
- **Framework:** React.js powered by Vite (lightning-fast HMR)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark theme, glassmorphism, dynamic gradients)
- **Animations:** Framer Motion & Custom WebGL Shaders
- **Icons:** Lucide-React
- **Routing:** React Router v6

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose) + `mongodb-memory-server` for local fallback
- **Real-Time:** Socket.io
- **Utilities:** CORS, dotenv, nodemon, JWT (jsonwebtoken), bcryptjs, json2csv

**DevOps:**
- **Containerization:** Docker & Docker Compose
- **CI/CD Pipeline:** GitHub Actions

---

## ✨ Key Features

1. **Mission Control Landing Page:**
   - Custom WebGL animated shader background.
   - High-contrast Call-To-Action entry points.

2. **Admin Dashboard (System Control Room):**
   - **Segmented Architecture:** Strict separation of concerns (Overview, Teams, Alerts, Projects, Settings).
   - **Real-Time WebSockets:** Instantly streams new emergencies and team commits directly to the UI without refreshing.
   - **Emergency Alert Management:** Dedicated tab to track and resolve medical/technical failures with real-time glowing notifications.
   - **Analytics & Export:** Download a consolidated `.csv` report of all active/resolved emergencies and final team project metrics.

3. **Participant Portal (Team Dashboard):**
   - **Team Management:** Create new teams or join existing ones via generated Join Codes.
   - **Profile Settings:** Seamlessly edit your team's name and GitHub repository link.
   - **GitHub Webhook Integration:** Live webhook endpoint (`/api/teams/:id/webhook`) to parse GitHub push events and automatically update commit counts.
   - **Emergency Trigger:** A critical feature to instantly page event organizers for immediate assistance.

4. **Robust Security & Auth:**
   - Role-based access control (`admin` vs `participant`).
   - Secure JWT token handling and Bcrypt password hashing.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18 or higher)
- Optional: A MongoDB Connection URI (Atlas). If not provided, an in-memory database will run automatically for testing!

### 1. Backend Setup
Open a terminal in the `backend` directory:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder (optional):
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
# MONGO_URI=your_mongodb_atlas_connection_string_here
```
*(If `MONGO_URI` is left blank, the server will gracefully fallback to a temporary `mongodb-memory-server`!)*

Start the development server:
```bash
npm run dev
# Server will run on http://localhost:5000
```

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

### 🔑 Note on Databases and Accounts
Because the system runs on an in-memory database by default (if no Atlas string is provided), **all data is wiped upon a server restart**. You will need to click **"Register a new operator"** on the Auth page to create your Admin or Participant account before logging in.

---

## 🐳 Production Deployment (Docker)

The application is completely containerized for seamless production deployment.

1. Ensure Docker and Docker Compose are installed.
2. In the root directory, create a `.env` file containing your production variables:
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hackathon
   JWT_SECRET=production_secure_secret
   ```
3. Build and launch the containers:
   ```bash
   docker-compose up --build -d
   ```
4. The system will be available at `http://localhost:80`.

---

## 🎨 Design Philosophy
This system adheres to a strict "Dark Theme" architecture. It completely avoids generic SaaS white backgrounds in favor of deep space navy and black tones (`bg-gray-950`). 
- **Purple/Blue** accents represent primary navigation and general data.
- **Red** accents are strictly reserved for emergency alerts and critical system failures.
- **Green** is utilized to verify active systems, successful operations, and nominal project status.

---

## 📈 Development Tracking
See [progress.md](./progress.md) to track completed tasks, current status, and upcoming features.
