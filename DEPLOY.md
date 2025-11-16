# Deploying the web build to Cloudflare Pages

This project can be published to Cloudflare Pages either via GitHub Actions (recommended for CI) or locally using `wrangler`.

> Note: `wrangler pages publish` is deprecated. Use `wrangler pages deploy` instead. The local script in this repo uses `wrangler pages deploy` and supports an optional `--commit-dirty=true` flag to allow publishing from a working tree with uncommitted changes.

1) GitHub Actions (recommended)

- What I added: `.github/workflows/deploy-cloudflare-pages.yml` — this workflow:
  - runs on push to `main` or manually via `workflow_dispatch`
  - installs node, runs `npm ci`, runs `npm run web:build`
  - uses the Cloudflare Pages action to publish `./web-build`

- Required GitHub repository secrets (set under Settings → Secrets → Actions):
  - `CLOUDFLARE_API_TOKEN` — an API token with Pages publish permissions
  - `CLOUDFLARE_ACCOUNT_ID` — your Cloudflare account id
  - `CLOUDFLARE_PROJECT_NAME` — the Pages project name (the project created in the Pages UI)

- Notes:
  - Ensure your Pages project is created in the Cloudflare dashboard and the `projectName` matches exactly.
  - The workflow assumes the web export output directory is `web-build` (Expo's `expo export:web` default). If your build produces a different directory, update the workflow `directory` field.

2) Local publish using `wrangler` (quick/manual)

- What I added: `scripts/deploy-pages.ps1` — a PowerShell helper script that:
  - checks `wrangler` is installed
  - builds the web export with `npm run web:build`
  - runs `wrangler pages deploy ./web-build --project-name <name>` (preferred)

- Note: `wrangler pages publish` is deprecated. Use `wrangler pages deploy` instead. The script supports an optional `--commit-dirty=true` mode to allow publishing from a working tree with uncommitted changes (this is the default behavior in the script). If you prefer to require a clean git working tree, pass `-CommitDirty $false` to the PowerShell script.

- Requirements to use the script locally:
  - Install wrangler: `npm i -g wrangler` (or use `npx wrangler`)
  - Set `CLOUDFLARE_API_TOKEN` (env var) to a token with Pages publish permissions.
  - Pass project name via `-ProjectName "your-project-name"` or set `CLOUDFLARE_PAGES_PROJECT` env var.

Example (PowerShell):

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token>"
.\scripts\deploy-pages.ps1 -ProjectName "my-pages-project"
```

3) Troubleshooting

- If build fails on GitHub Actions, check the build logs (the workflow run in Actions) — likely missing dependencies or an interactive prompt.
- If the Pages action fails, check the secrets and that the `projectName` and `accountId` are correct.
- If `wrangler` fails locally, ensure you're using a supported version (wrangler v3+) and that your API token has correct permissions.

4) Next steps I can take for you (choose):
- Create the GitHub Actions workflow (already added) and optionally commit a small change and open a PR for you.
- Create and push the workflow and you set the repository secrets in GitHub. Once secrets are set, pushes to `main` will deploy automatically.
- I can run the local `wrangler` publish for you, but I will need your Cloudflare API token and project name (not recommended to share secrets here). Better is for you to run the `scripts/deploy-pages.ps1` locally.
