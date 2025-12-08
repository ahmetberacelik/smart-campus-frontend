/**
 * MSW Browser Setup
 * Bu dosya sadece development'ta çalışır
 * Production build'de otomatik olarak devre dışı kalır
 */

import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { API_CONFIG } from '@/config/api.config';

// MSW'yi sadece mock API aktifse başlat
export const worker = setupWorker(...handlers);

export async function enableMocking() {
  // Production'da veya mock API kapalıysa çalıştırma
  if (import.meta.env.PROD || !API_CONFIG.USE_MOCK_API) {
    return;
  }

  // MSW worker'ı başlat
  return worker.start({
    onUnhandledRequest: (request) => {
      // Sadece API isteklerini handle et, diğerlerini geç
      if (request.url.includes('/api/')) {
        return;
      }
      // HTML, CSS, JS dosyalarını ve diğer static dosyaları geç
      return 'bypass';
    },
    serviceWorker: {
      url: '/mockServiceWorker.js',
    },
  });
}

