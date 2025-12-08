# CI/CD Plan — Render Deployment

Document owner: DevOps  
Scope: End-to-end CI for PR/main validation and automatic deployment to Render using `Dockerfile.render`.

## Goals
- Validate frontend and backend on every PR/push (lint, tests, build, image build).
- Deploy main branch automatically to Render as a single container (backend serving static frontend).
- Keep Render configuration minimal: Render injects `PORT`; client uses relative `/api` + same-origin WebSockets.

## Workflows (GitHub Actions)

### ci.yml
- **Triggers**: `pull_request` (all), `push` to `main`.
- **Runs-on**: `ubuntu-latest`, `node: 20` (`actions/setup-node` with npm cache).
- **Jobs**:
  - `frontend`: `npm ci` in `frontend`, `npm run lint`, `npm run test -- --runInBand`, `npm run build`.
  - `backend`: `npm ci` in `backend`, `npm run test -- --runInBand`, `npm run build`.
  - `image`: `docker build -f Dockerfile.render .` (sanity check of the Render image).
- **Caching**: Use `setup-node` cache (npm) keyed by each `package-lock.json`. Optional: additional `actions/cache` per `frontend` and `backend` node_modules.

### deploy.yml
- **Triggers**: `push` to `main` (after CI success). Can reuse `workflow_run` on `ci.yml` success.
- **Steps**:
  - Checkout.
  - Optional: `docker build -f Dockerfile.render .` as a final gate.
  - Trigger Render deploy via one of:
    - Deploy hook: `curl -X POST "$RENDER_DEPLOY_HOOK"` (preferred simple path).
    - API: `curl -X POST https://api.render.com/v1/services/$RENDER_SERVICE_ID/deploys -H "Authorization: Bearer $RENDER_API_TOKEN" -H "Content-Type: application/json" -d '{}'`.
- **Environment**: no extra env; Render provides `PORT`. Frontend baked with `VITE_API_BASE_URL=/api` and empty `VITE_WS_BASE_URL` in `Dockerfile.render`.

## Secrets / Config
- `RENDER_DEPLOY_HOOK` (or `RENDER_API_TOKEN` + `RENDER_SERVICE_ID` if using API).
- Optional: `CI_NODE_AUTH_TOKEN` if using a private npm registry (not required now).

## Branch & Release Policy
- PRs: run `ci.yml` only; block merge on passing checks.
- Main: `ci.yml` + `deploy.yml`. Protect `main` to require CI success.
- Rollback: use Render deploy history to redeploy a prior successful image.

## Verification Commands (local parity)
- Frontend: `cd frontend && npm ci && npm run lint && npm run test -- --runInBand && npm run build`
- Backend: `cd backend && npm ci && npm run test -- --runInBand && npm run build`
- Image: `docker build -f Dockerfile.render .`

## TODO (follow-up)
- Add `.github/workflows/ci.yml` and `.github/workflows/deploy.yml` per above.
- Wire repository secrets in GitHub.
- Optionally publish coverage as artifact and surface lint/test annotations.
