# Geografika - Geography Quiz Game

A web-based geography quiz game that tests your knowledge of world capitals and provides interesting demographic facts about different countries.

## Features

- Three difficulty levels (Beginner, Intermediate, Advanced)
- Continent-based quiz selection (including multi-select and 'All continents')
- Interesting demographic facts about countries
- Immediate feedback on answers
- Modern, responsive UI with Tailwind CSS (vanilla version) and React (new version)
- Animated landing page with framer-motion (React version)
- Score system and "tough" questions

## Setup

### Backend Setup (FastAPI)

1. **Create a Python virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Start the FastAPI server:**
```bash
uvicorn backend.main:app --reload
```

The backend will run on http://localhost:8000

---

### Frontend Setup (React version)

1. **Install dependencies:**
```bash
cd frontend-react
npm install
```

2. **Start the React development server:**
```bash
npm start
```

The React app will run on http://localhost:3000 and will connect to the backend on port 8000.

---

### (Optional) Vanilla Frontend

If you want to use the original vanilla JS/Tailwind frontend:
```bash
cd frontend
python3 -m http.server 8080
```
Then visit http://localhost:8080 in your browser.

---

## How to Play

1. Start the backend and frontend as above
2. Open the React app in your browser (http://localhost:3000)
3. Click "Start" on the animated landing page
4. Select your desired difficulty level and continents
5. Answer questions about capital cities
6. See your score and feedback
7. Try to answer all questions without repetition!

## Project Structure

```
.
├── backend/
│   └── main.py
├── frontend/           # (Vanilla version)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── frontend-react/     # (React version)
│   ├── src/
│   │   ├── App.js
│   │   ├── LandingPage.js
│   │   ├── BlurText.js
│   │   └── ...
│   └── ...
├── data/
│   └── countries.json
├── requirements.txt
└── README.md
```

## Technologies Used

- Frontend:
  - React (with framer-motion for animation)
  - Tailwind CSS (for styling)
  - Vanilla JS (legacy version)
- Backend:
  - FastAPI (Python)
  - JSON for data storage

## Future Improvements

- Add more countries and facts to the database
- Implement user accounts and score tracking
- Add more quiz types (flags, landmarks, etc.)
- Integrate with external APIs for real-time data
- Add multiplayer functionality
- Further improve UI/UX in React 