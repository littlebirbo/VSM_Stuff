const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open('myDatabase', 2);

        request.onupgradeneeded = event => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('averageDocLen')) {
                db.createObjectStore('averageDocLen', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('documentInfo')) {
                db.createObjectStore('documentInfo', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('index')) {
                db.createObjectStore('index', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('stopWords')) {
                db.createObjectStore('stopWords', { keyPath: 'id' });
            }
        };

        request.onsuccess = event => {
            const db = event.target.result;
            resolve(db);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
};

const closeDB = (db) => {
    db.close();
};

const clearDB = (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['averageDocLen', 'documentInfo', 'index', 'stopWords'], 'readwrite');
        const averageDocLen = transaction.objectStore('averageDocLen');
        const documentInfo = transaction.objectStore('documentInfo');
        const index = transaction.objectStore('index');
        const stopWords = transaction.objectStore('stopWords');

        const request1 = averageDocLen.clear();
        const request2 = documentInfo.clear();
        const request3 = index.clear();
        const request4 = stopWords.clear();

        request1.onsuccess = event => {
            resolve(event.target.result);
        };

        request1.onerror = event => {
            reject(event.target.error);
        };

        request2.onsuccess = event => {
            resolve(event.target.result);
        };

        request2.onerror = event => {
            reject(event.target.error);
        };

        request3.onsuccess = event => {
            resolve(event.target.result);
        };

        request3.onerror = event => {
            reject(event.target.error);
        };

        request4.onsuccess = event => {
            resolve(event.target.result);
        }

        request4.onerror = event => {
            reject(event.target.error);
        }
    });
};

const addDocuments = (db, documents) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['documentInfo'], 'readwrite');
        const objectStore = transaction.objectStore('documentInfo');
        const request = objectStore.add({ id: 1, documents });

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };

    });
};

const getDocuments = (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['documentInfo'], 'readonly');
        const objectStore = transaction.objectStore('documentInfo');
        const request = objectStore.get(1);

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };

    });
};

const addIndexes = (db, index) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['index'], 'readwrite');
        const objectStore = transaction.objectStore('index');
        const request = objectStore.add({ id: 1, index });

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
};

const getIndexes = (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['index'], 'readonly');
        const objectStore = transaction.objectStore('index');
        const request = objectStore.get(1);

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
        
    });
};

const addAverageDocLen = (db, averageDocLen) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['averageDocLen'], 'readwrite');
        const objectStore = transaction.objectStore('averageDocLen');
        const request = objectStore.add({ id: 1, averageDocLen });

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
};

const getAverageDocLen = (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['averageDocLen'], 'readonly');
        const objectStore = transaction.objectStore('averageDocLen');
        const request = objectStore.get(1);

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };

    });
};

const addStopWords = (db, stopWords) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stopWords'], 'readwrite');
        const objectStore = transaction.objectStore('stopWords');
        const request = objectStore.add({ id: 1, stopWords });

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
};

const getStopWords = (db) => {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['stopWords'], 'readonly');
        const objectStore = transaction.objectStore('stopWords');
        const request = objectStore.get(1);

        request.onsuccess = event => {
            resolve(event.target.result);
        };

        request.onerror = event => {
            reject(event.target.error);
        };
    });
};

export default {
    openDB,
    closeDB,
    clearDB,
    addDocuments,
    getDocuments,
    addIndexes,
    getIndexes,
    addAverageDocLen,
    getAverageDocLen,
    addStopWords,
    getStopWords
};
