# Testing Guide for Recommendation Endpoint

## Prerequisites
1. تأكد من تشغيل السيرفر على البورت 3000
2. احصل على JWT token للمستخدم (من endpoint تسجيل الدخول)
3. تأكد من وجود:
   - بيانات طفل للمستخدم في جدول `children`
   - قراءة IoT واحدة على الأقل في جدول `iot_readings`

## Test Cases

### 1. Happy Path - مستخدم لديه بيانات كاملة

#### Request
```bash
curl -X GET http://localhost:3000/recommendation \
  -H "Authorization: Bearer <USER_JWT_TOKEN>" \
  -H "Content-Type: application/json"
```

#### Expected Behavior
- ✅ يتم جلب بيانات الطفل
- ✅ يتم جلب آخر قراءة IoT
- ✅ يتم جلب آخر تنبؤ للبكاء (إن وجد)
- ✅ يتم إرسال البيانات إلى خدمة التوصيات
- ✅ يتم إرجاع التوصيات

#### Sample Request Data Sent to Recommendation Service
```json
{
  "infant_id": "69b981b3c84efb801a4b84f6",
  "infant_name": "Ahmed",
  "age_months": 6,
  "gender": "Male",
  "weight_kg": 7.5,
  "height_cm": 65,
  "premature": false,
  "allergies": "None",
  "last_feed_hours": 2.5,
  "last_sleep_hours": 1.5,
  "last_diaper_hours": 1,
  "vital_signs": {
    "temperature_c": 37.5,
    "heart_rate_bpm": 130,
    "breathing_rate": 40,
    "oxygen_level": 98,
    "movement_level": 0.3,
    "sleep_duration_hours": 2
  },
  "cry_analysis": {
    "cry_type": "Hunger",
    "cry_intensity": 0.6,
    "confidence": 0.95
  }
}
```

---

### 2. Error Case - مستخدم ليس لديه بيانات طفل

#### Request
```bash
curl -X GET http://localhost:3000/recommendation \
  -H "Authorization: Bearer <USER_JWT_TOKEN_WITHOUT_CHILD>" \
  -H "Content-Type: application/json"
```

#### Expected Response
```json
{
  "statusCode": 404,
  "message": "Child profile not found",
  "error": "Not Found"
}
```

---

### 3. Error Case - بدون Authentication

#### Request
```bash
curl -X GET http://localhost:3000/recommendation \
  -H "Content-Type: application/json"
```

#### Expected Response
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### 4. Postman Collection

#### Setup
1. افتح Postman
2. أنشئ Collection جديد اسمه "Lullaby Recommendation"
3. أضف المتغيرات:
   - `base_url`: http://localhost:3000
   - `user_token`: <YOUR_JWT_TOKEN>

#### Request Configuration
- **Method**: GET
- **URL**: `{{base_url}}/recommendation`
- **Headers**:
  ```
  Authorization: Bearer {{user_token}}
  Content-Type: application/json
  ```

---

## Debugging

### Check Logs
راقب logs السيرفر للتحقق من:
```
[RecommendationService] Gathering data for recommendation request for user: <userId>
[RecommendationService] Sending recommendation request: {...}
[RecommendationService] Recommendation received successfully for user: <userId>
```

### Check Database
تأكد من وجود البيانات:

```javascript
// MongoDB Shell
// تحقق من وجود طفل للمستخدم
db.children.findOne({ identity: ObjectId("<userId>") })

// تحقق من وجود قراءات IoT
db.iotreadings.find({ child: ObjectId("<childId>") }).sort({ timestamp: -1 }).limit(1)

// تحقق من وجود تنبؤات
db.children.findOne(
  { identity: ObjectId("<userId>") },
  { predictions: 1 }
)
```

### Common Issues

#### 1. خدمة التوصيات لا ترد
```
Error: connect ECONNREFUSED 63.179.148.169:8003
```
**Solution**: تأكد من أن خدمة التوصيات تعمل على البورت 8003

#### 2. Timeout
```
Error: timeout of 30000ms exceeded
```
**Solution**: 
- تحقق من سرعة الشبكة
- زيادة timeout في `recommendation.service.ts`

#### 3. بيانات ناقصة
إذا كانت بعض الحقول null أو undefined:
- تحقق من وجود `weight` و `height` في بيانات الطفل
- تحقق من وجود قراءة IoT حديثة
- الحقول الافتراضية ستُستخدم تلقائياً

---

## Next Steps

### إضافة Activity Tracking
لجعل البيانات أكثر دقة، يمكن إضافة:

1. Endpoint لتسجيل آخر رضعة:
```typescript
POST /children/activities/feeding
{
  "timestamp": "2026-06-19T10:30:00Z",
  "amount": 150,
  "notes": "Formula milk"
}
```

2. Endpoint لتسجيل النوم:
```typescript
POST /children/activities/sleeping
{
  "startTime": "2026-06-19T09:00:00Z",
  "endTime": "2026-06-19T11:00:00Z",
  "duration": 2
}
```

3. Endpoint لتسجيل تغيير الحفاض:
```typescript
POST /children/activities/diaper
{
  "timestamp": "2026-06-19T10:00:00Z",
  "type": "wet" // or "dirty"
}
```

بعد إضافة هذه الـ endpoints، يمكن تحديث `recommendation.service.ts` لجلب البيانات الفعلية بدلاً من القيم الافتراضية.
