import { Playlist, Track } from '../types';

const DB_NAME = 'cassette_os_db';
const DB_VERSION = 1;
const STORE_PLAYLISTS = 'playlists';

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject('Database error: ' + (event.target as any).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PLAYLISTS)) {
        db.createObjectStore(STORE_PLAYLISTS, { keyPath: 'id' });
      }
    };
  });
};

// We will only store metadata in IDB for this version to avoid quota limits with large audio files,
// but we will attempt to keep the file object in memory during the session or advise user.
// NOTE: Storing actual File objects in IDB *is* possible and supported in modern browsers,
// allowing offline persistent access to the blobs. We will try to store the full object.
export const savePlaylist = async (playlist: Playlist): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
    const store = transaction.objectStore(STORE_PLAYLISTS);
    const request = store.put(playlist);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error saving playlist');
  });
};

export const getPlaylists = async (): Promise<Playlist[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readonly');
    const store = transaction.objectStore(STORE_PLAYLISTS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject('Error fetching playlists');
  });
};

export const deletePlaylistFromDB = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_PLAYLISTS], 'readwrite');
    const store = transaction.objectStore(STORE_PLAYLISTS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject('Error deleting playlist');
  });
};
