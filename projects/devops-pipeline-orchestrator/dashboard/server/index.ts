import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { v4 as uuid } from 'uuid';
import {
  Service, Deployment, DeploymentLog, ServiceMetrics,
  ApiResponse, Environment, DeploymentStatus
} from '@dpo/shared';

const app = express();
app.use(cors());
app.use(express.json());

// ─── In-memory store (replace with Redis/DB in production) ────────────────────

const services: Service[] = [
  makeService('api-gateway', 'production', 'running', 'v2.4.1', 'healthy'),
  makeService('auth-service', 'production', 'running', 'v1.9.0', 'healthy'),
  makeService('user-service', 'production', 'running', 'v3.1.2', 'degraded'),
  makeService('payment-service', 'production', 'deploying', 'v2.0.0', 'unknown'),
  makeService('api-gateway', 'staging', 'running', 'v2.5.0-rc1', 'healthy'),
  makeService('auth-service', 'staging', 'running', 'v2.0.0-beta', 'healthy'),
  makeService('worker-service', 'development', 'running', 'latest', 'healthy'),
];

const deployments: Deployment[] = generateDeployments();
const metricsHistory: Record<string, ServiceMetrics[]> = {};

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get('/api/services', (req, res) => {
  const env = req.query.env as string | undefined;
  const result = env ? services.filter(s => s.environment === env) : services;
  res.json(ok(result));
});

app.get('/api/services/:name', (req, res) => {
  const env = req.query.env as string | undefined;
  const svc = services.find(
    s => s.name === req.params.name && (!env || s.environment === env)
  );
  if (!svc) return res.status(404).json(err('Service not found'));
  res.json(ok(svc));
});

app.get('/api/services/:name/deployments', (req, res) => {
  const env = req.query.env as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = deployments
    .filter(d => d.serviceName === req.params.name && (!env || d.environment === env))
    .slice(0, limit);
  res.json(ok(result));
});

app.get('/api/services/:name/metrics', (req, res) => {
  const key = `${req.params.name}-${req.query.env || 'production'}`;
  res.json(ok(metricsHistory[key] || generateMetrics(req.params.name, req.query.env as Environment)));
});

app.get('/api/deployments', (req, res) => {
  const env = req.query.env as string | undefined;
  const limit = Number(req.query.limit) || 20;
  const result = (env ? deployments.filter(d => d.environment === env) : deployments).slice(0, limit);
  res.json(ok(result));
});

app.get('/api/deployments/:id', (req, res) => {
  const d = deployments.find(dep => dep.id === req.params.id);
  if (!d) return res.status(404).json(err('Deployment not found'));
  res.json(ok(d));
});

app.post('/api/deployments', (req, res) => {
  const { serviceName, environment, strategy, tag } = req.body;

  const svc = services.find(s => s.name === serviceName && s.environment === environment);
  if (!svc) return res.status(404).json(err('Service not found'));

  const deployment: Deployment = {
    id: uuid(),
    serviceId: svc.id,
    serviceName,
    environment,
    strategy: strategy || 'rolling',
    status: 'in-progress',
    fromTag: svc.tag,
    toTag: tag || 'latest',
    triggeredBy: 'cli',
    startedAt: new Date().toISOString(),
    rollbackAvailable: true,
    logs: [
      makeLog('info', 'Deployment initiated', 'init'),
      makeLog('info', `Pulling image ${svc.image}:${tag || 'latest'}`, 'pull'),
    ],
  };

  deployments.unshift(deployment);

  // Simulate async completion
  simulateDeployment(deployment, svc);

  res.status(202).json(ok({ id: deployment.id, estimatedDuration: 30000 }));
});

app.post('/api/rollbacks', (req, res) => {
  const { serviceId, environment, targetDeploymentId, reason } = req.body;

  const target = deployments.find(d => d.id === targetDeploymentId);
  if (!target) return res.status(404).json(err('Target deployment not found'));

  const svc = services.find(s => s.name === serviceId && s.environment === environment);
  if (svc) {
    svc.tag = target.toTag;
    svc.status = 'running';
  }

  res.json(ok({
    success: true,
    deploymentId: uuid(),
    message: `Rolled back to ${target.toTag} successfully`,
    duration: 8500,
  }));
});

app.get('/api/stats', (_req, res) => {
  const total = deployments.length;
  const successful = deployments.filter(d => d.status === 'success').length;
  const failed = deployments.filter(d => d.status === 'failed').length;
  const rolledBack = deployments.filter(d => d.status === 'rolled-back').length;

  res.json(ok({
    total,
    successful,
    failed,
    rolledBack,
    avgDuration: 28400,
    successRate: total ? Math.round((successful / total) * 100) : 0,
    servicesHealthy: services.filter(s => s.healthCheck.status === 'healthy').length,
    servicesTotal: services.length,
    deploymentsToday: deployments.filter(d => {
      const today = new Date();
      const start = new Date(d.startedAt);
      return start.toDateString() === today.toDateString();
    }).length,
  }));
});

