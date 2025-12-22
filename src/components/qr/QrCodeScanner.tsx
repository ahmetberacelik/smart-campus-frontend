import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { TextInput } from '@/components/common/TextInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import './QrCodeScanner.css';

interface QrCodeScannerProps {
  onScan: (qrCode: string) => void;
  onError?: (error: string) => void;
  title?: string;
  showManualInput?: boolean;
  className?: string;
}

/**
 * QR Kod tarama component'i
 * Webcam veya manuel input ile QR kod okuma
 */
export const QrCodeScanner: React.FC<QrCodeScannerProps> = ({
  onScan,
  onError,
  title = 'QR Kod Tara',
  showManualInput = true,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string>('');

  // QR kod okuma için basit bir yaklaşım (gerçek uygulamada jsQR veya html5-qrcode kullanılabilir)
  const scanQrCode = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQrCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // QR kod okuma için harici kütüphane gerekli (jsQR, html5-qrcode, etc.)
    // Şimdilik manuel input kullanıyoruz

    if (isScanning) {
      requestAnimationFrame(scanQrCode);
    }
  };

  const startScanning = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanQrCode();
      }
    } catch (err: any) {
      const errorMessage = 'Kamera açılamadı. Lütfen kamera iznini kontrol edin.';
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      console.error('Camera error:', err);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={`qr-scanner ${className}`}>
      {title && <h3 className="scanner-title">{title}</h3>}

      {error && (
        <div className="scanner-error">
          <p>{error}</p>
        </div>
      )}

      {isScanning ? (
        <div className="scanner-active">
          <video
            ref={videoRef}
            className="scanner-video"
            playsInline
            autoPlay
            muted
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <Button
            variant="secondary"
            onClick={stopScanning}
            fullWidth
            style={{ marginTop: '12px' }}
          >
            Taramayı Durdur
          </Button>
          <p className="scanner-hint">
            QR kodu kameraya yaklaştırın
          </p>
        </div>
      ) : (
        <div className="scanner-inactive">
          <Button
            onClick={startScanning}
            fullWidth
          >
            📷 Kamerayı Aç ve Tara
          </Button>
          <p className="scanner-hint">
            QR kodu taramak için kamerayı açın veya manuel olarak girin
          </p>
        </div>
      )}

      {showManualInput && (
        <div className="manual-input-section">
          <p className="manual-hint">veya QR kod içeriğini manuel olarak girin:</p>
          <div className="manual-input-group">
            <TextInput
              type="text"
              placeholder="QR kod içeriğini yapıştırın..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleManualSubmit();
                }
              }}
            />
            <Button
              onClick={handleManualSubmit}
              disabled={!manualCode.trim()}
            >
              Doğrula
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

