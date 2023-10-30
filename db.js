window.onload = function() {
  const load = document.querySelector('#load-db');
  const query = document.querySelector('#query-db');
  const clear = document.querySelector('#clear-db');
  load.addEventListener('click', loadDB);
  query.addEventListener('click', queryDB);
  clear.addEventListener('click', clearDB);

}

class Customer {
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

// Web page event handlers
const DBNAME = 'customer_db';

/**
 * Clear all customer data from the database
 */
const clearDB = () => {
  console.log('Delete all rows from the Customers database');
  showNotification('Clearing the database...');
  logMessage('Clearing the database...');
  let customer = new Customer(DBNAME);
  customer.removeAllRows().then(message => {
    showNotification(message);
    logMessage(message);
  }).catch(error => {
    showNotification('Error: ' + error.message);
    logMessage('Error: ' + error.message);
  });
}

/**
 * Add customer data to the database
 */
const loadDB = () => {
  console.log('Load the Customers database');
  showNotification('Loading the database...');
  logMessage('Loading the database...');

  // Customers to add to initially populate the database with
  const customerData = [
    { userid: '444', name: 'Bill', email: 'bill@company.com' },
    { userid: '555', name: 'Donna', email: 'donna@home.org' }
  ];
  let customer = new Customer(DBNAME);
  customer.initialLoad(customerData).then(message => {
    showNotification(message);
    logMessage(message);
  }).catch(error => {
    showNotification('Error: ' + error.message);
    logMessage('Error: ' + error.message);
  });
}

const queryDB = () => {
  console.log('Query the database...');
  showNotification('Querying the database...');
  logMessage('Querying the database...');

  let customer = new Customer(DBNAME);
  customer.queryAllRows().then(data => {
    displayData(data);
  }).catch(error => {
    showNotification('Error: ' + error.message);
    logMessage('Error: ' + error.message);
  });
}

const displayData = (data) => {
  const resultArea = document.querySelector('#query-results');
  resultArea.innerHTML = '';
  if(data.length === 0) {
    resultArea.innerHTML = 'No customer data available.'
  } else {
    data.forEach(customer => {
      const customerDiv = document.createElement('div');
      customerDiv.textContent = `User ID: ${customer.userid}, Name: ${customer.name}, Email: ${customer.email}`;
      resultArea.appendChild(customerDiv);
    });
  }
}

function showNotification(message) {
  const notificationPanel = document.querySelector('#notification-panel');
  notificationPanel.innerHTML = message;
}

function logMessage(message) {
 const logPanel = document.querySelector('#log-panel');
 const logDiv = document.createElement('div');
 logDiv.textContent = message;
 logPanel.appendChild(logDiv);
}