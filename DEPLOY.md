# Deploy FitTrack – Step-by-Step

This guide gets your app live at a public URL. We use **Railway** as the main example (free tier, minimal setup).

---

## Part 1: Get your code on GitHub

### Step 1.1 – Check what gets pushed

1. Open your project folder in the terminal.
2. Run:  
   `git status`  
   You should see your files (e.g. `src/`, `server/`, `package.json`). If you see `server/data/` or `.env` listed, they should be ignored.
3. Open `.gitignore` and confirm it contains:
   - `server/data/`
   - `.env`
   (Your repo already has these, so no change needed unless you added secrets elsewhere.)

### Step 1.2 – Push to GitHub

1. If you don’t have a repo yet:
   - Go to [github.com](https://github.com) → **New repository**.
   - Name it (e.g. `fitness-tracker`), leave it empty (no README/license), click **Create repository**.
2. In your project folder, run (replace `YOUR_USERNAME` and `YOUR_REPO` with your GitHub username and repo name):

   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git add .
   git commit -m "FitTrack app and server"
   git push -u origin main
   ```

3. Refresh the repo on GitHub. You should see all your project files (and **no** `server/data/` or `.env`).

---

## Part 2: Deploy on Railway

### Step 2.1 – Sign in and create a project

1. Go to **[railway.app](https://railway.app)**.
2. Click **Login** (top right) → **Login with GitHub**.
3. Authorize Railway to access your GitHub if asked.
4. On the dashboard, click **New Project**.

### Step 2.2 – Connect your GitHub repo

1. Under **Deploy from GitHub repo**, click **Configure GitHub App** if you see it (this grants Railway access to your repos). Choose your account or organization and allow access.
2. Click **New Project** again.
3. Select **Deploy from GitHub repo**.
4. Pick the repo that contains FitTrack (e.g. `fitness-tracker`).
5. Railway will create a project and may start a first deploy. We’ll set the correct build and start commands next.

### Step 2.3 – Set build and start commands

1. In the project, click the **service** (the box that represents your app).
2. Open the **Settings** tab.
3. Find **Build**:
   - **Build Command:** paste exactly:
     ```bash
     npm install && (cd server && npm install) && npm run build
     ```
4. Find **Deploy** / **Start**:
   - **Start Command:** paste exactly:
     ```bash
     npm start
     ```
5. Leave **Root Directory** empty (repo root).
6. Click **Save** or wait for the page to auto-save.

### Step 2.4 – Add the secret (JWT_SECRET)

1. In the same service, open the **Variables** tab.
2. Click **New Variable** or **+ Variable**.
3. **Variable name:**  
   `JWT_SECRET`
4. **Value:** a long random string. You can generate one:
   - In terminal:  
     `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`  
   - Copy the output (e.g. a 64-character string) and paste it as the value.
5. Save. Railway will redeploy when you add or change variables.

### Step 2.5 – Get your public URL

1. Open the **Settings** tab for the service again.
2. Find **Networking** or **Public Networking**.
3. Click **Generate Domain** (or **Add domain**). Railway will assign a URL like:
   `https://fitness-tracker-production-xxxx.up.railway.app`
4. Copy that URL.

### Step 2.6 – Open the app

1. Wait for the latest deploy to finish (green checkmark or “Success” in the **Deployments** tab).
2. Paste the URL in your browser and press Enter.
3. You should see the FitTrack login/register screen. Try **Register** with an email and password, then **Log in**. The app and API are both served from this one URL.

---

## Part 3: (Optional) Keep user data across deploys on Railway

Right now, user and workout data lives in `server/data/` in the container; redeploys can reset it. To persist it:

1. In your Railway project, click your service.
2. Open the **Variables** tab.
3. Find **Volumes** (or **Persistent storage**).
4. Click **Add Volume** (or similar).
5. **Mount path:** type exactly:  
   `server/data`
6. Create/save. Railway will attach a persistent disk to that path so `server/data/users.json` and `server/data/workouts.json` survive redeploys.

---

## Quick reference – Railway

| What | Value |
|------|--------|
| **Build Command** | `npm install && (cd server && npm install) && npm run build` |
| **Start Command** | `npm start` |
| **Variable** | `JWT_SECRET` = (long random string) |
| **Optional** | Volume mount path: `server/data` |

---

## Alternative: Render (step-by-step)

1. Push your code to **GitHub** (same as Part 1 above).
2. Go to **[render.com](https://render.com)** → **Get Started** → sign in with **GitHub**.
3. **Dashboard** → **New +** → **Web Service**.
4. Connect your GitHub account if asked, then select the repo that contains FitTrack.
5. Use these settings:
   - **Name:** e.g. `fitness-tracker`
   - **Region:** choose one close to you
   - **Branch:** `main`
   - **Build Command:**  
     `npm install && (cd server && npm install) && npm run build`
   - **Start Command:**  
     `npm start`
6. Click **Advanced** and add an **Environment Variable**:
   - Key: `JWT_SECRET`  
   - Value: (same long random string as above)
7. Click **Create Web Service**. Render will build and deploy.
8. When it’s done, copy the URL (e.g. `https://fitness-tracker-xxxx.onrender.com`) and open it in your browser.

**Note:** Free tier may put the app to sleep; first load after a while can be slow. Data in `server/data/` is not persistent on the free tier unless you add a paid disk.

---

## Test production build locally

Before or after deploying, you can run the same setup on your machine:

1. In the project root (where `package.json` and `server/` are):
   ```bash
   npm run build
   npm start
   ```
2. Open **http://localhost:4000** in your browser.
3. You should see the app; register and log in to confirm everything works. This is the same way it runs on Railway or Render.

---

## Summary

1. Push the app to **GitHub** (ignore `server/data/` and `.env`).
2. On **Railway**: New Project → Deploy from GitHub → your repo.
3. Set **Build** and **Start** commands (see table above).
4. Add variable **JWT_SECRET** (long random string).
5. Generate a **domain** and open the URL.
6. (Optional) Add a **Volume** at `server/data` so data persists.

If a step fails, check the **Deployments** or **Logs** tab on Railway for the exact error message.
