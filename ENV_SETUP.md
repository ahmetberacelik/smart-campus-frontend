# Frontend Environment Variables Kurulumu

## 📝 .env Dosyası Oluşturma

Frontend'in backend'e bağlanabilmesi için `smart-campus-frontend` klasöründe `.env` dosyası oluşturmanız gerekiyor.

### Adımlar:

1. `smart-campus-frontend` klasörüne gidin
2. `.env` adında yeni bir dosya oluşturun
3. Aşağıdaki içeriği ekleyin:

```env
# =====================================================
# Smart Campus Frontend - Environment Variables
# =====================================================

# Backend API URL (API Gateway)
# API Gateway 8080 portunda çalışıyor
VITE_API_URL=http://localhost:8080/api/v1

# Mock API kullanımı (development için)
# true: Mock API kullan (backend olmadan test için)
# false: Gerçek backend API kullan
VITE_USE_MOCK_API=false
```

### Önemli Notlar:

- ✅ **API Gateway Port**: `8080` - Frontend API Gateway'e bağlanıyor
- ✅ **Base Path**: `/api/v1` - Tüm API endpoint'leri bu path altında
- ✅ **Mock API**: `false` - Gerçek backend kullanılacak

### Development vs Production:

**Development (Local):**
```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_USE_MOCK_API=false
```

**Production:**
```env
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_USE_MOCK_API=false
```

### Dosya Oluşturma (Windows PowerShell):

```powershell
cd smart-campus-frontend
@"
# Backend API URL
VITE_API_URL=http://localhost:8080/api/v1

# Mock API
VITE_USE_MOCK_API=false
"@ | Out-File -FilePath .env -Encoding utf8
```

### Dosya Oluşturma (Linux/Mac):

```bash
cd smart-campus-frontend
cat > .env << EOF
# Backend API URL
VITE_API_URL=http://localhost:8080/api/v1

# Mock API
VITE_USE_MOCK_API=false
EOF
```

### Kontrol:

`.env` dosyasını oluşturduktan sonra:

1. Frontend'i yeniden başlatın (Vite dev server'ı restart edin)
2. Browser console'da `import.meta.env.VITE_API_URL` değerini kontrol edin
3. Network tab'da isteklerin `http://localhost:8080/api/v1` adresine gittiğini doğrulayın

### Sorun Giderme:

- **404 Hatası**: API Gateway'in çalıştığından emin olun (`http://localhost:8080/actuator/health`)
- **CORS Hatası**: API Gateway'de CORS ayarlarını kontrol edin
- **Environment Variable Okunmuyor**: Vite dev server'ı restart edin

