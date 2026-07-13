# Sematrix

Sematrix is a unified, distraction-free study workspace designed to consolidate academic planning and Data Structures and Algorithms (DSA) preparation. It integrates course scheduling, immersive focus intervals, and technical interview preparation into a single glassmorphic dashboard.

## Key Features

* **Smart Timetables:** Create and view your daily study blocks and course sessions in a unified schedule that dynamically highlights current and upcoming slots.
* **Immersive Focus Mode:** A highly customizable Pomodoro-style focus timer with a vertical drum-roll selector. Synced with live-streaming Lofi radio streams that start, pause, and stop alongside the timer session.
* **Integrated DSA Lab:** Browse, search, and track progress on over 3,000 LeetCode problems. Add, persist, and update notes and solution code directly inside the application.
* **Secure Authentication & Settings:** Account creation, secure login, password change capability, and user profile persistence.
* **Visual Progress Tracking:** Track your focus goals and timetable session completion rates with responsive SVG ring progress indicators.

## Tech Stack

* **Frontend:** React, Vite, Framer Motion, Vanilla CSS (Glassmorphism design system)
* **Backend:** Node.js, Express.js, JWT Authentication
* **Database:** MongoDB (via Mongoose)

## Project Structure

* `/client`: React Vite application containing frontend components, pages, and assets.
* `/server`: Node.js Express server containing API endpoints, middlewares, database models, and controllers.

## Getting Started

### Prerequisites

* Node.js installed locally.
* MongoDB instance running locally or hosted on MongoDB Atlas.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Sanjith2006k/Sematrix.git
   cd Sematrix
   ```

2. Setup the Server:
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_phrase
   ```
   Start the backend development server:
   ```bash
   npm run dev
   ```

3. Setup the Client:
   ```bash
   cd ../client
   npm install
   ```
   Start the frontend development server:
   ```bash
   npm run dev
   ```
## License

This project is licensed under the MIT License - see the LICENSE file for details. Copyright S Sanjith Kumar.
