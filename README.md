# BI Command Center

**Journey to Top 0.1% Director of BI – Expense Technology**

A personal command center dashboard for tracking progress toward becoming a top-tier Director of Business Intelligence, using Power BI, star schema data models, and GitHub-based engineering practices.

## 🚀 Live Site

> Deployed via GitHub Pages — see the **Settings → Pages** tab for the live URL once enabled.

## 📁 Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Main dashboard entry point |
| `theme.css` | Liquid Glass design system & layout styles |
| `app.js` | Dashboard rendering logic, section navigation & Auth0 auth |
| `data.js` | Career metrics, domain scores, milestones & skills data |

## 🧭 Sections

- **Overview** — Overall BI score, key metrics, and progress summary
- **Domains** — Architecture & adoption scores across 5 expense domains
- **Engineering** — GitHub readiness, CI/CD checklist, DevOps maturity
- **Impact & Value** — Hours saved, cost avoided, milestone timeline
- **Skills** — Skill levels vs. targets with milestone tracking

## 🔐 Authentication (Auth0 + Google OAuth)

The site requires Google login via Auth0 before the dashboard is accessible.

### Auth0 Setup Steps

1. Create a free account at [auth0.com](https://auth0.com)
2. Go to **Applications → Create Application** and choose **Single Page Application**
3. In the Auth0 dashboard, go to **Authentication → Social** and enable the **Google / Gmail** connection
4. In your application's settings, set the following URLs to your GitHub Pages URL (e.g. `https://grizzly27.github.io/Command-center/`):
   - **Allowed Callback URLs**
   - **Allowed Logout URLs**
   - **Allowed Web Origins**
5. Open `app.js` and replace the placeholder values at the top of the file:
   ```javascript
   const AUTH0_DOMAIN    = 'YOUR_AUTH0_DOMAIN';    // e.g. dev-xxxx.us.auth0.com
   const AUTH0_CLIENT_ID = 'YOUR_AUTH0_CLIENT_ID';
   ```
   with your actual Auth0 **Domain** and **Client ID** found in your application settings.

## 🛠️ Tech Stack

- Vanilla HTML / CSS / JavaScript (no build step required)
- Auth0 SPA JS SDK (CDN) for Google OAuth with PKCE
- Hosted on GitHub Pages
- CI/CD via GitHub Actions

## ⚙️ Deployment

This site is automatically deployed to GitHub Pages on every push to `main` via the workflow in `.github/workflows/deploy.yml`.