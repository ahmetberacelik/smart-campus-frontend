import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationMap.css';

// Leaflet default icon'larını düzelt (CDN kullanmadan çalışması için)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationMapProps {
  center: [number, number]; // [lat, lng]
  userLocation?: [number, number]; // Kullanıcının konumu
  radius?: number; // Geofence yarıçapı (metre)
  zoom?: number;
  className?: string;
  height?: string;
  showDistance?: boolean;
  targetLabel?: string;
  userLabel?: string;
}

/**
 * Leaflet kullanarak konum gösterimi ve mesafe hesaplama
 */
export const LocationMap: React.FC<LocationMapProps> = ({
  center,
  userLocation,
  radius = 15,
  zoom = 17,
  className = '',
  height = '300px',
  showDistance = true,
  targetLabel = 'Hedef Konum',
  userLabel = 'Konumunuz',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ target?: L.Marker; user?: L.Marker }>({});
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Harita oluştur
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      // Tile layer ekle (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;

    // Hedef konum marker'ı
    if (!markersRef.current.target) {
      markersRef.current.target = L.marker(center, {
        title: targetLabel,
      })
        .addTo(map)
        .bindPopup(targetLabel);
    } else {
      markersRef.current.target.setLatLng(center);
    }

    // Geofence circle
    if (circleRef.current) {
      circleRef.current.setLatLng(center);
      circleRef.current.setRadius(radius);
    } else {
      circleRef.current = L.circle(center, {
        radius: radius,
        color: '#3388ff',
        fillColor: '#3388ff',
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);
    }

    // Kullanıcı konumu marker'ı
    if (userLocation) {
      if (!markersRef.current.user) {
        markersRef.current.user = L.marker(userLocation, {
          title: userLabel,
          icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        })
          .addTo(map)
          .bindPopup(userLabel);
      } else {
        markersRef.current.user.setLatLng(userLocation);
      }

      // Her iki konumu da görmek için bounds ayarla
      const group = new L.FeatureGroup([
        markersRef.current.target,
        markersRef.current.user!,
      ]);
      map.fitBounds(group.getBounds().pad(0.1));
    } else {
      map.setView(center, zoom);
    }

    // Cleanup
    return () => {
      // Component unmount olurken marker'ları temizle ama map'i koru
      // (map instance'ı sadece component tamamen unmount olduğunda temizlenecek)
    };
  }, [center, userLocation, radius, zoom, targetLabel, userLabel]);

  // Mesafe hesaplama (Haversine formülü)
  const calculateDistance = (): number | null => {
    if (!userLocation) return null;

    const R = 6371e3; // Dünya yarıçapı (metre)
    const φ1 = (center[0] * Math.PI) / 180;
    const φ2 = (userLocation[0] * Math.PI) / 180;
    const Δφ = ((userLocation[0] - center[0]) * Math.PI) / 180;
    const Δλ = ((userLocation[1] - center[1]) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Metre cinsinden mesafe
  };

  const distance = calculateDistance();
  const isWithinRadius = distance !== null && distance <= radius;

  return (
    <div className={`location-map-container ${className}`}>
      {showDistance && userLocation && distance !== null && (
        <div className={`distance-indicator ${isWithinRadius ? 'within-radius' : 'outside-radius'}`}>
          <span className="distance-label">Mesafe:</span>
          <span className="distance-value">
            {distance < 1000
              ? `${distance.toFixed(0)} m`
              : `${(distance / 1000).toFixed(2)} km`}
          </span>
          {isWithinRadius ? (
            <span className="distance-status">✓ İzin verilen alan içinde</span>
          ) : (
            <span className="distance-status">✗ İzin verilen alan dışında</span>
          )}
        </div>
      )}
      <div ref={mapRef} className="location-map" style={{ height }} />
    </div>
  );
};

