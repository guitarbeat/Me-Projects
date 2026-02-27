import { getStorageItem, setStorageItem } from '@/utils/storage';

export type N8NConfig = {
  enabled: boolean;
  baseUrl: string;
  eventPath: string;
  exportPath: string;
  summaryPath: string;
  authHeader?: string;
  authToken?: string;
};

type QueuedRequest = {
  id: string;
  url: string;
  method: 'POST';
  headers: Record<string, string>;
  body: any;
  enqueuedAt: string;
  attempt: number;
};

const LOCAL_STORAGE_KEY = 'tampanaN8N';
const QUEUE_STORAGE_KEY = 'tampanaN8NQueue';

function getEnvConfig(): Partial<N8NConfig> {
  const env = (import.meta as any).env || {};
  const baseUrl = env.VITE_N8N_BASE_URL as string | undefined;
  const eventPath = env.VITE_N8N_EVENT_PATH as string | undefined;
  const exportPath = env.VITE_N8N_EXPORT_PATH as string | undefined;
  const summaryPath = env.VITE_N8N_SUMMARY_PATH as string | undefined;
  const authHeader = env.VITE_N8N_AUTH_HEADER as string | undefined;
  const authToken = env.VITE_N8N_AUTH_TOKEN as string | undefined;
  return {
    baseUrl,
    eventPath,
    exportPath,
    summaryPath,
    authHeader,
    authToken,
  };
}

export function loadConfig(): N8NConfig {


  const result = getStorageItem(LOCAL_STORAGE_KEY, {
    defaultValue: {},
    silent: true
  });

  const stored = result.success ? result.data || {} : {};
  const env = getEnvConfig();

  const config: N8NConfig = {
    enabled: Boolean((stored as any).enabled ?? false),
    baseUrl: stored.baseUrl || env.baseUrl || '',
    eventPath: stored.eventPath || env.eventPath || '/webhook/tampana/event-change',
    exportPath: stored.exportPath || env.exportPath || '/webhook/tampana/export',
    summaryPath: stored.summaryPath || env.summaryPath || '/webhook/tampana/summary',
    authHeader: stored.authHeader || env.authHeader,
    authToken: stored.authToken || env.authToken,
  };
  return config;
}

export function saveConfig(next: Partial<N8NConfig>) {


  const prev = loadConfig();
  const merged = { ...prev, ...next };

  const result = setStorageItem(LOCAL_STORAGE_KEY, merged);
  if (!result.success) {
    console.warn('Failed to save N8N config:', result.error);
  }
}

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function readQueue(): QueuedRequest[] {


  const result = getStorageItem(QUEUE_STORAGE_KEY, {
    defaultValue: [],
    silent: true
  });

  return result.success ? result.data || [] : [];
}

function writeQueue(queue: QueuedRequest[]) {


  const result = setStorageItem(QUEUE_STORAGE_KEY, queue);
  if (!result.success) {
    console.warn('Failed to save queue:', result.error);
  }
}

function enqueue(request: Omit<QueuedRequest, 'id' | 'enqueuedAt' | 'attempt'>) {
  const queue = readQueue();
  const item: QueuedRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    enqueuedAt: new Date().toISOString(),
    attempt: 0,
  };
  queue.push(item);
  writeQueue(queue);
}

async function trySend(item: QueuedRequest): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(item.url, {
      method: item.method,
      headers: item.headers,
      body: JSON.stringify(item.body),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function flushQueue() {
  const queue = readQueue();
  if (queue.length === 0) return;
  const remaining: QueuedRequest[] = [];
  for (const item of queue) {
    const ok = await trySend(item);
    if (!ok) {
      const attempts = item.attempt + 1;
      if (attempts < 5) {
        remaining.push({ ...item, attempt: attempts });
      }
    }
  }
  writeQueue(remaining);
}

function makeHeaders(config: N8NConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (config.authHeader && config.authToken) {
    headers[config.authHeader] = config.authToken;
  }
  return headers;
}

async function postJsonWithQueue(url: string, body: any, headers: Record<string, string>) {
  const item: Omit<QueuedRequest, 'id' | 'enqueuedAt' | 'attempt'> = {
    url,
    method: 'POST',
    headers,
    body,
  };
  // If offline, enqueue directly
  if (typeof navigator !== 'undefined' && navigator && 'onLine' in navigator && (navigator as any).onLine === false) {
    enqueue(item);
    return { queued: true } as const;
  }
  // Try immediate send
  const ok = await trySend({ ...(item as any), id: 'tmp', enqueuedAt: new Date().toISOString(), attempt: 0 });
  if (!ok) {
    enqueue(item);
    return { queued: true } as const;
  }
  return { queued: false } as const;
}

export async function postEventChange(event: any, type: 'created' | 'updated' | 'deleted') {
  const config = loadConfig();
  if (!config.enabled || !config.baseUrl) return { disabled: true } as const;
  const url = buildUrl(config.baseUrl, config.eventPath);
  const headers = makeHeaders(config);
  const payload = {
    type,
    occurredAt: new Date().toISOString(),
    source: 'tampana',
    event,
  };
  return postJsonWithQueue(url, payload, headers);
}

export async function postExport(exportJson: any) {
  const config = loadConfig();
  if (!config.enabled || !config.baseUrl) return { disabled: true } as const;
  const url = buildUrl(config.baseUrl, config.exportPath);
  const headers = makeHeaders(config);
  return postJsonWithQueue(url, exportJson, headers);
}

export async function postSummary(summaryJson: any) {
  const config = loadConfig();
  if (!config.enabled || !config.baseUrl) return { disabled: true } as const;
  const url = buildUrl(config.baseUrl, config.summaryPath);
  const headers = makeHeaders(config);
  return postJsonWithQueue(url, summaryJson, headers);
}

// Flush queue on connectivity regain
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushQueue();
  });
}

