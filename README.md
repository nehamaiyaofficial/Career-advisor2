## Career Advisor App

A simple and smart career guidance app built as a 3rd year B.Tech AIML project.  
It helps users analyze their CV, extract skills, and get career improvement suggestions.

## What It Does

- Upload or paste your CV content
- Extracts important skills
- Suggests missing skills for your career goal
- Shows a basic career roadmap
- Includes a mobile app built with React Native
- Backend supports AI-based analysis with fallback demo logic

## Tech Stack

**Frontend**
- React
- React Native with Expo

**Backend**
- Node.js
- Express.js

**AI / Tools**
- Gemini API
- Firebase optional
- PDF parsing
- Local fallback analysis

## Project Structure
```md
```txt
Career-advisor2/
├── backend/     # Express API
├── frontend/    # React web app
└── mobile/      # React Native Expo app
```

## How To Run

### Backend

```bash
cd backend
npm install
npm start
```

### Mobile App

```bash
cd mobile
npm install
npx expo start -c --host lan
```

Scan the QR code using Expo Go.

## Note

If testing on a real phone, make sure your laptop and phone are connected to the same Wi-Fi network.

## About

This project was made to explore how AI can help students understand their current skills and plan their next learning steps in a more personalized way.

Built with curiosity, caffeine, and a lot of debugging.