// ─── WebSocket ────────────────────────────────────────────────────────────────

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer, path: '/ws/logs' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const service = url.searchParams.get('service') || 'unknown';

  const interval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      const messages = [
        `Health check passed for ${service}`,
        `Request processed in ${Math.floor(Math.random() * 50 + 5)}ms`,
        `Redis cache hit ratio: ${(Math.random() * 20 + 80).toFixed(1)}%`,
        `Replica ${Math.floor(Math.random() * 3) + 1} responding normally`,
      ];
      ws.send(JSON.stringify(makeLog(
        Math.random() > 0.9 ? 'warn' : 'info',
        messages[Math.floor(Math.random() * messages.length)]
      )));
    }
  }, 1500);

  ws.on('close', () => clearInterval(interval));
});

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 DPO API server running on http://localhost:${PORT}`);
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

function err(message: string): ApiResponse<never> {
  return { success: false, error: message, timestamp: new Date().toISOString() };
}

function makeLog(level: DeploymentLog['level'], message: string, step?: string): DeploymentLog {
  return { timestamp: new Date().toISOString(), level, message, step };
}

function makeService(
  name: string,
  env: Environment,
  status: Service['status'],
  tag: string,
  health: Service['healthCheck']['status']
): Service {
  return {
    id: uuid(),
    name,
    image: `registry.example.com/${name}`,
    tag,
    environment: env,
    status,
    healthCheck: {
      endpoint: `/health`,
      interval: 30000,
      timeout: 5000,
      retries: 3,
      status: health,
      lastChecked: new Date(Date.now() - Math.random() * 60000).toISOString(),
      latency: health === 'healthy' ? Math.floor(Math.random() * 30 + 5) : undefined,
      responseCode: health === 'healthy' ? 200 : health === 'unhealthy' ? 503 : undefined,
    },
    replicas: { desired: 3, running: status === 'running' ? 3 : 1, failed: 0 },
    ports: [{ host: 8000 + Math.floor(Math.random() * 999), container: 8080 }],
    envVars: { NODE_ENV: env, LOG_LEVEL: 'info' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60).toISOString(),
  };
}

function generateDeployments(): Deployment[] {
  const envs: Environment[] = ['production', 'staging', 'development'];
  const statuses: DeploymentStatus[] = ['success', 'success', 'success', 'failed', 'rolled-back'];
  const svcNames = ['api-gateway', 'auth-service', 'user-service', 'payment-service'];
  const result: Deployment[] = [];

  for (let i = 0; i < 30; i++) {
    const name = svcNames[i % svcNames.length];
    const env = envs[Math.floor(Math.random() * envs.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const started = new Date(Date.now() - (i * 3600000 + Math.random() * 3600000));
    const duration = Math.floor(Math.random() * 60000 + 15000);

    result.push({
      id: uuid(),
      serviceId: uuid(),
      serviceName: name,
      environment: env,
      strategy: 'rolling',
      status,
      fromTag: `v${i + 1}.0.0`,
      toTag: `v${i + 2}.0.0`,
      triggeredBy: ['github-actions', 'cli', 'dashboard'][Math.floor(Math.random() * 3)],
      startedAt: started.toISOString(),
      completedAt: new Date(started.getTime() + duration).toISOString(),
      duration,
      rollbackAvailable: status === 'success',
      logs: [
        makeLog('info', 'Deployment initiated', 'init'),
        makeLog('info', 'Image pulled successfully', 'pull'),
        makeLog('info', 'Health checks passed', 'health'),
        status === 'success'
          ? makeLog('success', 'Deployment complete')
          : makeLog('error', 'Deployment failed: health check timeout'),
      ],
    });
  }

  return result;
}

function generateMetrics(name: string, env: Environment = 'production'): ServiceMetrics[] {
  const metrics: ServiceMetrics[] = [];
  for (let i = 24; i >= 0; i--) {
    metrics.push({
      serviceId: name,
      timestamp: new Date(Date.now() - i * 3600000).toISOString(),
      cpu: Math.random() * 40 + 10,
      memory: Math.random() * 30 + 40,
      requests: Math.floor(Math.random() * 500 + 100),
      errorRate: Math.random() * 2,
      latency: Math.floor(Math.random() * 80 + 20),
    });
  }
  return metrics;
}

async function simulateDeployment(deployment: Deployment, svc: Service) {
  const steps = [
    { delay: 2000, level: 'info' as const, message: 'Stopping old containers', step: 'stop' },
    { delay: 3000, level: 'info' as const, message: 'Starting new containers', step: 'start' },
    { delay: 5000, level: 'info' as const, message: 'Running health checks', step: 'health' },
    { delay: 2000, level: 'success' as const, message: 'All health checks passed', step: 'health' },
    { delay: 1000, level: 'success' as const, message: 'Deployment complete' },
  ];

  let totalDelay = 0;
  for (const step of steps) {
    totalDelay += step.delay;
    setTimeout(() => {
      deployment.logs.push(makeLog(step.level, step.message, step.step));
    }, totalDelay);
  }

  setTimeout(() => {
    deployment.status = 'success';
    deployment.completedAt = new Date().toISOString();
    deployment.duration = totalDelay;
    svc.tag = deployment.toTag;
    svc.status = 'running';
  }, totalDelay + 500);
}
