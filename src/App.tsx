import { useState, useEffect, useCallback } from 'react';
import { PinInput } from '@/components/PinInput';
import { FaceCapture } from '@/components/FaceCapture';
import { validatePinStrength } from '@/vault';

type Screen = 'loading' | 'no-electron' | 'setup-pin' | 'setup-face' | 'login-choice' | 'login-pin' | 'login-face' | 'vault';

interface VaultFile {
  id: string;
  name: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [faceError, setFaceError] = useState('');
  const [afterFaceAuth, setAfterFaceAuth] = useState(false);

  const checkSetup = useCallback(async () => {
    if (typeof window.vault?.hasSetup !== 'function') {
      setScreen('no-electron');
      return;
    }
    const has = await window.vault.hasSetup();
    setScreen(has ? 'login-choice' : 'setup-pin');
  }, []);

  useEffect(() => {
    checkSetup();
  }, [checkSetup]);

  const handleSetupPin = useCallback(
    async (value: string) => {
      const v = validatePinStrength(value);
      if (!v.valid) {
        setPinError(v.message || 'Geçersiz PIN');
        return;
      }
      setPinError('');
      const { ok } = await window.vault.setupPin(value);
      if (!ok) {
        setPinError('Kayıt başarısız');
        return;
      }
      setPin(value);
      setScreen('setup-face');
    },
    []
  );

  const handleSetupFace = useCallback(async (descriptor: number[]) => {
    setFaceError('');
    const { ok } = await window.vault.saveFaceDescriptor(descriptor);
    if (!ok) {
      setFaceError('Yüz kaydı başarısız');
      return;
    }
    setPin('');
    setScreen('login-choice');
  }, []);

  const handleLoginPin = useCallback(async (value: string) => {
    setPinError('');
    const { ok } = await window.vault.verifyPin(value);
    if (!ok) {
      setPinError('Yanlış PIN');
      return;
    }
    setPin(value);
    setScreen('vault');
  }, []);

  const handleLoginFace = useCallback(
    async (descriptor: number[]) => {
      setFaceError('');
      const { descriptor: stored } = await window.vault.getFaceDescriptor();
      if (!stored || stored.length === 0) {
        setFaceError('Kayıtlı yüz bulunamadı. Önce kurulumu tamamlayın.');
        return;
      }
      const { compareDescriptors, isMatch } = await import('@/lib/faceRecognition');
      const distance = compareDescriptors(descriptor, stored);
      if (!isMatch(distance)) {
        setFaceError('Yüz eşleşmedi. Tekrar deneyin.');
        return;
      }
      setAfterFaceAuth(true);
      setScreen('login-pin');
    },
    []
  );

  const handleLock = useCallback(() => {
    setPin('');
    setAfterFaceAuth(false);
    setScreen('login-choice');
  }, []);

  if (screen === 'loading') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Yükleniyor...
      </div>
    );
  }

  if (screen === 'no-electron') {
    return (
      <div style={{ maxWidth: 320, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Güvenli Kasa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Bu uygulama masaüstü modunda çalışır. Terminalde şu komutu çalıştırın:
        </p>
        <code
          style={{
            display: 'block',
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            textAlign: 'left',
          }}
        >
          npm run electron:dev
        </code>
      </div>
    );
  }

  if (screen === 'setup-pin') {
    return (
      <div style={{ width: '100%', maxWidth: 320 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Güvenli Kasa Kurulumu</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Güçlü bir PIN belirleyin (en az 6 rakam, 3 farklı rakam)
        </p>
        <PinInput length={6} onSubmit={handleSetupPin} error={pinError} />
      </div>
    );
  }

  if (screen === 'setup-face') {
    return (
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Yüzünüzü Kaydedin</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Girişte doğrulama için yüzünüzü kaydedin
        </p>
        <FaceCapture onCapture={handleSetupFace} onError={setFaceError} />
        {faceError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {faceError}
          </p>
        )}
      </div>
    );
  }

  if (screen === 'login-choice') {
    return (
      <div style={{ width: '100%', maxWidth: 320 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Güvenli Kasa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Giriş yapmak için bir yöntem seçin
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={() => setScreen('login-pin')}
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            PIN ile giriş
          </button>
          <button
            type="button"
            onClick={() => setScreen('login-face')}
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Yüz ile giriş
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login-pin') {
    return (
      <div style={{ width: '100%', maxWidth: 320 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Güvenli Kasa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          {afterFaceAuth ? "Yüz doğrulandı. Kasaya erişmek için PIN'inizi girin." : 'PIN girin'}
        </p>
        <PinInput label="" onSubmit={handleLoginPin} error={pinError} length={6} />
        {afterFaceAuth && (
          <button
            type="button"
            onClick={() => { setAfterFaceAuth(false); setScreen('login-choice'); }}
            style={{
              marginTop: '1rem',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            ← Giriş seçeneklerine dön
          </button>
        )}
      </div>
    );
  }

  if (screen === 'login-face') {
    return (
      <div style={{ width: '100%', maxWidth: 360 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Güvenli Kasa</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Yüzünüzü kameraya gösterin
        </p>
        <FaceCapture
          title="Yüzünüzü kameraya gösterin ve Doğrula'ya tıklayın"
          onCapture={handleLoginFace}
          onError={setFaceError}
        />
        {faceError && (
          <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {faceError}
          </p>
        )}
        <button
          type="button"
          onClick={() => setScreen('login-choice')}
          style={{
            marginTop: '1rem',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          ← Giriş seçeneklerine dön
        </button>
      </div>
    );
  }

  return (
    <VaultScreen pin={pin} onLock={handleLock} />
  );
}

function VaultScreen({ pin, onLock }: { pin: string; onLock: () => void }) {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { files: list } = await window.vault.listFiles(pin);
    setFiles(list);
    setLoading(false);
  }, [pin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFile = async () => {
    const result = await window.dialog.openFile();
    if (result.canceled || !result.name || !result.dataBase64) return;
    const { ok } = await window.vault.addFile(pin, result.name, result.dataBase64);
    if (ok) refresh();
  };

  const downloadFile = async (id: string, name: string) => {
    const { ok, dataBase64 } = await window.vault.getFile(pin, id);
    if (!ok || !dataBase64) return;
    await window.dialog.saveFile(name, dataBase64);
  };

  const deleteFile = async (id: string) => {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    const { ok } = await window.vault.deleteFile(pin, id);
    if (ok) refresh();
  };

  return (
    <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.25rem' }}>Güvenli Kasa</h1>
        <button
          type="button"
          onClick={onLock}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--surface)',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
          }}
        >
          Kilitle
        </button>
      </div>
      <button
        type="button"
        onClick={addFile}
        style={{
          padding: '0.75rem 1rem',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
        }}
      >
        + Dosya Ekle
      </button>
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Yükleniyor...</p>
      ) : files.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Henüz dosya yok. "Dosya Ekle" ile ekleyin.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.map((f) => (
            <li
              key={f.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.name}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => downloadFile(f.id, f.name)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: 'var(--surface-hover)',
                    color: 'var(--text)',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                  }}
                >
                  İndir
                </button>
                <button
                  type="button"
                  onClick={() => deleteFile(f.id)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    background: 'var(--danger)',
                    color: 'white',
                    borderRadius: 6,
                    fontSize: '0.8rem',
                  }}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
