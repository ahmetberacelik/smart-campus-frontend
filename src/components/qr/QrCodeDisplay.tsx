import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/common/Button';
import './QrCodeDisplay.css';

interface QrCodeDisplayProps {
  value: string; // QR kod içeriği
  size?: number; // QR kod boyutu (px)
  title?: string; // Başlık
  description?: string; // Açıklama
  showFullScreen?: boolean; // Full-screen butonu göster
  className?: string;
}

/**
 * QR Kod gösterim component'i
 * Full-screen modal ile büyütülmüş görünüm
 */
export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 200,
  title,
  description,
  showFullScreen = true,
  className = '',
}) => {
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  if (!value) {
    return (
      <div className={`qr-code-display empty ${className}`}>
        <p>QR kod bulunamadı</p>
      </div>
    );
  }

  return (
    <>
      <div className={`qr-code-display ${className}`}>
        {title && <h4 className="qr-title">{title}</h4>}
        <div className="qr-wrapper">
          <QRCodeSVG value={value} size={size} level="H" />
        </div>
        {description && <p className="qr-description">{description}</p>}
        {showFullScreen && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsFullScreenOpen(true)}
            style={{ marginTop: '12px' }}
          >
            📱 Tam Ekran Görüntüle
          </Button>
        )}
      </div>

      {/* Full-screen Modal */}
      <Modal
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
        title={title || 'QR Kod'}
        size="lg"
        className="qr-fullscreen-modal"
      >
        <div className="qr-fullscreen-content">
          {description && <p className="qr-fullscreen-description">{description}</p>}
          <div className="qr-fullscreen-wrapper">
            <QRCodeSVG value={value} size={400} level="H" />
          </div>
          <p className="qr-hint">QR kodu taramak için yaklaştırın</p>
        </div>
      </Modal>
    </>
  );
};

