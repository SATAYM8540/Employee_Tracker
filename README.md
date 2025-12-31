🧑‍💼 Employee Tracker (MERN Stack)

A full-stack Employee Tracking System built using the MERN stack (MongoDB, Express, React, Node.js).
This application helps organizations manage employees, track work submissions, and monitor activity through a secure admin dashboard.

🚀 Features
👨‍💼 Admin Features

Secure admin authentication

Add, edit, and manage employees

View employee work submissions

Track employee status

Role-based access control

Secure environment configuration

👩‍💻 Employee Features

Employee registration & login

Submit daily/weekly work updates

View personal dashboard

Secure authentication using JWT

🛠️ Tech Stack
Frontend

React (Vite)

CSS (Plain CSS)

Axios

React Router DOM

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT Authentication

bcrypt.js

📂 Project Structure
Employee_Tracker/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── utils/
│   ├── seed.js
│   ├── server.js
│   └── .env (ignored)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.jsx
│   └── vite.config.js
│
├── .gitignore
├── README.md
└── package.json

🔐 Environment Variables

Create a .env file inside the backend folder:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret


⚠️ Never commit .env files to GitHub

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/SATAYM8540/Employee_Tracker.git
cd Employee_Tracker

2️⃣ Backend Setup
cd backend
npm install
npm run dev


Backend will run on:

http://localhost:5000

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend will run on:

http://localhost:5173

🔑 Authentication

Passwords are encrypted using bcrypt

Authentication handled using JWT

Protected routes for admin and employees

🧪 Seed Admin User (Optional)

You can seed a default admin user using:

node seed.js


Admin credentials should be stored securely in .env
