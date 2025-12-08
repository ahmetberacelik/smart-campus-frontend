# Smart Campus Frontend

Akıllı Kampüs Ekosistem Yönetim Platformu - Frontend Uygulaması

## 🚀 Özellikler

- ⚡ Vite ile hızlı geliştirme
- ⚛️ React 18 + TypeScript
- 🎨 Modern UI/UX
- 🔄 MSW ile Mock API desteği
- 📱 Responsive tasarım
- 🔐 JWT Authentication
- 🗺️ GPS entegrasyonu (Leaflet)
- 📊 Chart görselleştirmeleri (Recharts)
- 🎫 QR kod desteği

## 📋 Gereksinimler

- Node.js 18+ LTS
- npm veya yarn

## 🛠️ Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. MSW Service Worker'ı başlatın:
```bash
npx msw init public/ --save
```

3. Environment dosyasını oluşturun:
```bash
cp .env.example .env
```

4. Development server'ı başlatın:
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🔧 Yapılandırma

### Mock API Kullanımı

Development'ta mock API kullanmak için `.env` dosyasında:

```env
VITE_USE_MOCK_API=true
VITE_API_URL=http://localhost:5000/api/v1
```

### Backend Entegrasyonu

Backend hazır olduğunda:

1. `.env` dosyasını güncelleyin:
```env
VITE_USE_MOCK_API=false
VITE_API_URL=http://your-backend-url:5000/api/v1
```

2. MSW otomatik olarak devre dışı kalacak ve gerçek API kullanılacak.

## 📁 Proje Yapısı

```
src/
├── components/      # React bileşenleri
├── pages/          # Sayfa bileşenleri
├── services/       # API servisleri
│   ├── api/        # Gerçek API çağrıları
│   └── mocks/      # MSW mock handlers
├── hooks/          # Custom React hooks
├── utils/           # Yardımcı fonksiyonlar
├── types/           # TypeScript type tanımları
├── config/          # Konfigürasyon dosyaları
└── App.tsx          # Ana uygulama bileşeni
```

## 🧪 Test

```bash
# Testleri çalıştır
npm run test

# Test coverage
npm run test:coverage

# Test UI
npm run test:ui
```

## 📦 Build

Production build için:

```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 🔐 Authentication

Uygulama JWT tabanlı authentication kullanır:

- Access Token: 15 dakika geçerlilik
- Refresh Token: 7 gün geçerlilik
- Token'lar otomatik olarak yenilenir

## 📝 API Endpoints

Tüm endpoint'ler `src/config/api.config.ts` dosyasında tanımlanmıştır.

Backend hazır olduğunda sadece bu dosyadaki `BASE_URL` değerini güncellemeniz yeterlidir.

## 🎯 Geliştirme Notları

### Mock API'dan Gerçek API'ye Geçiş

1. `.env` dosyasında `VITE_USE_MOCK_API=false` yapın
2. `VITE_API_URL` değerini gerçek backend URL'i ile güncelleyin
3. Kod değişikliği gerekmez! Tüm API çağrıları otomatik olarak gerçek backend'e yönlendirilir.

### Yeni Endpoint Ekleme

1. `src/config/api.config.ts` dosyasına endpoint ekleyin
2. `src/types/api.types.ts` dosyasına type tanımları ekleyin
3. `src/services/api/` klasörüne service fonksiyonu ekleyin
4. Mock için `src/services/mocks/handlers.ts` dosyasına handler ekleyin

## 📄 Lisans

Bu proje eğitim amaçlıdır.

## 👥 Ekip

- Frontend Developer: [İsminiz]

## 📞 İletişim

Sorularınız için: [Email]
