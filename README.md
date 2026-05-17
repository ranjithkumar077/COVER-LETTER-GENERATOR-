# CareerForge - AI Cover Letter Generator

## Overview

CareerForge is a full-stack, AI-powered cover letter generator built with **React**, **Flask**, and **SQLite** (with support for PostgreSQL). The application helps job seekers craft professional, ATS-friendly cover letters tailored to specific job descriptions in seconds. 

It features a polished dark-themed UI, secure JWT authentication, a live password strength checklist, and a profile management system with avatar upload and professional bio storage.

## Features

- **Secure Authentication** – JWT-based registration & login with password hashing (bcrypt), confirm password validation, and a live visual password strength checklist.
- **AI-Driven Generation** – Generates tailored cover letters using OpenAI's GPT models (or falls back to high-quality templates if no API key is provided).
- **TealHQ Methodology** – Prompts are optimized to follow TealHQ's best practices for impactful cover letters.
- **Dynamic Dashboard** – View your total letters generated and recent activity stats calculated dynamically.
- **Interactive Profile** – Edit your name, phone, LinkedIn URL, default writing tone, and upload a profile picture from your device with real-time preview.
- **Responsive Dark UI** – Sleek, modern interface with glassmorphism effects, ambient glows, and mobile-first responsive design (No Vanta.js dependencies for better performance).

## Screenshots

*(Add your screenshots here to showcase your project on GitHub!)*

- **Landing Page** (Showcasing the hero section and features)
- **Dashboard Overview** (With dynamic stats)
- **Generator Wizard** (Step-by-step form with URL validation)
- **Profile Settings** (With avatar upload and bio field)

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React (Icons), React Hot Toast.
- **Backend**: Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS.
- **Database**: SQLite (Default for easy development), support for PostgreSQL.

## How to Run

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "cover letter genenator ai"
```

### 2. Set Up the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Mac/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables in `.env`:
   ```env
   FLASK_ENV=development
   SECRET_KEY=your-super-secure-key
   JWT_SECRET_KEY=your-jwt-secret
   DATABASE_URL=sqlite:///coverletter_db.sqlite
   OPENAI_API_KEY=your-actual-openai-key # Optional: Falls back to templates if not provided
   FRONTEND_URL=http://localhost:5173
   ```
5. Run the server:
   ```bash
   python run.py
   ```
   The backend will start on `http://localhost:5000`.

### 3. Set Up the Frontend
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm.cmd run dev # On Windows if script execution is disabled
   # or
   npm run dev
   ```
   The frontend will start on `http://localhost:5173` (or `5174` if port is busy).

## CORS Configuration Note
If your frontend runs on port `5174` instead of `5173`, the backend is already configured to accept requests from both origins!

## License

MIT License - see the LICENSE file for details.
