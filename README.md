# 🚀 PingUp – Full Stack Social Media Platform


🌐 **Live Demo:** https://ping-up-eight-vert.vercel.app/


![React](https://img.shields.io/badge/Frontend-React-blue)
![Node](https://img.shields.io/badge/Backend-Node.js-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Redux](https://img.shields.io/badge/State-Redux%20Toolkit-purple)
![Clerk](https://img.shields.io/badge/Auth-Clerk-orange)

PingUp is a **full-stack social media web application** where users can create posts, share stories, connect with others, and chat in real time.

The platform includes **authentication, real-time messaging, notifications, and a responsive UI** for a smooth user experience.

---

# ✨ Features

## 👤 Authentication
- Secure authentication using **Clerk**
- User signup and login
- Protected routes and middleware

---

## 📝 Posts
- Create posts with images
- Like posts
- Delete posts
- Feed displaying posts from users

---

## 📖 Stories
- Create stories with **text, images, or videos**
- Story preview before posting
- Delete stories
- Story viewer feature

---

## 👥 Connections
- Send connection requests
- Accept connection requests
- Followers & Following system
- Manage connections

---

## 💬 Real-Time Chat
- Send and receive messages instantly
- Image messages supported
- Messages auto-scroll
- Clean messaging interface

---

## 🔔 Notifications
- Real-time notifications using **Server-Sent Events (SSE)**
- Custom toast notifications
- Reply directly from notification

---

## 📬 Recent Messages
- Sidebar showing recent conversations
- Unseen message indicator
- Sorted by latest activity

---

## 👤 Profile
- View user profiles
- Edit profile information
- Upload profile and cover images

---

## 📱 Responsive Design
- Fully responsive UI
- Works on **desktop, tablet, and mobile**

---

# 🛠️ Tech Stack

## Frontend
- React
- Redux Toolkit
- React Router
- Tailwind CSS
- React Hot Toast

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

## Authentication
- Clerk

## Real-Time Communication
- Server-Sent Events (SSE)

## Image Upload
- ImageKit

## Background Jobs & Email
- Inngest

---
# 📂 Project Structure

```
PingUp
│
├── client
│   ├── components
│   ├── pages
│   ├── features (Redux slices)
│   ├── api
│   └── App.jsx
│
├── server
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
│
└── README.md
```
# ⚡ Installation

### 1. Clone the repository
git clone https://github.com/kundan-kumar07/pingup.git

### 2. Install dependencies


### Frontend
```
cd client
npm install
```

### Backend
```
cd server
npm install
```

### 3. Run the project

Backend
npm run dev

Frontend
npm run dev

# 🔑 Environment Variables

Server `.env`

MONGODB_URI=

CLERK_SECRET_KEY=

IMAGEKIT_PUBLIC_KEY=

IMAGEKIT_PRIVATE_KEY=

IMAGEKIT_URL_ENDPOINT=

Client `.env`

VITE_CLERK_PUBLISHABLE_KEY=

VITE_BASEURL=http://localhost:4000

# 👨‍💻 Author

Kundan Kumar Dubey

GitHub: https://github.com/kundan-kumar07
