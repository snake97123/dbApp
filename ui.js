import { Customer } from './db.js'; 


const DBNAME = 'customer_db';


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


const loadDB = () => {
  console.log('Load the Customers database');
  showNotification('Loading the database...');
  logMessage('Loading the database...');

  
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

window.onload = function() {
  const load = document.querySelector('#load-db');
  const query = document.querySelector('#query-db');
  const clear = document.querySelector('#clear-db');
  load.addEventListener('click', loadDB);
  query.addEventListener('click', queryDB);
  clear.addEventListener('click', clearDB);

}
