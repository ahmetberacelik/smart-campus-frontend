# Frontend Troubleshooting Guide

## 404 Hataları

### Sorun: API çağrıları 404 veriyor

**Çözüm Adımları:**

1. **Backend'in çalıştığını kontrol et:**
   ```bash
   # Terminal'de
   docker-compose ps
   
   # Browser'da
   http://localhost:8081/actuator/health
   ```

2. **API Gateway'i restart et:**
   ```bash
   docker-compose restart api-gateway
   ```

3. **Backend'i restart et:**
   ```bash
   docker-compose restart auth-service
   ```

4. **Swagger UI'dan test et:**
   - http://localhost:8081/swagger-ui.html
   - `/api/v1/courses` endpoint'ini test et
   - "Try it out" butonuna tıkla

5. **Browser Console'u kontrol et:**
   - F12 → Console
   - Hata mesajlarını oku
   - Network tab'da request/response'ları kontrol et

## Yaygın Hatalar

### 1. "Dersler yüklenirken bir hata oluştu"

**Nedenler:**
- Backend çalışmıyor
- API Gateway route'ları eksik
- Network bağlantısı yok

**Çözüm:**
```bash
# Backend'i başlat
docker-compose up -d

# Logları kontrol et
docker-compose logs -f auth-service
```

### 2. CORS Hatası

**Hata:**
```
Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Çözüm:**
- Backend'de CORS ayarlarını kontrol et
- `application.properties`'te `app.cors.allowed-origins` ayarını yap

### 3. 401 Unauthorized

**Hata:**
```
401 Unauthorized
```

**Çözüm:**
- Login yapın
- Token'ın geçerli olduğundan emin olun
- Browser DevTools → Application → Local Storage → `accessToken` kontrol edin

### 4. Response Format Hatası

**Sorun:**
- Data geliyor ama görünmüyor
- `data?.data?.content` undefined

**Çözüm:**
- Backend'den gelen response formatını kontrol et
- Browser DevTools → Network → Response'u incele
- Console'da `console.log(data)` ile response'u görüntüle

## Debug İpuçları

### 1. Console Logging
```typescript
// Service dosyalarında
console.log('API Response:', response.data);
```

### 2. Network Tab
- F12 → Network
- Fetch/XHR filtresi
- Request URL'lerini kontrol et
- Response'ları incele

### 3. Backend Logs
```bash
docker-compose logs -f auth-service | grep -i "error\|exception"
```

### 4. API Gateway Logs
```bash
docker-compose logs -f api-gateway
```

## Test Endpoint'leri

### Health Check
```bash
curl http://localhost:8081/actuator/health
```

### Courses (Public - No Auth)
```bash
curl http://localhost:8080/api/v1/courses
```

### My Courses (Auth Required)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/enrollments/my-courses
```

## Environment Variables

Frontend `.env` dosyası:
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=false
```

## Hızlı Çözüm

Eğer hiçbir şey çalışmıyorsa:

1. **Tüm servisleri durdur:**
   ```bash
   docker-compose down
   ```

2. **Temiz başlat:**
   ```bash
   docker-compose up -d --build
   ```

3. **Logları takip et:**
   ```bash
   docker-compose logs -f
   ```

4. **Frontend'i restart et:**
   ```bash
   # Frontend dizininde
   npm run dev
   ```

5. **Browser'ı yenile:**
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
   - Cache'i temizle

