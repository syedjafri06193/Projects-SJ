# DevOps Pipeline Orchestrator (DPO)

> CLI tool and dashboard for managing multi-environment deployments with automated rollback, health checks, and Slack integration.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=nodedotjs)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)
![Redis](https://img.shields.io/badge/Redis-7-red?logo=redis)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Features

- **Multi-environment deployments** — manage development, staging, and production from a single interface
- **Automated rollback** — instantly roll back to any previous successful deployment
- **Health checks** — real-time service health monitoring with latency and status tracking
- **Deployment strategies** — rolling, blue-green, canary, and recreate
- **Live log streaming** — WebSocket-powered real-time deployment logs
- **Web dashboard** — Next.js dark-theme dashboard with live metrics and charts
- **CLI tool** — powerful `dpo` command for terminal-based workflows
- **Slack integration** — deployment notifications for your team
- **Docker & Redis** — production-ready containerized setup

---

## Architecture

```
devops-pipeline-orchestrator/
├── cli/          — @dpo/cli     — TypeScript CLI (commander)
├── dashboard/    — @dpo/dashboard — Next.js frontend + Express API
│   └── server/                 — REST API + WebSocket server
├── shared/       — @dpo/shared  — Shared TypeScript types
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for Redis)

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/devops-pipeline-orchestrator.git
cd devops-pipeline-orchestrator
npm install
```

### 2. Start the dashboard + API

```bash
# Start Redis via Docker
docker compose up redis -d

# Start API server + Next.js dashboard
npm run dev
```

Dashboard: http://localhost:3000  
API: http://localhost:3001/api

### 3. Use the CLI

```bash
# Install CLI globally
npm install -g @dpo/cli
# OR run locally
cd cli && npx ts-node src/index.ts

# Initialize config
dpo init

# List services
dpo services list

# Deploy a service
dpo deploy api-gateway --env staging --tag v2.5.0

# Check status
dpo status --env production

# Health check
dpo health

# Rollback
dpo rollback api-gateway --env production

# Stream logs
dpo logs api-gateway --follow --env staging
```

### 4. Docker (full stack)

```bash
docker compose up
```

---

## CLI Reference

| Command | Description |
|---|---|
| `dpo init` | Interactive setup wizard |
| `dpo deploy <service>` | Deploy a service |
| `dpo rollback <service>` | Roll back to a previous deployment |
| `dpo status [service]` | Show service status |
| `dpo health [service]` | Run health checks |
| `dpo logs <id>` | Show deployment logs |
| `dpo services list` | List all services |
| `dpo services inspect <name>` | Inspect a service |

### Deploy options

```
-e, --env <env>        Target environment (default: staging)
-s, --strategy <s>     rolling | blue-green | canary | recreate
-t, --tag <tag>        Docker image tag (default: latest)
-y, --yes              Skip confirmation
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/services` | List services |
| GET | `/api/services/:name` | Get service details |
| GET | `/api/services/:name/metrics` | Service metrics |
| GET | `/api/deployments` | List deployments |
| POST | `/api/deployments` | Trigger a deployment |
| GET | `/api/deployments/:id` | Get deployment status |
| POST | `/api/rollbacks` | Trigger a rollback |
| GET | `/api/stats` | Dashboard statistics |
| WS | `/ws/logs` | Stream live logs |

---

## Configuration

Copy `.dpo.example.yml` to `.dpo.yml`:

```yaml
apiUrl: http://localhost:3001/api
apiKey: your-api-key
defaultEnvironment: staging
```

Environment variables:

| Variable | Default | Description |
|---|---|---|
| `DPO_API_URL` | `http://localhost:3001/api` | API server URL |
| `DPO_API_KEY` | — | API authentication key |
| `DPO_ENV` | `staging` | Default environment |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection |
| `PORT` | `3001` | API server port |

---

## Development

```bash
# Run all in watch mode
npm run dev

# Build everything
npm run build

# Lint
npm run lint

# Tests
npm test
```

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push: `git push origin feat/my-feature`
5. Open a Pull Request

---

## License

MIT © 2024
