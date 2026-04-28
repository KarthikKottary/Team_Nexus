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

## 🟡 Current Progress
- The core loop is fully functional: Users can register, log in, view role-specific dashboards, and log out.
- Participants can successfully trigger live emergency alerts.
- Admins can view alerts in real-time, track team commit status, and mark emergencies as resolved.
- GitHub webhooks are ready to be attached to real repositories for automatic tracking.

## 🔵 Next Steps

### 1. Other Planned Features
- **Frontend Profile Settings UI**: Build the frontend modal/page for Participants to use `apiUpdateTeam` to edit their repo link and team details.
- **Production Deployment**: Containerize the app using Docker, set up a CI/CD pipeline, and provision a live MongoDB Atlas instance.
- **Analytics & Export**: Add a feature for Admins to export a CSV report of all emergencies and final team commit counts at the end of the hackathon.
