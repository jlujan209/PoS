console.log('Preload script running...');

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { contextBridge } = require('electron');
const { get } = require('http');


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
    return stmt.get(barcode); 
  },
  logSale: (sale) => {
    const stmt = db.prepare('INSERT INTO all_sales (sale) VALUES (?)');
    stmt.run(sale);
  },
  logDailySale: () => {
    const stmt = db.prepare(`INSERT OR REPLACE INTO daily_sales (sale_date, sale) SELECT DATE('now'), IFNULL(SUM(sale), 0) FROM all_sales WHERE DATE(sale_date) = DATE('now')`)
    stmt.run();
  },
  getCurrentSale: () => {
    const stmt = db.prepare(`SELECT IFNULL(SUM(sale), 0) as total FROM all_sales WHERE DATE(sale_date) = DATE('now')`);
    return stmt.get().total || 0;
  },
  getDailySales: () => {
    const stmt = db.prepare('SELECT sale_date, sale FROM daily_sales ORDER BY sale_date DESC');
    return stmt.all();
  },
  getHourlySales: () => {
    const stmt = db.prepare(`
        SELECT 
        strftime('%H:00', datetime(sale_date, '-7 hours')) AS hour,
        SUM(sale) AS total
        FROM all_sales
        WHERE DATE(datetime(sale_date, '-7 hours')) = DATE(datetime('now', '-7 hours'))
        AND CAST(strftime('%H', datetime(sale_date, '-7 hours')) AS INTEGER) BETWEEN 8 AND 22
        GROUP BY hour
        ORDER BY hour ASC
    `);
    return stmt.all();
    }

});
