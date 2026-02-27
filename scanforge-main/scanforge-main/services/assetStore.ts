
const DB_NAME = 'scanforge-assets';
const STORE_NAME = 'images';

// Simple IDB Wrapper
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
};

const getAssetFromDB = async (id: string): Promise<Blob | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
};

const putAssetToDB = async (id: string, blob: Blob): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(blob, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
};

async function computeHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

class AssetStore {
  private memoryCache = new Map<string, string>(); // assetId -> BlobURL

  async store(blobOrUrl: Blob | string): Promise<{ id: string, url: string }> {
    let blob: Blob;
    
    if (typeof blobOrUrl === 'string') {
        // Convert Base64/DataURL to Blob
        const res = await fetch(blobOrUrl);
        blob = await res.blob();
    } else {
        blob = blobOrUrl;
    }

    // Deduplicate
    const id = await computeHash(blob);
    
    if (this.memoryCache.has(id)) {
        return { id, url: this.memoryCache.get(id)! };
    }

    // Check DB (persistence)
    const existing = await getAssetFromDB(id);
    if (existing) {
        const url = URL.createObjectURL(existing);
        this.memoryCache.set(id, url);
        return { id, url };
    }

    // Save new
    await putAssetToDB(id, blob);
    const url = URL.createObjectURL(blob);
    this.memoryCache.set(id, url);
    return { id, url };
  }

  async getUrl(id: string): Promise<string | null> {
    if (this.memoryCache.has(id)) {
        return this.memoryCache.get(id)!;
    }

    const blob = await getAssetFromDB(id);
    if (blob) {
        const url = URL.createObjectURL(blob);
        this.memoryCache.set(id, url);
        return url;
    }
    return null;
  }
  
  // Clean up unused blob URLs to avoid memory leaks
  revoke(id: string) {
    if (this.memoryCache.has(id)) {
        URL.revokeObjectURL(this.memoryCache.get(id)!);
        this.memoryCache.delete(id);
    }
  }
}

export const assetStore = new AssetStore();
