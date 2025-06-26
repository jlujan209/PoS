console.log('Preload script running...');

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { contextBridge } = require('electron');


const userDataPathArg = process.argv.find(arg => arg.startsWith('--userDataPath='));
const userDataPath = userDataPathArg ? userDataPathArg.split('=')[1] : __dirname;

const dbPath = path.join(userDataPath, 'my-products.db');

let db;
try {
  db = new Database(dbPath);
} catch (err) {
  console.error('Failed to open DB:', err);
}

// Expose a limited API to the renderer
contextBridge.exposeInMainWorld('posAPI', {
  getProductByBarcode: (barcode) => {
    const stmt = db.prepare('SELECT name, price FROM products WHERE barcode = ?');
    return stmt.get(barcode); // returns { name, price } or undefined
  }
});
