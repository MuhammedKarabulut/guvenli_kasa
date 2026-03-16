/// <reference types="vite/client" />

interface Window {
  vault?: {
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
  dialog?: {
    openFile: () => Promise<{ canceled: boolean; name?: string; dataBase64?: string }>;
    saveFile: (defaultName: string, dataBase64: string) => Promise<{ canceled: boolean }>;
  };
}
