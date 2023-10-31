export class Customer {
  constructor(dbName) {
    this.dbName = dbName;
    if (!window.indexedDB) {
      window.alert("Your browser doesn't support a stable version of IndexedDB. \
        Such and such feature will not be available.");
    }
  }

  /**
   * Remove all rows from the database
   * @memberof Customer
   */
  removeAllRows = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName);

      request.onerror = (event) => {
        reject(new Error('Database error: ', event.target.error.message));
      };
  
      request.onsuccess = (event) => {
        console.log('Deleting all customers...');
        const db = event.target.result;
        const txn = db.transaction('customers', 'readwrite');
        txn.oncomplete = (event) => {
         resolve('All rows removed!');
        };
        const objectStore = txn.objectStore('customers');
        const getAllKeysRequest = objectStore.getAllKeys();
        getAllKeysRequest.onsuccess = (event) => {
          getAllKeysRequest.result.forEach(key => {
            objectStore.delete(key);
          });
        }
      }
    })
   
  }

  queryAllRows = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = (event) => {
         reject(new Error('Database error: ' + event.target.error.message));
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const txn = db.transaction('customers', 'readonly');
        const objectStore = txn.objectStore('customers');
        const getAllRequest = objectStore.getAll();
        getAllRequest.onerror = (event) => {
          reject(new Error('Get All request error: ' + event.target.error.message));
        };
        getAllRequest.onsuccess = (event) => {
          resolve(event.target.result);
          db.close();
        };
      };
    });
   }

  /**
   * Populate the Customer database with an initial set of customer data
   * @param {[object]} customerData Data to add
   * @memberof Customer
   */
  initialLoad = (customerData) => {
    return new Promise((resolve, reject) => {
        const openRequest = indexedDB.open(this.dbName, 1);  // Fixed version number

        openRequest.onerror = (event) => {
            reject(new Error('Database error: ' + event.target.error.message));
        };

        openRequest.onupgradeneeded = (event) => {
            console.log('Creating or upgrading database schema...');
            const db = event.target.result;
            if (!db.objectStoreNames.contains('customers')) {
                const objectStore = db.createObjectStore('customers', { keyPath: 'userid' });
                objectStore.createIndex('name', 'name', { unique: false });
                objectStore.createIndex('email', 'email', { unique: true });
            }
        };

        openRequest.onsuccess = (event) => {
            const db = event.target.result;
            const txn = db.transaction('customers', 'readwrite');
            const objectStore = txn.objectStore('customers');

            const putPromises = customerData.map(customer => {
                return new Promise((resolve, reject) => {
                    const putRequest = objectStore.put(customer);
                    putRequest.onsuccess = resolve;
                    putRequest.onerror = () => reject(new Error('Put request error'));
                });
            });

            Promise.all(putPromises).then(() => {
                db.close();
                resolve('Database loaded.');
            }).catch(error => {
                db.close();
                reject(error);
            });
        };

    });

    
}


}

