import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
/** Aynı kişi kabul eşiği: düşük = daha sıkı (sadece gerçekten eşleşen yüzler kabul) */
const THRESHOLD = 0.38;
/** Yüz kutusu minimum boyut (px) – küçük/yarım yüz reddedilir */
const MIN_FACE_SIZE = 120;

let modelsLoaded = false;

export async function loadFaceModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (e) {
    console.error('Face models load error:', e);
    return false;
  }
}

export async function getDescriptorFromVideo(video: HTMLVideoElement): Promise<number[] | null> {
  const result = await faceapi
    .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.8 }))
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  const box = result.detection.box;
  if (box.width < MIN_FACE_SIZE || box.height < MIN_FACE_SIZE) return null;
  return Array.from(result.descriptor);
}

export function compareDescriptors(a: number[], b: number[]): number {
  return faceapi.euclideanDistance(a as Float32Array, b as Float32Array);
}

export function isMatch(distance: number): boolean {
  return distance < THRESHOLD;
}
