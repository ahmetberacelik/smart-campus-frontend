# Network Error Çözümü

## Sorun
Frontend'de API çağrıları yapılırken "Network Error" alınıyor.

## Olası Nedenler ve Çözümler

### 1. Backend URL Yapılandırması

**Sorun**: Backend URL'i yanlış veya eksik yapılandırılmış.

**Çözüm**: 
1. `smart-campus-frontend` klasöründe `.env` dosyası oluşturun (yoksa):
   ```env
   VITE_API_URL=http://138.68.99.35:8080/api/v1
   ```

2. Eğer local development yapıyorsanız:
   ```env
   VITE_API_URL=http://localhost:8080/api/v1
   ```

3. Dosyayı kaydedin ve development server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

### 2. Backend Çalışmıyor

**Kontrol**: Backend'in çalıştığından emin olun:
- Backend server'ın çalıştığını kontrol edin
- `http://138.68.99.35:8080/actuator/health` (veya backend health endpoint) çalışıyor mu?

### 3. CORS Sorunu

**Sorun**: Backend CORS ayarları frontend'e izin vermiyor.

**Çözüm**: Backend'de CORS ayarlarını kontrol edin:
- Frontend URL'i (http://localhost:3000 veya production URL) allowed origins'de olmalı
- Backend'de CORS configuration'ı kontrol edin

### 4. Port/URL Yanlış

**Kontrol**: 
- Backend port'u doğru mu? (8080 yerine başka bir port kullanılıyor olabilir)
- Backend URL'i doğru mu? (IP adresi veya domain doğru mu?)

### 5. Firewall/Network Sorunu

**Kontrol**:
- Firewall backend port'unu engelliyor mu?
- Network bağlantısı var mı?
- VPN gerekli mi?

## Debug İpuçları

1. **Browser Console'u kontrol edin**:
   - Network tab'ında failed request'leri görün
   - Console'da error mesajlarını kontrol edin
   - Error mesajında BASE_URL bilgisi görünecek

2. **API Client Log'ları**:
   - Console'da `❌ Network Error:` log'larını kontrol edin
   - Base URL ve full URL bilgilerini görün

3. **Manuel Test**:
   ```bash
   # Backend health check
   curl http://138.68.99.35:8080/actuator/health
   
   # Veya browser'da açın:
   http://138.68.99.35:8080/actuator/health
   ```

## Hızlı Çözüm

1. `.env` dosyasını oluşturun/güncelleyin:
   ```env
   VITE_API_URL=http://138.68.99.35:8080/api/v1
   ```

2. Development server'ı yeniden başlatın:
   ```bash
   # Ctrl+C ile durdurun
   npm run dev
   ```

3. Browser console'u kontrol edin - artık daha detaylı error mesajları göreceksiniz.

## Not

Network error handling iyileştirildi. Artık error mesajlarında:
- Base URL bilgisi
- Full URL bilgisi
- Error code
- Daha açıklayıcı mesajlar

göreceksiniz.

