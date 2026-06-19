# Quick Start Guide - Recommendation Endpoint

## TL;DR
تم إنشاء endpoint يجمع بيانات الطفل من قاعدة البيانات ويرسلها لخدمة التوصيات.

## 🚀 Quick Usage

### 1. Endpoint
```
GET /recommendation
```

### 2. Authentication Required
يجب تسجيل الدخول أولاً والحصول على JWT token

### 3. curl Example
```bash
curl -X GET http://localhost:3000/recommendation \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📋 What It Does

1. يستخرج `userId` من JWT token
2. يبحث عن بيانات الطفل في جدول `children`
3. يجلب آخر قراءة من جدول `iot_readings`
4. يجلب آخر تنبؤ للبكاء من `predictions`
5. يحسب عمر الطفل بالأشهر
6. يجمع كل البيانات بالشكل المطلوب
7. يرسل الطلب إلى `http://63.179.148.169:8003/recommend`
8. يُرجع النتيجة

---

## 🔍 Data Sources

| Field | Source | Fallback |
|-------|--------|----------|
| `infant_id` | `child._id` | - |
| `infant_name` | `child.name` | - |
| `age_months` | محسوب من `child.dateBirth` | - |
| `gender` | `child.gender` | - |
| `weight_kg` | `child.weight` | `0` |
| `height_cm` | `child.height` | `0` |
| `temperature_c` | `iotReading.temperature` | `37.0` |
| `heart_rate_bpm` | `iotReading.heartRate` | `120` |
| `oxygen_level` | `iotReading.spo2` | `98` |
| `cry_type` | `child.predictions[last].prediction` | `"Unknown"` |
| `confidence` | `child.predictions[last].confidence` | `0` |
| `premature` | افتراضي | `false` |
| `allergies` | افتراضي | `"None"` |
| `last_feed_hours` | افتراضي | `2.5` |
| `last_sleep_hours` | افتراضي | `1.5` |
| `last_diaper_hours` | افتراضي | `1` |
| `breathing_rate` | افتراضي | `40` |
| `movement_level` | افتراضي | `0.3` |
| `sleep_duration_hours` | افتراضي | `2` |

---

## ⚙️ Configuration

### Environment Variable (Already Added)
```env
RECOMMENDATION_SERVICE_URL=http://63.179.148.169:8003
```

### Module Dependencies (Already Configured)
- ✅ `ChildrenModule` - imported
- ✅ `IoTModule` - imported
- ✅ `RecommendationModule` - registered in AppModule

---

## ✅ Prerequisites

Before calling `/recommendation`, ensure:

1. **المستخدم لديه طفل مسجل:**
   ```bash
   POST /children/profile
   {
     "name": "Ahmed",
     "dateBirth": "2025-12-19",
     "gender": "male",
     "weight": 7.5,
     "height": 65
   }
   ```

2. **يوجد على الأقل قراءة IoT واحدة (اختياري):**
   ```bash
   POST /iot/reading
   {
     "deviceId": "esp32_001",
     "heartRate": 130,
     "spo2": 98,
     "temperature": 37.5
   }
   ```

3. **يوجد تنبؤ للبكاء (اختياري):**
   ```bash
   POST /ai-predictions/predict
   (upload audio file)
   ```

---

## 📊 Response Format

```json
{
  "statusCode": 200,
  "message": "Recommendation fetched successfully",
  "data": {
    // Data from recommendation service
  }
}
```

---

## ❌ Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```
**Fix:** Add valid JWT token in Authorization header

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Child profile not found"
}
```
**Fix:** Create child profile first using `POST /children/profile`

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Error message here"
}
```
**Check:** 
- Server logs for detailed error
- Recommendation service is running on port 8003
- Network connectivity

---

## 🧪 Testing

### Using curl
```bash
# 1. Login first
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Copy the token from response

# 2. Get recommendation
curl -X GET http://localhost:3000/recommendation \
  -H "Authorization: Bearer <TOKEN_HERE>"
```

### Using Postman
1. Create new request
2. Method: `GET`
3. URL: `http://localhost:3000/recommendation`
4. Headers:
   - `Authorization`: `Bearer <YOUR_TOKEN>`
5. Send

---

## 📚 Documentation Files

- **README.md** - نظرة عامة شاملة
- **TESTING.md** - دليل الاختبار التفصيلي
- **EXAMPLE.md** - أمثلة كود كاملة (React Native & Flutter)
- **IMPROVEMENTS.md** - خطة التحسينات المستقبلية
- **SUMMARY.md** - ملخص شامل للمشروع
- **QUICKSTART.md** - هذا الملف (البداية السريعة)

---

## 🔧 Troubleshooting

### Issue: "Child profile not found"
```bash
# Check if child exists
GET /children/profile
# If not, create one
POST /children/profile
```

### Issue: External API timeout
```bash
# Check if recommendation service is running
curl http://63.179.148.169:8003/health
```

### Issue: Token expired
```bash
# Login again to get new token
POST /auth/signin
```

---

## 🎯 Success!

إذا رأيت response مثل هذا، فكل شيء يعمل بنجاح:

```json
{
  "statusCode": 200,
  "message": "Recommendation fetched successfully",
  "data": {
    // recommendations here
  }
}
```

🎉 **تهانينا! الـ endpoint يعمل بنجاح!**

---

## 📞 Support

إذا واجهت أي مشاكل:
1. تحقق من logs السيرفر
2. راجع TESTING.md للمزيد من التفاصيل
3. راجع EXAMPLE.md لأمثلة كاملة
4. راجع IMPROVEMENTS.md للميزات المستقبلية
