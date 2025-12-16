# 🔧 Admin Giriş Hatası Raporu

## Sorun Özeti

**Tarih:** 16 Aralık 2025  
**Belirti:** Admin kullanıcısı ile giriş yapılamıyor (401 Unauthorized)  
**Backend Log:** `Bad credentials: Bad credentials`

---

## Kök Neden Analizi

Backend loglarında **"Bad credentials"** hatası görülüyor. Bu hatanın olası nedenleri:

### 1. BCrypt Hash Uyumsuzluğu (En Olası)

Database seed dosyasındaki BCrypt hash'i `password123` şifresi için **yanlış hash** olabilir.

**Mevcut Hash (02_users.sql):**
```sql
$2a$10$EqKcp1WFKVQISheBxkV8qOEb.OMjSPvKnHJPLAl.pL5aNLwzVy5Aq
```

Bu hash'in `password123` için doğru olup olmadığını kontrol etmek gerekiyor.

### 2. BCrypt Cost Factor Uyumsuzluğu

- **Backend:** `BCryptPasswordEncoder(10)` kullanıyor
- **Hash:** `$2a$10$...` → Cost factor 10 ✅

Bu uyumlu görünüyor.

---

## Çözüm

### Adım 1: Doğru BCrypt Hash Oluştur

Backend projesinde geçici bir test kodu çalıştırarak doğru hash'i oluşturun:

**Yöntem A: Java Main Class**

`auth-service` içinde geçici bir main class oluşturun:

```java
package com.smartcampus.auth;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        String password = "password123";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        
        // Doğrulama
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + matches);
    }
}
```

Çalıştırın ve çıkan hash'i not edin.



### Adım 2: Database'i Güncelle

**Yöntem A: SQL ile Güncelle**

```sql
-- Tüm test kullanıcılarının şifresini güncelle
UPDATE users 
SET password_hash = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE email LIKE '%@smartcampus.edu.tr';
```

**Yöntem B: Seed Dosyasını Güncelle**

`smart-campus-database/seeds/02_users.sql` dosyasını güncelleyin:

```sql
-- =============================================
-- Seed: 02 - Users (Kullanıcılar)
-- Description: Test kullanıcıları (1 Admin, 2 Faculty, 5 Student)
-- Password: password123 (BCrypt hash - cost 10)
-- =============================================

-- Admin Kullanıcı
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, is_verified, is_active) VALUES
('admin@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Sistem', 'Admin', '05001234567', 'ADMIN', 1, 1);

-- Öğretim Üyeleri
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, is_verified, is_active) VALUES
('ahmet.yilmaz@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Ahmet', 'Yılmaz', '05321234567', 'FACULTY', 1, 1),
('ayse.demir@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Ayşe', 'Demir', '05331234567', 'FACULTY', 1, 1);

-- Öğrenciler
INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role, is_verified, is_active) VALUES
('ali.kaya@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Ali', 'Kaya', '05411234567', 'STUDENT', 1, 1),
('zeynep.celik@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Zeynep', 'Çelik', '05421234567', 'STUDENT', 1, 1),
('mehmet.ozturk@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Mehmet', 'Öztürk', '05431234567', 'STUDENT', 1, 1),
('fatma.sahin@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Fatma', 'Şahin', '05441234567', 'STUDENT', 1, 1),
('emre.arslan@smartcampus.edu.tr', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Emre', 'Arslan', '05451234567', 'STUDENT', 1, 1);
```

### Adım 3: Veritabanını Yeniden Seed Et

```bash
# MySQL'e bağlan
mysql -h 138.68.99.35 -u root -p smart_campus

# Users tablosunu temizle ve yeniden seed et
DELETE FROM faculty;
DELETE FROM students;
DELETE FROM users;

# Sonra yeni seed dosyasını çalıştır
SOURCE /path/to/seeds/02_users.sql;
SOURCE /path/to/seeds/03_students.sql;
SOURCE /path/to/seeds/04_faculty.sql;
```

---

## Alternatif Hızlı Çözüm

Sadece admin kullanıcısını güncellemek için:

```sql
UPDATE users 
SET password_hash = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG'
WHERE email = 'admin@smartcampus.edu.tr';
```

---

## Test

Güncelleme sonrası şu bilgilerle giriş yapın:

- **Email:** `admin@smartcampus.edu.tr`
- **Password:** `password123`

```bash
curl -X POST http://138.68.99.35:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartcampus.edu.tr",
    "password": "password123"
  }'
```

---

## Önemli Not

BCrypt her seferinde farklı hash üretir (random salt kullanır). Bu yüzden:
- `$2a$10$ABC...` ve `$2a$10$XYZ...` aynı şifre için farklı hash'ler olabilir
- Ama ikisi de `BCryptPasswordEncoder.matches()` ile doğrulanabilir

Seed dosyasındaki hash'in doğru şifre ile oluşturulduğundan emin olun!

---

## Hash Doğrulama Scripti

Backend'de hash'in doğru olup olmadığını test etmek için:

```java
@SpringBootTest
class PasswordTest {
    @Autowired
    PasswordEncoder passwordEncoder;
    
    @Test
    void testPassword() {
        String password = "password123";
        String hash = "$2a$10$EqKcp1WFKVQISheBxkV8qOEb.OMjSPvKnHJPLAl.pL5aNLwzVy5Aq";
        
        boolean matches = passwordEncoder.matches(password, hash);
        System.out.println("Password matches: " + matches);
        
        // Eğer false dönerse, hash yanlış demektir
        assertTrue(matches);
    }
}
```

