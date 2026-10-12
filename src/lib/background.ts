// Custom background photo: IndexedDB blob storage with downscale-on-import.

const DB_NAME = "bldtrainer";
const STORE = "kv";
const BG_KEY = "background";
const MAX_DIM = 1600;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const req = run(transaction.objectStore(STORE));
        req.onsuccess = () => {
          db.close();
          resolve(req.result);
        };
        req.onerror = () => {
          db.close();
          reject(req.error);
        };
      }),
  );
}

export function saveBackground(blob: Blob): Promise<void> {
  return tx("readwrite", (store) => store.put(blob, BG_KEY)).then(() => {});
}

export function loadBackground(): Promise<Blob | null> {
  return tx("readonly", (store) => store.get(BG_KEY)).then(
    (v) => (v instanceof Blob ? v : null),
  );
}

export function clearBackground(): Promise<void> {
  return tx("readwrite", (store) => store.delete(BG_KEY)).then(() => {});
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Could not decode that image file."));
    img.src = src;
  });
}

/** Downscale to MAX_DIM and store as JPEG. Throws on invalid files. */
export async function importBackground(file: File): Promise<void> {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file is not an image.");
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(
      1,
      MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) throw new Error("Could not process that image.");
    await saveBackground(blob);
  } finally {
    URL.revokeObjectURL(url);
  }
}
