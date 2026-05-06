# Facebook Clone Project Documentation

Is file mein project ki sari technical details, used technologies, aur features ki detail di gayi hai taake aap isay apni documentation mein add kar sakein.

## 1. Project Overview
Yeh ek full-stack Social Media Application hai jo Facebook ke core features ko mimic karti hai. Ismein real-time communication, media sharing, aur user interaction ke saare zaroori tools shamil hain.

---

## 2. Tech Stack (Kia Use Kia Hai?)

### Frontend (User Interface):
- **Next.js 14 (App Router):** Modern React framework server-side rendering aur fast performance ke liye.
- **Tailwind CSS:** Styling ke liye use kia gaya hai taake design clean aur responsive rahay.
- **Radix UI:** High-quality, accessible components (Modals, Dropdowns, Avatars) ke liye.
- **Zustand:** Lightweight state management (Redux ka modern alternative).
- **Framer Motion:** Smooth animations aur transitions ke liye.
- **Emoji Picker:** Posts aur comments mein emojis add karne ke liye integration.
- **Skeleton Loaders:** Content load hotay waqt professional loading states ke liye.
- **Lucide React:** Modern icons library.
- **Axios:** Backend API se connect karne ke liye.
- **Socket.io-client:** Real-time features (Chat, Notifications) ke liye.
- **Next-Themes:** Dark aur Light mode support ke liye.
- **Hook Form & Yup:** Form validation aur user input handle karne ke liye.

### Backend (Server Side):
- **Node.js & Express:** Scalable aur fast server environment.
- **MongoDB & Mongoose:** NoSQL database data storage ke liye.
- **JWT (JSON Web Token):** Secure user authentication aur authorization ke liye.
- **Bcryptjs:** Passwords ko encrypt (hash) karke store karne ke liye.
- **Cloudinary:** Images aur videos ko cloud par store karne ke liye.
- **Multer:** File upload handling ke liye.
- **Large Media Support:** Backend 50MB tak ki files (videos) aur 10-minute timeout support karta hai large uploads ke liye.
- **Socket.io:** Real-time, bi-directional communication (Chat functionality).
- **Passport.js:** Social login (Google OAuth) integrate karne ke liye.

---

## 3. Key Features (Ismein Kia Kia Hai?)

1.  **Authentication System:**
    - Login aur Signup functionality.
    - Google OAuth (Google ke through login).
    - JWT based secure sessions.
2.  **User Profiles:**
    - Profile pictures aur cover photos (Cloudinary integration).
    - User bio aur personal information update karna.
3.  **Post System:**
    - Text aur Image/Video posts create karna.
    - Posts par Like, Comment aur **Share** karna.
    - Comments par Like karna aur **Nested Replies** dena.
4.  **Stories:**
    - 24-hour stories add karna (Images/Videos).
    - Stories ko view karna, like karna, aur delete karna.
5.  **Friends & Privacy System:**
    - Friend requests send/receive karna.
    - **Mutual Friends** dekhna.
    - Users ko follow/unfollow ya **Block/Unblock** karna.
    - **Account Privacy (Public/Private)** toggle karna.
6.  **Real-Time Chat:**
    - Bi-directional messaging users ke darmiyan.
    - **Edit aur Delete messages** capability.
    - Chat mein files aur images share karna.
    - Real-time online status aur typing indicators.
7.  **Video Feed:**
    - Videos dekhne ke liye dedicated section.
8.  **Search & Exploration:**
    - Real-time user search functionality.
    - New people explore karne ke liye "User to Request" section.
9.  **Notifications:**
    - Real-time Friend Request aur Message banners.
    - Header mein counts (badges) ka automatic update hona.
    - Unread messages ka visual indicator.
10. **Theme Support:**
    - Dark Mode aur Light Mode ka switch option.
11. **Performance & UX:**
    - **Skeleton Loading:** Slow internet par bhi user experience kharab nahi hota (Skeletons show hotay hain).
    - **Local Storage Optimization:** Likes aur basic actions ko local storage mein cache kia jata hai taake UI foran response de.
    - **Responsive Design:** Mobile, Tablet, aur Desktop par perfectly chalta hai.

---

## 4. How to Use (Kaisa Use Karein?)

### Installation:
1.  **Repository Clone karein:**
    `git clone <repository-url>`
2.  **Frontend Setup:**
    - `cd frontend`
    - `npm install`
    - `.env` file banayein aur API URL set karein.
    - `npm run dev` se frontend start karein.
3.  **Backend Setup:**
    - `cd backend`
    - `npm install`
    - `.env` file mein MongoDB URI, Cloudinary keys, aur JWT secret add karein.
    - `npm run dev` se server start karein.

### Database Strategy:
Project MongoDB use karta hai jahan Users, Posts, Stories, aur Messages ke alag collections hain. Cloudinary media storage handle karta hai taake server par load na paray.

### Required Environment Variables (.env):
Customer ko batayiye ke backend mein yeh variables set hona zarori hain:
- `MONGO_URI`: Database connection string.
- `JWT_SECRET`: Authentication security key.
- `CLOUDINARY_NAME/KEY/SECRET`: Media storage credentials.
- `GOOGLE_CLIENT_ID/SECRET`: Social login integration.
- `FRONTEND_URL`: React app ka address (CORS security ke liye).
- `PORT`: Backend server port.

---

## 5. Contact / Support
Agar mazeed koi sawal ho ya customize karwana ho, toh developer se rabta karein.
