# AI-Powered Helpdesk Ticket Prioritization and Routing System

A full-stack academic prototype for intelligent IT support triage, classification, routing, and analytics.

## Overview

The system demonstrates an end-to-end ticket lifecycle:

- User submits a ticket
- Backend preprocesses and analyzes text
- AI service predicts category and priority
- Smart routing assigns a team and agent
- Knowledge base returns recommended troubleshooting steps
- Agent resolves tickets and updates status
- Analytics dashboard tracks SLA and workload

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + Recharts
- Backend: Flask + SQLAlchemy + Flask-JWT-Extended
- Database: PostgreSQL-ready SQLAlchemy model, SQLite fallback for local demo
- ML: Demo classification and priority prediction with modular BERT/XGBoost-ready structure

## Folder Structure

- /frontend
- /backend
- /database
- /ml
- /docs
- /.env.example
- /README.md

## Environment Variables

Copy .env.example to .env and update values.

```bash
cp .env.example .env
```

Example:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/helpdesk
JWT_SECRET=change_me
SECRET_KEY=change_me
DEMO_MODE=true
EMAIL_API_KEY=
SLACK_WEBHOOK_URL=
MODEL_API_URL=
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local Setup

### 1. Clone repository

```bash
git clone <repo-url>
cd filteration
```

### 2. Install backend dependencies

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Setup PostgreSQL

Create a PostgreSQL database named `helpdesk` and update `DATABASE_URL` in `.env`.

If you want a simpler local demo, keep the default SQLite configuration in `.env`.

### 4. Run backend

```bash
cd backend
python run.py
```

The backend will be available at:

- http://localhost:5000/api/health
- http://localhost:5000/api/docs

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

### 6. Run frontend

```bash
npm run dev
```

The frontend will be available at http://localhost:5173.

## Demo credentials

- User: user@demo.com / password
- Agent: agent@demo.com / password
- Admin: admin@demo.com / password

## API Documentation

Available at:

- /api/docs

## ML Integration Notes

The prototype includes a modular, researcher-friendly ML pipeline:

- /ml/preprocessing.py
- /ml/category_model.py
- /ml/priority_model.py
- /ml/evaluate.py

The code explicitly separates the demo fallback layer from the production model integration path. When `DEMO_MODE=false`, the application is designed to load actual trained model artifacts or a remote inference API.

## Sample API Requests

### Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"password","role":"user"}'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@demo.com","password":"password"}'
```

### Create ticket

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"VPN not connecting","description":"Users cannot connect to VPN from remote locations.","email":"user@demo.com","department":"IT Support"}'
```

## Deployment

### Frontend

Deploy the React app to Vercel or Netlify.

### Backend

Deploy Flask API to Render, Railway, or AWS.

### Database

Use PostgreSQL on Supabase, Neon, or a managed PostgreSQL service.

## Academic Research Notes

This project is intentionally designed as a research prototype with modular ML components and clear demo-mode labeling. Real models can be plugged in by replacing the demo prediction modules while keeping the rest of the platform unchanged.
