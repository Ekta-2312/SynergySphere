# 🚀 SynergySphere – Advanced Team Collaboration Platform

A full-stack project management and collaboration platform built during _Odoo Hackathon 2025_.  
SynergySphere goes beyond basic task tracking by acting as the _central nervous system for teams_ — helping them stay aligned, communicate effectively, and make smarter decisions.

---

## 🌟 Vision

Teams do their best work when their tools truly support how they _think, communicate, and move forward together_.  
SynergySphere addresses common team pain points:

- 🔎 Scattered information across multiple tools
- 📉 Lack of visibility into project progress
- ⏰ Deadline surprises and poor resource allocation
- 📬 Communication gaps and missed updates

Our MVP delivers a clean, responsive _desktop and mobile-ready_ platform to solve these issues.

---

## ✨ Features (MVP)

- _User Authentication_: JWT & Google OAuth login, email verification with OTP
- _Project Management_: Create, edit, and manage projects with deadlines & statuses
- _Task Boards_: Kanban-style task management with assignees, priorities, and due dates
- _Team Collaboration_: Project-specific threaded discussions and notifications
- _Responsive UI_: Mobile-first design for on-the-go use
- _Notifications_: Real-time alerts for key project events

---

## 🛠 Tech Stack

### Frontend

- React + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Context API (state management)

### Backend

- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT + Passport.js (auth)
- Nodemailer (email/OTP)
- bcryptjs, CORS, express-session (security)

---

## 📂 Project Structure

project/
│── backend/ # Express + MongoDB backend
│── frontend/ # React + Vite + Tailwind frontend
│── README.md # You are here

---

## ⚡ Quick Start

### 1. Clone the repository

bash
git clone <repository-url>
cd project

### 2. Backend Setup

bash
cd backend
npm install

Create .env file in /backend:
env
MONGODB_URI=mongodb://localhost:27017/synergysphere
JWT_SECRET=your-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
SESSION_SECRET=your-session-secret
NODE_ENV=development

Start backend:
bash
npm start

### 3. Frontend Setup

bash
cd ../frontend
npm install
npm run dev

Access app at: [http://localhost:5173](http://localhost:5173)

---

## 📊 Core API Endpoints (Backend)

### Authentication

- POST /api/auth/register → Register user
- POST /api/auth/verify → Verify OTP
- POST /api/auth/login → Login user

### Projects

- GET /api/projects → List projects
- POST /api/projects → Create project
- GET /api/projects/:id → Project details

### Tasks

- GET /api/tasks/project/:projectId → Project tasks
- POST /api/tasks → Create task

### Discussions

- GET /api/discussions/project/:projectId → Project discussions
- POST /api/discussions → New discussion

### Notifications

- GET /api/notifications → All notifications
- GET /api/notifications/unread-count → Unread count

---

## 🗄 Database Schema (Mongoose)

### User

js
{
name: String,
email: { type: String, unique: true },
password: String, // hashed
provider: String, // local/google
isVerified: Boolean,
otpHash: String,
otpExpires: Date,
createdAt: Date
}

### Project

js
{
title: String,
description: String,
owner: ObjectId(User),
members: [ObjectId(User)],
status: String,
color: String,
dueDate: Date,
createdAt: Date
}

### Task

js
{
title: String,
description: String,
project: ObjectId(Project),
assignee: ObjectId(User),
creator: ObjectId(User),
status: String, // todo/in-progress/in-review/done
priority: String, // low/medium/high/urgent
dueDate: Date,
tags: [String]
}

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT authentication & role-based access control
- OTP email verification
- CORS protection
- Input validation

---

## 🎨 Screenshots

Add 2–3 screenshots here: Login page, Dashboard, Task Board  
(Hackathon judges love seeing visual proof of implementation.)

---

## 📌 Future Enhancements

- AI-powered task prioritization
- Advanced analytics & reporting
- Third-party integrations (Slack, Google Drive, Odoo ERP)
- Push notifications (mobile/web)

---

## 👩‍💻 Team & Contributions

- [Your Name] – Full-stack Developer

---

## 📜 License

This project is licensed under the _ISC License_.

---
