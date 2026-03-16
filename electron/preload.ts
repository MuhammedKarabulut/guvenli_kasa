import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('vault', {
  hasSetup: () => ipcRenderer.invoke('vault:has-setup'),
  setupPin: (pin: string) => ipcRenderer.invoke('vault:setup-pin', pin),
  verifyPin: (pin: string) => ipcRenderer.invoke('vault:verify-pin', pin),
  saveFaceDescriptor: (descriptor: number[]) => ipcRenderer.invoke('vault:save-face-descriptor', descriptor),
  getFaceDescriptor: () => ipcRenderer.invoke('vault:get-face-descriptor'),
  listFiles: (pin: string) => ipcRenderer.invoke('vault:list-files', pin),
  addFile: (pin: string, name: string, dataBase64: string) => ipcRenderer.invoke('vault:add-file', pin, name, dataBase64),
  getFile: (pin: string, id: string) => ipcRenderer.invoke('vault:get-file', pin, id),
  deleteFile: (pin: string, id: string) => ipcRenderer.invoke('vault:delete-file', pin, id),
});

contextBridge.exposeInMainWorld('dialog', {
  openFile: () => ipcRenderer.invoke('dialog:open-file'),
  saveFile: (defaultName: string, dataBase64: string) => ipcRenderer.invoke('dialog:save-file', defaultName, dataBase64),
});

declare global {
  interface Window {
    vault: {
      hasSetup: () => Promise<boolean>;
      setupPin: (pin: string) => Promise<{ ok: boolean }>;
      verifyPin: (pin: string) => Promise<{ ok: boolean }>;
      saveFaceDescriptor: (descriptor: number[]) => Promise<{ ok: boolean }>;
      getFaceDescriptor: () => Promise<{ descriptor: number[] | null }>;
      listFiles: (pin: string) => Promise<{ files: { id: string; name: string }[] }>;
      addFile: (pin: string, name: string, dataBase64: string) => Promise<{ ok: boolean; id?: string; error?: string }>;
      getFile: (pin: string, id: string) => Promise<{ ok: boolean; dataBase64?: string }>;
      deleteFile: (pin: string, id: string) => Promise<{ ok: boolean }>;
    };
    dialog: {
      openFile: () => Promise<{ canceled: boolean; name?: string; dataBase64?: string }>;
      saveFile: (defaultName: string, dataBase64: string) => Promise<{ canceled: boolean }>;
    };
  }
}
