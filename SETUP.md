# Kurulum Talimatları

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. MSW Service Worker'ı Başlatın

MSW'nin çalışması için service worker dosyasını oluşturmanız gerekiyor:

```bash
npx msw init public/ --save
```

Bu komut `public/mockServiceWorker.js` dosyasını oluşturacak.

### 3. Environment Dosyasını Oluşturun

```bash
cp .env.example .env
```

`.env` dosyasını açın ve gerekirse düzenleyin:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_USE_MOCK_API=true
```

### 4. Development Server'ı Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🔄 Mock API'dan Gerçek API'ye Geçiş

Backend hazır olduğunda:

1. `.env` dosyasını açın
2. `VITE_USE_MOCK_API=false` yapın
3. `VITE_API_URL` değerini gerçek backend URL'i ile güncelleyin
4. Uygulamayı yeniden başlatın

**Önemli:** Kod değişikliği gerekmez! Tüm API çağrıları otomatik olarak gerçek backend'e yönlendirilir.

## 📝 Test Kullanıcıları (Mock API)

Mock API aktifken şu kullanıcılarla giriş yapabilirsiniz:

### Öğrenci
- Email: `student@example.com`
- Şifre: `password123`

### Öğretim Üyesi
- Email: `faculty@example.com`
- Şifre: `password123`

### Admin
- Email: `admin@example.com`
- Şifre: `password123`

## 🛠️ Geliştirme Notları

### Yeni Endpoint Ekleme

1. **Endpoint tanımı ekleyin** (`src/config/api.config.ts`):
```typescript
export const API_ENDPOINTS = {
  // ... mevcut endpoint'ler
  YENI_MODUL: {
    LIST: '/yeni-modul',
    DETAIL: (id: string) => `/yeni-modul/${id}`,
  },
};
```

2. **Type tanımları ekleyin** (`src/types/api.types.ts`):
```typescript
export interface YeniModulType {
  id: string;
  name: string;
  // ...
}
```

3. **Service fonksiyonu ekleyin** (`src/services/api/yeni-modul.service.ts`):
```typescript
export const yeniModulService = {
  async getList(): Promise<ApiResponse<YeniModulType[]>> {
    const response = await apiClient.get(API_ENDPOINTS.YENI_MODUL.LIST);
    return response.data;
  },
};
```

4. **Mock handler ekleyin** (`src/services/mocks/handlers.ts`):
```typescript
http.get(`${API_BASE}${API_ENDPOINTS.YENI_MODUL.LIST}`, () => {
  return HttpResponse.json<ApiResponse<YeniModulType[]>>({
    success: true,
    data: mockData.yeniModulList,
  });
}),
```

### TypeScript Path Aliases

Projede path alias'lar kullanılıyor:

```typescript
import { API_CONFIG } from '@/config/api.config';
import { User } from '@/types/api.types';
import { authService } from '@/services/api/auth.service';
```

## 🐛 Sorun Giderme

### MSW çalışmıyor

1. Service worker dosyasının oluşturulduğundan emin olun:
```bash
npx msw init public/ --save
```

2. Browser console'da hata var mı kontrol edin
3. Browser cache'ini temizleyin

### API çağrıları çalışmıyor

1. `.env` dosyasının doğru yapılandırıldığından emin olun
2. `VITE_USE_MOCK_API` değerinin doğru olduğundan emin olun
3. Browser DevTools > Network tab'ında istekleri kontrol edin

### TypeScript hataları

1. `npm run build` komutu ile type kontrolü yapın
2. IDE'nizin TypeScript versiyonunu kontrol edin
3. `node_modules` klasörünü silip `npm install` yapın

## 📚 Ek Kaynaklar

- [Vite Dokümantasyonu](https://vitejs.dev/)
- [React Router Dokümantasyonu](https://reactrouter.com/)
- [MSW Dokümantasyonu](https://mswjs.io/)
- [Axios Dokümantasyonu](https://axios-http.com/)

