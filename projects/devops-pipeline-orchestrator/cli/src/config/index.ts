import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as os from 'os';

export interface CliConfig {
  apiUrl?: string;
  apiKey?: string;
  defaultEnvironment?: string;
}

const CONFIG_PATHS = [
  path.join(process.cwd(), '.dpo.yml'),
  path.join(process.cwd(), '.dpo.yaml'),
  path.join(os.homedir(), '.dpo', 'config.yml'),
];

export function loadConfig(): CliConfig {
  for (const configPath of CONFIG_PATHS) {
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      return yaml.load(raw) as CliConfig;
    }
  }
  // Return defaults — server running locally
  return {
    apiUrl: process.env.DPO_API_URL || 'http://localhost:3001/api',
    apiKey: process.env.DPO_API_KEY,
    defaultEnvironment: process.env.DPO_ENV || 'staging',
  };
}

export function saveConfig(config: CliConfig): void {
  const configDir = path.join(os.homedir(), '.dpo');
  const configPath = path.join(configDir, 'config.yml');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, yaml.dump(config), 'utf8');
}
