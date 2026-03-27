# FileNest Full-Stack Deployment

This project is split into:
- Frontend: Vite + React (deploy to Vercel/Netlify)
- Backend: Node.js + Express (deploy to Render/Railway)
- Database: MySQL (Railway/PlanetScale/etc.)

## 1) Push Code To GitHub

From project root:

```bash
git add .
git commit -m "Add full-stack deployment setup"
git push -u origin main
```

## 2) Deploy Backend (Render)

Option A: Blueprint deploy
- In Render, choose New > Blueprint.
- Connect your GitHub repo.
- Render will read render.yaml.

Option B: Manual web service
- Root directory: backend
- Build command: npm install
- Start command: npm run start

Set backend environment variables from backend/.env.example.

Required minimum:
- JWT_SECRET
- FRONTEND_URL
- CORS_ORIGIN
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- MYSQLHOST
- MYSQLPORT
- MYSQLUSER
- MYSQLPASSWORD
- MYSQLDATABASE

Backend health endpoint:
- GET /api/test

## 3) Set Up Database (MySQL)

Use Railway MySQL or another managed MySQL provider.

Copy DB credentials into backend env vars.

The backend auto-creates required tables on startup.

## 4) Deploy Frontend (Vercel)

- Import repo in Vercel.
- Keep default settings for Vite app at repo root.
- Add env var:
  - VITE_API_BASE_URL=https://your-backend-domain/api

Note:
- If you set only origin (no /api), frontend now auto-appends /api.

## 5) Configure CORS + Frontend URL

In backend env vars:
- FRONTEND_URL=https://your-frontend-domain
- CORS_ORIGIN=https://your-frontend-domain

For multiple frontends:
- CORS_ORIGIN=https://app1.vercel.app,https://app2.vercel.app

## 6) Verify Production

- Backend test: https://your-backend-domain/api/test
- Frontend opens and can:
  - sign up / login
  - upload files
  - list files
  - create share links

## Troubleshooting

- 401 / invalid token:
  - Check JWT_SECRET consistency and token storage.
- CORS error:
  - Verify CORS_ORIGIN exactly matches frontend origin.
- DB connection failed:
  - Verify MySQL host/user/password/database/port.
- Upload fails:
  - Verify Cloudinary credentials.
