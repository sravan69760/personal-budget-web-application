# Personal Budget Web Application

A full-stack, local-only budget tracker for income, expenses, category budgets, and bill/invoice/receipt uploads.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- Uploads: multer storing files in `backend/uploads`
- Styling: responsive CSS

## Project Structure

```text
backend/
  src/
    routes/
    db.js
    server.js
  uploads/
  budget.sqlite
frontend/
  src/
    components/
    pages/
```

`backend/budget.sqlite` and `backend/uploads` are created automatically when the backend runs.

## Setup

Open two terminals from this project folder.

Make sure Node.js and npm are installed first.

### Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Features

- Dashboard totals for selected month
- Expense CRUD with month, category, and payment method filters
- Income CRUD
- Local PDF/JPG/JPEG/PNG bill and receipt upload
- Best-effort local amount/date/vendor extraction from uploaded PDFs and images
- Automatic expense creation from uploaded document amounts
- Monthly category budgets with usage and over-budget warnings
- Default categories seeded into SQLite on first run

## Local-Only Notes

No cloud services are used. Your data stays on your machine in:

- `backend/budget.sqlite`
- `backend/uploads`

## Push Updates To GitHub

This project includes `update-github.ps1` to commit and push code changes to:

`https://github.com/sravan69760/personal-budget-web-application.git`

From the project folder, run:

```powershell
.\update-github.ps1 "Describe your update"
```

Git for Windows must be installed first: `https://git-scm.com/download/win`
