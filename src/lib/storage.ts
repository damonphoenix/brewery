const DB_NAME = "BreweryStorage";
const STORE_NAME = "files";
const DB_VERSION = 1;

function getDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            reject(new Error("Failed to open IndexedDB"));
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

export async function saveFile(file: File): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        // We store the file under a single known key, since there is only one "bar" spot
        const request = store.put(file, "currentFile");

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error("Failed to save file to IndexedDB"));
    });
}

export async function loadFile(): Promise<File | null> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readonly");
        const store = transaction.objectStore(STORE_NAME);

        const request = store.get("currentFile");

        request.onsuccess = () => {
            if (request.result instanceof File) {
                resolve(request.result);
            } else {
                resolve(null);
            }
        };
        request.onerror = () => reject(new Error("Failed to load file from IndexedDB"));
    });
}

export async function clearFile(): Promise<void> {
    const db = await getDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const request = store.delete("currentFile");

        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error("Failed to clear file from IndexedDB"));
    });
}
