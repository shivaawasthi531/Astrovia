/**
 * Camera screen — live preview + hand-position guide overlay + capture.
 * On capture, uploads the photo via palmService and navigates to the
 * result screen once the AI pipeline completes.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { HandOverlay } from '../../src/components/camera/HandOverlay';
import { CaptureButton } from '../../src/components/camera/CaptureButton';
import { Loader } from '../../src/components/common/Loader';
import { Button } from '../../src/components/common/Button';
import { useCamera } from '../../src/hooks/useCamera';
import { usePalmStore } from '../../src/store/palmStore';
import { palmService } from '../../src/services/palmService';
import { Colors } from '../../src/constants/colors';

export default function CameraScreen() {
  const { permission, requestPermission, cameraRef, capturePhoto } = useCamera();
  const { isScanning, error, setScanning, setReading, setError, reset } = usePalmStore();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const handleCapture = async () => {
    const uri = await capturePhoto();
    if (uri) setPreviewUri(uri);
  };

  const handleSubmit = async () => {
    if (!previewUri) return;
    setScanning(true);
    try {
      const reading = await palmService.scanPalm(previewUri);
      setReading(reading);
      router.replace(`/result/${reading.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Palm scan failed. Please try again.');
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    reset();
  };

  if (!permission) {
    return <View style={styles.root} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.permissionText}>Camera access is needed to scan your palm.</Text>
        <Button label="Grant Permission" onPress={requestPermission} style={styles.permissionButton} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {!previewUri ? (
        <>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
          <HandOverlay />
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color={Colors.textPrimary} />
          </Pressable>
          <Text style={styles.instruction}>Position your palm within the outline</Text>
          <View style={styles.captureWrap}>
            <CaptureButton onPress={handleCapture} />
          </View>
        </>
      ) : (
        <View style={[styles.root, styles.centered]}>
          {isScanning ? (
            <>
              <Loader />
              <Text style={styles.scanningText}>Reading your palm lines...</Text>
            </>
          ) : (
            <>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <View style={styles.previewActions}>
                <Button label="Retake" onPress={handleRetake} variant="secondary" style={styles.actionButton} />
                <Button label="Analyze" onPress={handleSubmit} style={styles.actionButton} />
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  closeButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
  instruction: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  captureWrap: { position: 'absolute', bottom: 50, alignSelf: 'center' },
  permissionText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  permissionButton: { width: '100%' },
  scanningText: { fontFamily: 'Poppins_400Regular', fontSize: 14, color: Colors.textSecondary },
  errorText: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: Colors.error, textAlign: 'center' },
  previewActions: { flexDirection: 'row', gap: 12, width: '100%' },
  actionButton: { flex: 1 },
});