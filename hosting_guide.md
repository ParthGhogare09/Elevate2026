# Hosting Guide - Elevate 2026

This guide provides step-by-step instructions to deploy your backend node server to **Render** and your React frontend to **Vercel**. Since both are stored in a single repository (monorepo), both hosting platforms must be configured to point to their respective directories.

---

## Prerequisites
Before deploying, make sure all your local changes are committed and pushed to your **GitHub repository**:
```bash
git add .
git commit -m "feat: form validations, contact page, seo, and workshop links"
git push origin main
```

---

## 1. Deploying the Backend on Render
Render is used to host web services like your Express.js backend.

### Steps:
1. Go to [Render](https://render.com) and log in.
2. Click **New** (top right) and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   * **Name**: `elevate-backend` (or your preferred name)
   * **Region**: Choose the closest region to your audience (e.g., Singapore).
   * **Branch**: `main`
   * **Root Directory**: `backend` *(CRITICAL: This tells Render to compile inside the backend folder)*
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node src/server.js` or `npm start`
5. Select the **Free Instance** type.
6. Click **Advanced** to add **Environment Variables**:
   * Add the variables copied from your local `backend/.env` file:
     * `MONGODB_URI` = *Your MongoDB connection string*
     * `JWT_SECRET` = *Your secret key for signing tokens*
     * `PORT` = `5000` *(Render will inject its own port automatically, but this is a good fallback)*
     * `NODE_ENV` = `production`
7. Click **Create Web Service**.
8. Once the build completes, copy the **live URL** of your backend (it looks like `https://elevate-backend.onrender.com`).

---

## 2. Deploying the Frontend on Vercel
Vercel is optimized for building and serving static static site generators and Vite single-page applications.

### Steps:
1. Go to [Vercel](https://vercel.com) and log in.
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. On the **Configure Project** screen, set the following:
   * **Framework Preset**: `Vite` (Vercel should automatically detect this)
   * **Root Directory**: Click *Edit* next to Root Directory, select the **`frontend`** folder, and click **Continue**.
   * **Build Command**: `npm run build` *(should default automatically)*
   * **Output Directory**: `dist` *(should default automatically)*
5. Expand the **Environment Variables** section:
   * Add the key: **`VITE_API_URL`**
   * Set its value to the **live URL of your Render backend** that you copied in Section 1 (e.g., `https://elevate-backend.onrender.com`).
6. Click **Deploy**.
7. Vercel will build your React application and generate a live URL (e.g., `https://elevate-2026.vercel.app`).

---

## 3. Post-Deployment Verification
* Open your Vercel URL, go to the **Registration** or **Contact Us** page to confirm that the pages load.
* Try logging into the **Admin Dashboard** or **Student Dashboard** to verify that calls to your Render backend are successfully resolving and writing to the database.
