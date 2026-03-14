# FitTrack - Fitness Progress Tracker

A fitness tracking application with daily workout check-in, editable sessions grouped by body parts, and a summary dashboard for weekly and monthly training workload.

## Features

- **Daily Workout Check-in**: Log workouts with date, body part, and exercises
- **Editable Sessions**: Full create, edit, and delete support for workout sessions
- **Body Part Grouping**: Sessions organized by Chest, Back, Arms, Legs, Shoulders, Core
- **Exercise Logging**: For each exercise:
  - Exercise (motion) name
  - Number of sets
  - Number of repetitions
  - Primary muscle groups (multi-select)
- **Summary Dashboard**:
  - Weekly total training workload per body part (sets, reps, exercises)
  - Monthly total training workload per body part
  - Balance chart for quick comparison across body parts

## Tech Stack

- React 18
- Vite 4
- date-fns
- Local storage for persistence

## Setup

```bash
cd fitness-tracker
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```
