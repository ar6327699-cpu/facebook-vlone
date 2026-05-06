# Full-Stack Facebook Clone

## 📖 Project Overview
This project is a comprehensive full-stack social media web application inspired by Facebook. It features a modern, responsive user interface built with Next.js (App Router) and a robust backend API powered by Node.js, Express, and MongoDB. The application supports real-time communication, media sharing, user authentication, and friend management.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Routing:** Next.js App Router (`src/app`)
* **Styling:** CSS / TailwindCSS (depending on setup)
* **State Management/API Calls:** Custom services and hooks.

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose ORM
* **Real-time Communication:** Socket.io
* **Authentication:** JWT (JSON Web Tokens) & Passport.js (Google OAuth20)
* **Media Storage:** Cloudinary
* **File Uploads:** Multer

---

## ✨ Key Features

### 1. User Authentication & Authorization
* Secure user registration and login using JWT.
* OAuth integration for "Login with Google".
* Password encryption using `bcryptjs`.

### 2. Real-Time Chat System
* Live, instant messaging between users powered by **Socket.io**.
* Persistent chat history saved in MongoDB.
* Real-time notifications for incoming messages.
* Support for sending text, images, and videos in conversations.

### 3. Post & Feed Management
* Users can create posts with text, images, or videos.
* Images and videos are securely uploaded and hosted on **Cloudinary**.
* Dynamic news feed displaying posts from friends and network.

### 4. Friend Management
* Send, accept, and reject friend requests.
* View friends list and user profiles.

---

## 📂 Project Structure

### `backend/`
Handles the server, database, API routes, and real-time sockets.
* `controllers/`: Contains the core logic for different features (e.g., `chatController.js` handles fetching and sending messages).
* `models/`: Mongoose schemas defining the database structure (Users, Posts, Messages, Conversations).
* `routes/`: API endpoints that connect frontend requests to controllers.
* `utils/`: Helper functions like `generateToken.js`, `socketHandler.js`, and `responseHandler.js`.
* `config/`: Configuration files (e.g., database connection `db.js`, Cloudinary setup).

### `frontend/`
Handles the user interface and client-side logic.
* `src/app/`: The Next.js App Router handling all pages and layouts (e.g., login page, news feed, chat UI).
* `src/components/`: Reusable UI components (buttons, modals, post cards).
* `src/service/`: API service files to fetch data from the backend (e.g., `url.service.js`).

---

## 📦 Key Dependencies
* `socket.io`: For bidirectional real-time communication (Chat).
* `cloudinary` & `multer-storage-cloudinary`: For managing media assets in the cloud.
* `mongoose`: For seamless MongoDB database interactions.
* `jsonwebtoken` & `passport`: For robust security and user sessions.

---

> **Note for Viva/Presentation:** This project demonstrates a strong understanding of full-stack development, RESTful APIs, real-time web sockets, and modern component-based UI architecture.
