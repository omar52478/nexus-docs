# Nexus Studio - Documentation CMS

Nexus Studio is a premium, high-performance documentation portal and CMS designed for the NEXUS ecosystem. It features a modern SaaS-inspired UI with glassmorphism, advanced block-based editing, and intelligent navigation generation.

## 🚀 Deployment to Vercel

Follow these steps to get your project live on Vercel:

### 1. Push to GitHub
Vercel works best with GitHub integration. If you haven't pushed your code yet:
```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Nexus Studio Docs"

# Add your remote and push (replace with your repo URL)
git remote add origin https://github.com/your-username/nexus-docs.git
git branch -M main
git push -u origin main
```

### 2. Import to Vercel
1. Go to [vercel.com](https://vercel.com) and log in.
2. Click **"Add New"** > **"Project"**.
3. Select your GitHub repository from the list.
4. Vercel will automatically detect **Vite** as the framework.
5. Click **"Deploy"**.

Your site will be live at `https://your-project-name.vercel.app`.

---

## 🔐 Admin Panel Access

The documentation content can be managed via the built-in CMS at the `/admin` route.

- **URL:** `https://your-site.com/admin`
- **Username:** `admin`
- **Password:** `nexus-admin-2026`

> [!IMPORTANT]
> This is a client-side protected route. Changes made in the Admin panel are saved to the browser's `localStorage` for instant preview. To make changes permanent in the physical files, you should download the JSON or update the files in `public/pages/`.

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The `npm run dev` command automatically triggers `node scripts/generate-nav.js` to rebuild the sidebar navigation based on your latest JSON edits in `public/pages/`.
