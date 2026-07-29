import { journalStorageKeys, readJsonStorage, writeJsonStorage } from '@/features/journal/lib/storage';

export type JournalN8nConfig = {
  enabled: boolean;
  baseUrl: string;
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
  body: unknown;
  enqueuedAt: string;
  attempt: number;
};

function getEnvConfig(): Partial<JournalN8nConfig> {
  const env = import.meta.env;

  return {
    baseUrl: env.VITE_N8N_BASE_URL,
    exportPath: env.VITE_N8N_EXPORT_PATH,
    summaryPath: env.VITE_N8N_SUMMARY_PATH,
    authHeader: env.VITE_N8N_AUTH_HEADER,
    authToken: env.VITE_N8N_AUTH_TOKEN,
  };
}

export function loadJournalN8nConfig(): JournalN8nConfig {
  const storedConfig = readJsonStorage<Partial<JournalN8nConfig>>(journalStorageKeys.n8n, {});
  const envConfig = getEnvConfig();

  return {
    enabled: Boolean(storedConfig.enabled ?? false),
    baseUrl: storedConfig.baseUrl || envConfig.baseUrl || '',
    exportPath:
      storedConfig.exportPath ||
      envConfig.exportPath ||
      '/webhook/flowmail/journal/export',
    summaryPath:
      storedConfig.summaryPath ||
      envConfig.summaryPath ||
      '/webhook/flowmail/journal/summary',
    authHeader: storedConfig.authHeader || envConfig.authHeader,
    authToken: storedConfig.authToken || envConfig.authToken,
  };
}

function readQueue(): QueuedRequest[] {
  return readJsonStorage<QueuedRequest[]>(journalStorageKeys.n8nQueue, []);
}

function writeQueue(queue: QueuedRequest[]) {
  writeJsonStorage(journalStorageKeys.n8nQueue, queue);
}

function buildUrl(baseUrl: string, path: string) {
  const safeBaseUrl = baseUrl.replace(/\/$/, '');
  const safePath = path.startsWith('/') ? path : `/${path}`;

  return `${safeBaseUrl}${safePath}`;
}

function buildHeaders(config: JournalN8nConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.authHeader && config.authToken) {
    headers[config.authHeader] = config.authToken;
  }

  return headers;
}

function enqueueRequest(request: Omit<QueuedRequest, 'attempt' | 'enqueuedAt' | 'id'>) {
  const queue = readQueue();

  queue.push({
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    enqueuedAt: new Date().toISOString(),
    attempt: 0,
  });

  writeQueue(queue);
}

async function trySendRequest(request: QueuedRequest) {
  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15000);

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: JSON.stringify(request.body),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });

    window.clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export async function flushJournalQueue() {
  const queue = readQueue();

  if (queue.length === 0) {
    return;
  }

  const remainingQueue: QueuedRequest[] = [];

  for (const request of queue) {
    const requestSucceeded = await trySendRequest(request);

    if (!requestSucceeded && request.attempt + 1 < 5) {
      remainingQueue.push({
        ...request,
        attempt: request.attempt + 1,
      });
    }
  }

  writeQueue(remainingQueue);
}

async function postWithQueue(url: string, payload: unknown, headers: Record<string, string>) {
  const request = {
    url,
    method: 'POST' as const,
    headers,
    body: payload,
  };

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    enqueueRequest(request);
    return { queued: true } as const;
  }

  const requestSucceeded = await trySendRequest({
    ...request,
    id: 'temporary',
    enqueuedAt: new Date().toISOString(),
    attempt: 0,
  });

  if (!requestSucceeded) {
    enqueueRequest(request);
    return { queued: true } as const;
  }

  return { queued: false } as const;
}

export async function postJournalExport(payload: unknown) {
  const config = loadJournalN8nConfig();

  if (!config.enabled || !config.baseUrl) {
    return { disabled: true } as const;
  }

  return postWithQueue(buildUrl(config.baseUrl, config.exportPath), payload, buildHeaders(config));
}

export async function postJournalSummary(payload: unknown) {
  const config = loadJournalN8nConfig();

  if (!config.enabled || !config.baseUrl) {
    return { disabled: true } as const;
  }

  return postWithQueue(buildUrl(config.baseUrl, config.summaryPath), payload, buildHeaders(config));
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void flushJournalQueue();
  });
}
