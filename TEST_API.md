# API Test Rehberi

## Hızlı Test

### 1. Backend Health Check
Browser'da açın: http://localhost:8081/actuator/health

### 2. Swagger UI
Browser'da açın: http://localhost:8081/swagger-ui.html

### 3. API Gateway Test
Browser'da açın: http://localhost:8080/api/v1/courses

## Manuel Test (Browser Console)

Browser Console'da (F12) şunu çalıştırın:

```javascript
// 1. Token'ı kontrol et
console.log('Token:', localStorage.getItem('accessToken'));

// 2. API çağrısı yap
fetch('http://localhost:8080/api/v1/courses?page=0&size=20', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
  }
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response:', data);
  console.log('Courses:', data?.data?.content || data?.data);
})
.catch(err => console.error('Error:', err));
```

## Sorun Giderme

### 404 Hatası
1. Backend çalışıyor mu? → http://localhost:8081/actuator/health
2. API Gateway çalışıyor mu? → http://localhost:8080/actuator/health
3. Route'lar doğru mu? → Swagger UI'dan kontrol et

### 401 Hatası
1. Token var mı? → localStorage.getItem('accessToken')
2. Token geçerli mi? → Login yapın

### Response Format
Backend'den gelen response formatı:
```json
{
  "success": true,
  "data": {
    "content": [...],
    "totalElements": 10,
    "totalPages": 1,
    "page": 0,
    "size": 20
  }
}
```

Frontend'de kullanım:
```typescript
const pageData = data?.data;
const courses = pageData?.content || [];
const totalPages = pageData?.totalPages || 0;
```

