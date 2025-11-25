# Experiments Monorepo - GitHub Pages Setup

## Repository Structure

This repo deploys to GitHub Pages from the **main branch**.

### URLs
- **Root**: https://thevangelist.github.io/experiments/
- **Projects**: https://thevangelist.github.io/experiments/dstretch/

### Folder Structure

```
experiments/
├── index.html              ← Landing page (root)
├── .nojekyll              ← Disable Jekyll processing
├── dstretch/              ← Built DStretch app (deployed)
│   ├── index.html
│   ├── assets/
│   ├── favicon.png
│   └── logo.png
├── projects/              ← Source code (NOT deployed directly)
│   └── dstretch/
│       ├── src/
│       ├── dist/          ← Build output
│       ├── package.json
│       └── vite.config.ts
└── .github/
    └── workflows/
        └── deploy.yml     ← Automated deployment
```

## GitHub Pages Configuration

**Settings → Pages:**
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/ (root)`

## Deployment Workflow

### For DStretch App

1. **Make changes** in `projects/dstretch/src/`

2. **Build the app:**
   ```bash
   cd projects/dstretch
   npm run build
   ```

3. **Copy build to root deployment folder:**
   ```bash
   cd ../..  # Back to repo root
   rm -rf dstretch/*
   cp -r projects/dstretch/dist/* dstretch/
   ```

4. **Commit and push:**
   ```bash
   git add dstretch/
   git commit -m "Update DStretch app"
   git push origin main
   ```

5. **GitHub Pages automatically deploys** (1-2 minutes)

### Automated Deployment (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` automatically:
- Triggers on push to `main` affecting `projects/dstretch/**`
- Builds the project
- Copies to `_site/dstretch/`
- Deploys to GitHub Pages

**Note:** GitHub Actions workflow currently uses `actions/deploy-pages@v4` which requires specific permissions. For manual deployments, use the workflow above.

## Important Configuration Files

### `projects/dstretch/vite.config.ts`
```typescript
base: '/experiments/dstretch/'  // Must match deployment path
```

### `projects/dstretch/package.json`
```json
"deploy": "vite build && gh-pages -d dist -e dstretch"
```

## Common Issues

1. **404 on subdirectory**: Make sure `dstretch/index.html` exists at repo root
2. **Assets not loading**: Verify Vite `base` path matches deployment URL
3. **GitHub Pages not updating**: Check Settings → Pages is set to `main` branch
4. **Jekyll processing assets**: Ensure `.nojekyll` exists at root

## Adding New Projects

1. Create project in `projects/new-project/`
2. Build the project
3. Copy build output to `new-project/` at repo root
4. Update root `index.html` with link to new project
5. Commit and push

Access at: `https://thevangelist.github.io/experiments/new-project/`
