/**
 * Wraps expo-camera permission handling + photo capture in a simple hook.
 */
import { useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';

export function useCamera() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePhoto = async (): Promise<string | null> => {
    if (!cameraRef.current) return null;
    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85, base64: false });
      return photo?.uri || null;
    } finally {
      setIsCapturing(false);
    }
  };

  return { permission, requestPermission, cameraRef, capturePhoto, isCapturing };
}