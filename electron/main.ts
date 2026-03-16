import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const isDev = !app.isPackaged;
const VAULT_DIR = path.join(app.getPath('userData'), 'secure-vault');
const META_FILE = path.join(app.getPath('userData'), 'vault-meta.json');

function getWindow(): BrowserWindow | null {
  return BrowserWindow.getAllWindows()[0] || null;
}

function ensureVaultDir() {
  if (!fs.existsSync(VAULT_DIR)) fs.mkdirSync(VAULT_DIR, { recursive: true });
}

function deriveKey(pin: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(pin, salt, 100000, 32, 'sha256');
}

function encryptBuffer(data: Buffer, key: Buffer): { iv: string; encrypted: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return { iv: iv.toString('base64'), encrypted: Buffer.concat([encrypted, authTag]).toString('base64') };
}

function decryptBuffer(encryptedB64: string, ivB64: string, key: Buffer): Buffer {
  const iv = Buffer.from(ivB64, 'base64');
  const data = Buffer.from(encryptedB64, 'base64');
  const authTag = data.subarray(-16);
  const encrypted = data.subarray(0, -16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: 'Güvenli Kasa',
    resizable: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  ensureVaultDir();
  createWindow();
});

app.on('window-all-closed', () => app.quit());

ipcMain.handle('vault:has-setup', () => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    return !!(meta.pinHash && meta.salt);
  } catch {
    return false;
  }
});

ipcMain.handle('vault:setup-pin', (_e, pin: string) => {
  const salt = crypto.randomBytes(32);
  const hash = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('base64');
  const meta = { pinHash: hash, salt: salt.toString('base64'), faceDescriptor: null };
  fs.writeFileSync(META_FILE, JSON.stringify(meta), 'utf8');
  return { ok: true };
});

ipcMain.handle('vault:verify-pin', (_e, pin: string) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const salt = Buffer.from(meta.salt, 'base64');
    const hash = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('base64');
    return { ok: meta.pinHash === hash };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle('vault:save-face-descriptor', (_e, descriptor: number[]) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    meta.faceDescriptor = descriptor;
    fs.writeFileSync(META_FILE, JSON.stringify(meta), 'utf8');
    return { ok: true };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle('vault:get-face-descriptor', () => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    return { descriptor: meta.faceDescriptor };
  } catch {
    return { descriptor: null };
  }
});

ipcMain.handle('vault:list-files', async (_e, pin: string) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const salt = Buffer.from(meta.salt, 'base64');
    const key = deriveKey(pin, salt);
    const indexPath = path.join(VAULT_DIR, 'index.enc');
    if (!fs.existsSync(indexPath)) return { files: [] };
    const raw = fs.readFileSync(indexPath, 'utf8');
    const parts = raw.split('\n');
    const iv = parts[0];
    const enc = parts[1];
    const listJson = decryptBuffer(enc, iv, key).toString('utf8');
    const list = JSON.parse(listJson);
    return { files: list };
  } catch {
    return { files: [] };
  }
});

function getIndexPath() {
  return path.join(VAULT_DIR, 'index.enc');
}

function getFilePath(id: string) {
  return path.join(VAULT_DIR, `${id}.enc`);
}

ipcMain.handle('vault:add-file', async (_e, pin: string, name: string, dataBase64: string) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const salt = Buffer.from(meta.salt, 'base64');
    const key = deriveKey(pin, salt);
    const data = Buffer.from(dataBase64, 'base64');
    const id = crypto.randomBytes(16).toString('hex');
    const { iv, encrypted } = encryptBuffer(data, key);
    fs.writeFileSync(getFilePath(id), `${iv}\n${encrypted}`, 'utf8');
    let list: { id: string; name: string }[] = [];
    const indexPath = getIndexPath();
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, 'utf8');
      const [ivStr, encStr] = raw.split('\n');
      list = JSON.parse(decryptBuffer(encStr, ivStr, key).toString('utf8'));
    }
    list.push({ id, name });
    const { iv: idxIv, encrypted: idxEnc } = encryptBuffer(Buffer.from(JSON.stringify(list), 'utf8'), key);
    fs.writeFileSync(indexPath, `${idxIv}\n${idxEnc}`, 'utf8');
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
});

ipcMain.handle('vault:get-file', async (_e, pin: string, id: string) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const salt = Buffer.from(meta.salt, 'base64');
    const key = deriveKey(pin, salt);
    const fp = getFilePath(id);
    if (!fs.existsSync(fp)) return { ok: false };
    const raw = fs.readFileSync(fp, 'utf8');
    const [iv, enc] = raw.split('\n');
    const dec = decryptBuffer(enc, iv, key);
    return { ok: true, dataBase64: dec.toString('base64') };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle('vault:delete-file', async (_e, pin: string, id: string) => {
  try {
    const meta = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    const salt = Buffer.from(meta.salt, 'base64');
    const key = deriveKey(pin, salt);
    const indexPath = getIndexPath();
    let list: { id: string; name: string }[] = [];
    if (fs.existsSync(indexPath)) {
      const raw = fs.readFileSync(indexPath, 'utf8');
      const [ivStr, encStr] = raw.split('\n');
      list = JSON.parse(decryptBuffer(encStr, ivStr, key).toString('utf8'));
    }
    list = list.filter((f: { id: string }) => f.id !== id);
    const { iv, encrypted } = encryptBuffer(Buffer.from(JSON.stringify(list), 'utf8'), key);
    fs.writeFileSync(indexPath, `${iv}\n${encrypted}`, 'utf8');
    const fp = getFilePath(id);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    return { ok: true };
  } catch {
    return { ok: false };
  }
});

ipcMain.handle('dialog:open-file', async () => {
  const { dialog } = await import('electron');
  const w = getWindow();
  if (!w) return { canceled: true };
  const r = await dialog.showOpenDialog(w, { properties: ['openFile'], title: 'Dosya seç' });
  if (r.canceled || !r.filePaths.length) return { canceled: true };
  const buf = fs.readFileSync(r.filePaths[0]);
  const name = path.basename(r.filePaths[0]);
  return { canceled: false, name, dataBase64: buf.toString('base64') };
});

ipcMain.handle('dialog:save-file', async (_e, defaultName: string, dataBase64: string) => {
  const { dialog } = await import('electron');
  const w = getWindow();
  if (!w) return { canceled: true };
  const r = await dialog.showSaveDialog(w, { defaultPath: defaultName, title: 'Dışa aktar' });
  if (r.canceled || !r.filePath) return { canceled: true };
  const buf = Buffer.from(dataBase64, 'base64');
  fs.writeFileSync(r.filePath, buf);
  return { canceled: false };
});
