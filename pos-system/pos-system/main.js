const { app, BrowserWindow, Menu } = require('electron/main')
const path = require('path')
const fs = require('fs')
const Database = require('better-sqlite3');
const { create } = require('domain');
const userDataPath = app.getPath('userData');

console.log(path.join(__dirname, 'preload.js'));

const createDatabase = () => {
  const dbPath = path.join(userDataPath, 'my-products.db');

  const isNewDatabase = !fs.existsSync(dbPath);
  const db = new Database(dbPath);


  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS all_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale REAL NOT NULL,
      sale_date TEXT NOT NULL DEFAULT (datetime('now'))
    );
    `);

    db.exec(`
      CREATE TABLE IF NOT EXISTS daily_sales (
        sale_date TEXT PRIMARY KEY NOT NULL DEFAULT (date('now')),
        sale REAL NOT NULL
      );
      `)

  if (isNewDatabase) {
    const insert = db.prepare('INSERT INTO products (barcode, name, price) VALUES (?, ?, ?)');
    insert.run('4', 'Milk', 2.5);
    insert.run('3', 'Bread', 1.75);
    insert.run('2', 'Eggs', 3.0);
    insert.run('1', 'Mercancías Generales', 0);
  }
};

const createWindow = () => {
  const win = new BrowserWindow({
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png'), 
    webPreferences: {
      preload: path.join( __dirname , 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      additionalArguments: [`--userDataPath=${userDataPath}`] ,
    },
  })
  win.maximize();
  win.loadFile('index.html');
  
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})