// ─── Environments ────────────────────────────────────────────────────────────

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  name: Environment;
  host: string;
  port: number;
  dockerRegistry: string;
  redisUrl: string;
  slackChannel?: string;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'deploying' | 'rolling-back';

export interface Service {
  id: string;
  name: string;
  image: string;
  tag: string;
  environment: Environment;
  status: ServiceStatus;
  healthCheck: HealthCheck;
  replicas: {
    desired: number;
    running: number;
    failed: number;
  };
  ports: { host: number; container: number }[];
  envVars: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// ─── Health Checks ────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'unhealthy' | 'degraded' | 'unknown';

export interface HealthCheck {
  endpoint: string;
  interval: number; // ms
  timeout: number;  // ms
  retries: number;
  status: HealthStatus;
  lastChecked: string;
  latency?: number; // ms
  responseCode?: number;
}

// ─── Deployments ──────────────────────────────────────────────────────────────

export type DeploymentStatus =
  | 'pending'
  | 'in-progress'
  | 'success'
  | 'failed'
  | 'rolled-back'
  | 'cancelled';

export type DeploymentStrategy = 'rolling' | 'blue-green' | 'canary' | 'recreate';

export interface Deployment {
  id: string;
  serviceId: string;
  serviceName: string;
  environment: Environment;
  strategy: DeploymentStrategy;
  status: DeploymentStatus;
  fromTag: string;
  toTag: string;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  duration?: number; // ms
  logs: DeploymentLog[];
  rollbackAvailable: boolean;
  previousDeploymentId?: string;
}

export interface DeploymentLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  step?: string;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  startedAt?: string;
  duration?: number;
  logs: string[];
}

export interface Pipeline {
  id: string;
  name: string;
  serviceId: string;
  environment: Environment;
  stages: PipelineStage[];
  status: 'pending' | 'running' | 'success' | 'failed';
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
}

// ─── Rollback ─────────────────────────────────────────────────────────────────

export interface RollbackRequest {
  serviceId: string;
  environment: Environment;
  targetDeploymentId: string;
  reason?: string;
  triggeredBy: string;
}

export interface RollbackResult {
  success: boolean;
  deploymentId: string;
  message: string;
  duration: number;
}

// ─── Slack ────────────────────────────────────────────────────────────────────

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  username?: string;
  notifyOn: ('deploy-start' | 'deploy-success' | 'deploy-fail' | 'rollback' | 'health-alert')[];
}

export interface SlackNotification {
  event: string;
  service: string;
  environment: Environment;
  message: string;
  status: 'success' | 'failure' | 'info' | 'warning';
  metadata?: Record<string, string>;
}

// ─── Metrics ──────────────────────────────────────────────────────────────────

export interface ServiceMetrics {
  serviceId: string;
  timestamp: string;
  cpu: number;       // percentage
  memory: number;    // percentage
  requests: number;  // per minute
  errorRate: number; // percentage
  latency: number;   // ms p95
}

export interface DeploymentMetrics {
  total: number;
  successful: number;
  failed: number;
  rolledBack: number;
  avgDuration: number;
  successRate: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface OrchestratorConfig {
  version: string;
  environments: EnvironmentConfig[];
  slack?: SlackConfig;
  defaults: {
    strategy: DeploymentStrategy;
    healthCheckTimeout: number;
    rollbackOnFailure: boolean;
    maxRollbackAge: number; // hours
  };
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
