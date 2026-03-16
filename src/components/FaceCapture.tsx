import { useRef, useEffect, useState } from 'react';
import { getDescriptorFromVideo, loadFaceModels } from '@/lib/faceRecognition';

type Props = {
  onCapture: (descriptor: number[]) => void;
  onError: (message: string) => void;
  title?: string;
};

export function FaceCapture({ onCapture, onError, title = 'Yüzünüzü kameraya gösterin' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await loadFaceModels();
      if (cancelled) return;
      if (!ok) {
        onError('Yüz tanıma modelleri yüklenemedi. /public/models klasörüne model dosyalarını ekleyin.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
      } catch {
        onError('Kamera erişimi alınamadı. Kamera iznini verin.');
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onError]);

  const tryCapture = async () => {
    if (!videoRef.current || !ready || checking) return;
    setChecking(true);
    try {
      const descriptor = await getDescriptorFromVideo(videoRef.current);
      if (descriptor) {
        onCapture(descriptor);
      } else {
        onError('Yüz algılanamadı. Işığa dönün ve tekrar deneyin.');
      }
    } catch {
      onError('Yüz okuma hatası.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{title}</p>
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          aspectRatio: '4/3',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          border: '2px solid var(--border)',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
      </div>
      <button
        type="button"
        onClick={tryCapture}
        disabled={!ready || checking}
        style={{
          padding: '0.75rem 1.5rem',
          background: checking ? 'var(--border)' : 'var(--accent)',
          color: 'white',
          borderRadius: 'var(--radius)',
          fontWeight: 600,
        }}
      >
        {checking ? 'Kontrol ediliyor...' : 'Doğrula'}
      </button>
    </div>
  );
}
