// IndexedDB service for offline audio storage
const DB_NAME = 'MaestroPlayDB';
const DB_VERSION = 1;
const AUDIO_STORE = 'audioFiles';

interface StoredAudio {
  id: string;
  name: string;
  file: File;
  cover?: string;
  createdAt: Date;
}

class AudioStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(AUDIO_STORE)) {
          const store = db.createObjectStore(AUDIO_STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async storeAudioFile(id: string, name: string, file: File, cover?: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      
      const audioData: StoredAudio = {
        id,
        name,
        file,
        cover,
        createdAt: new Date()
      };

      const request = store.put(audioData);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAudioFile(id: string): Promise<StoredAudio | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async getAllAudioFiles(): Promise<StoredAudio[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readonly');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  async updateAudioCover(id: string, cover: string): Promise<void> {
    if (!this.db) await this.init();

    const audioFile = await this.getAudioFile(id);
    if (!audioFile) return;

    audioFile.cover = cover;
    return this.storeAudioFile(id, audioFile.name, audioFile.file, cover);
  }

  async deleteAudioFile(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([AUDIO_STORE], 'readwrite');
      const store = transaction.objectStore(AUDIO_STORE);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  // Create blob URL from stored file
  createBlobUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  // Clean up blob URL
  revokeBlobUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}

export const audioStorage = new AudioStorage();
