# ============================================
# Smart Campus Frontend - Dockerfile
# Multi-stage build for production
# ============================================

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm ci

# Kaynak kodları kopyala
COPY . .

# Build argumentleri (build time'da environment variables)
ARG VITE_API_URL
ARG VITE_USE_MOCK_API=false

# Environment variables olarak ayarla
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCK_API=$VITE_USE_MOCK_API

# Production build
RUN npm run build

# ============================================
# Stage 2: Production (Nginx)
# ============================================
FROM nginx:alpine AS production

# Nginx konfigürasyonunu kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build output'u nginx'e kopyala
COPY --from=builder /app/dist /usr/share/nginx/html

# Port 3000'i expose et
EXPOSE 3000

# Nginx'i foreground'da çalıştır
CMD ["nginx", "-g", "daemon off;"]

