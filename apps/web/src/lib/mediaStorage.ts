// Client-side IndexedDB Storage for User-Uploaded Videos & Thumbnails
const DB_NAME = 'opendrama_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const mediaStorage = {
  saveMediaBlob: async (key: string, blob: Blob): Promise<void> => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put({ id: key, blob, timestamp: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not persist media blob to IndexedDB:', e);
    }
  },

  getMediaBlob: async (key: string): Promise<Blob | null> => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob as Blob);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not read media blob from IndexedDB:', e);
      return null;
    }
  },

  deleteMediaBlob: async (key: string): Promise<void> => {
    try {
      const db = await openDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Could not delete media blob from IndexedDB:', e);
    }
  },

  // Generates or rehydrates a usable media URL for playback
  resolveVideoPlaybackUrl: async (videoId: string, fallbackUrl: string): Promise<string> => {
    // If it's a standard web URL (http, https), return directly
    if (fallbackUrl.startsWith('http://') || fallbackUrl.startsWith('https://')) {
      return fallbackUrl;
    }

    // Try to get the persisted Blob from IndexedDB
    const blob = await mediaStorage.getMediaBlob(videoId);
    if (blob) {
      return URL.createObjectURL(blob);
    }

    return fallbackUrl;
  }
};
