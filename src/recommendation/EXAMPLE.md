# Recommendation Endpoint Usage Example

## Scenario: مستخدم يريد الحصول على توصيات لطفله

### Step 1: تسجيل الدخول
أولاً يجب أن يسجل المستخدم الدخول للحصول على JWT token

```bash
POST http://localhost:3000/auth/signin
Content-Type: application/json

{
  "email": "parent@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "parent@example.com",
      "name": "Ahmed's Parent"
    }
  }
}
```

---

### Step 2: التأكد من وجود بيانات الطفل
يمكن التحقق من وجود بيانات الطفل أو إضافتها:

```bash
GET http://localhost:3000/children/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (إذا كانت البيانات موجودة):**
```json
{
  "statusCode": 200,
  "message": "Child profile fetched successfully",
  "data": {
    "id": "child_456",
    "name": "Ahmed",
    "dateBirth": "2025-12-19T00:00:00.000Z",
    "gender": "male",
    "weight": 7.5,
    "height": 65,
    "avatar": "http://localhost:3000/uploads/children/avatars/ahmed.png"
  }
}
```

**إذا لم توجد بيانات، قم بإنشائها:**
```bash
POST http://localhost:3000/children/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Ahmed",
  "dateBirth": "2025-12-19",
  "gender": "male",
  "weight": 7.5,
  "height": 65
}
```

---

### Step 3: التأكد من وجود قراءات IoT
يمكن إضافة قراءة IoT جديدة إذا لم توجد:

```bash
POST http://localhost:3000/iot/reading
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "deviceId": "esp32_001",
  "heartRate": 130,
  "spo2": 98,
  "temperature": 37.5,
  "timestamp": "2026-06-19T10:30:00.000Z"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "IoT reading saved successfully",
  "data": {
    "id": "reading_789",
    "deviceId": "esp32_001",
    "child": "child_456",
    "heartRate": 130,
    "spo2": 98,
    "temperature": 37.5,
    "timestamp": "2026-06-19T10:30:00.000Z"
  }
}
```

---

### Step 4: إضافة تنبؤ بكاء (اختياري)
إذا كان لديك تسجيل صوتي لبكاء الطفل:

```bash
POST http://localhost:3000/ai-predictions/predict
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data

file: [audio file - crying.wav]
```

**Response:**
```json
{
  "statusCode": 200,
  "message": "Prediction completed successfully",
  "data": {
    "prediction": "Hunger",
    "confidence": 0.95,
    "probabilities": {
      "Hunger": 0.95,
      "Tired": 0.03,
      "Pain": 0.02
    }
  }
}
```

---

### Step 5: الحصول على التوصيات 🎯

الآن نأتي للخطوة الرئيسية - جلب التوصيات:

```bash
GET http://localhost:3000/recommendation
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**ما يحدث في الخلفية:**

1. **جلب معلومات الطفل:**
```javascript
{
  infant_id: "child_456",
  infant_name: "Ahmed",
  age_months: 6,
  gender: "Male",
  weight_kg: 7.5,
  height_cm: 65
}
```

2. **جلب آخر قراءة IoT:**
```javascript
{
  temperature_c: 37.5,
  heart_rate_bpm: 130,
  oxygen_level: 98
}
```

3. **جلب آخر تنبؤ للبكاء:**
```javascript
{
  cry_type: "Hunger",
  confidence: 0.95
}
```

4. **دمج البيانات وإرسالها:**
```json
{
  "infant_id": "child_456",
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

**Expected Response (من خدمة التوصيات):**
```json
{
  "statusCode": 200,
  "message": "Recommendation fetched successfully",
  "data": {
    "recommendations": [
      {
        "type": "feeding",
        "priority": "high",
        "message": "طفلك يحتاج للرضاعة الآن. آخر رضعة كانت منذ 2.5 ساعة.",
        "action": "قم بإرضاع الطفل الآن"
      },
      {
        "type": "health",
        "priority": "medium",
        "message": "درجة حرارة الطفل طبيعية (37.5°C)",
        "action": "استمر في مراقبة درجة الحرارة"
      },
      {
        "type": "sleep",
        "priority": "low",
        "message": "الطفل قد ينام قريباً بعد الرضاعة",
        "action": "جهّز بيئة هادئة للنوم"
      }
    ],
    "overallStatus": "good",
    "nextCheckInMinutes": 60
  }
}
```

---

## Complete Flow in Code (React Native Example)

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

class BabyRecommendationService {
  constructor(token) {
    this.token = token;
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async getRecommendations() {
    try {
      console.log('🔍 Fetching recommendations...');
      
      const response = await this.api.get('/recommendation');
      
      console.log('✅ Recommendations received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching recommendations:', error.response?.data || error.message);
      throw error;
    }
  }

  async addIoTReading(deviceId, heartRate, spo2, temperature) {
    try {
      console.log('📡 Adding IoT reading...');
      
      const response = await this.api.post('/iot/reading', {
        deviceId,
        heartRate,
        spo2,
        temperature,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ IoT reading saved:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error saving IoT reading:', error.response?.data || error.message);
      throw error;
    }
  }

  async predictCrying(audioFile) {
    try {
      console.log('🎤 Predicting cry type...');
      
      const formData = new FormData();
      formData.append('file', audioFile);
      
      const response = await this.api.post('/ai-predictions/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Prediction received:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Error predicting cry:', error.response?.data || error.message);
      throw error;
    }
  }
}

// استخدام الـ Service
async function main() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  const service = new BabyRecommendationService(token);

  try {
    // 1. إضافة قراءة IoT
    await service.addIoTReading('esp32_001', 130, 98, 37.5);
    
    // 2. الحصول على التوصيات
    const recommendations = await service.getRecommendations();
    
    // 3. عرض التوصيات
    console.log('📋 Recommendations:');
    recommendations.data.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority}] ${rec.message}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

---

## Mobile App Integration (Flutter Example)

```dart
import 'package:dio/dio.dart';

class BabyRecommendationService {
  final Dio _dio;
  final String _baseUrl = 'http://localhost:3000';

  BabyRecommendationService(String token) : _dio = Dio() {
    _dio.options.baseUrl = _baseUrl;
    _dio.options.headers['Authorization'] = 'Bearer $token';
    _dio.options.headers['Content-Type'] = 'application/json';
  }

  Future<Map<String, dynamic>> getRecommendations() async {
    try {
      print('🔍 Fetching recommendations...');
      
      final response = await _dio.get('/recommendation');
      
      print('✅ Recommendations received');
      
      return response.data;
    } catch (e) {
      print('❌ Error: $e');
      rethrow;
    }
  }

  Future<void> addIoTReading(String deviceId, double heartRate, double spo2, double temperature) async {
    try {
      print('📡 Adding IoT reading...');
      
      await _dio.post('/iot/reading', data: {
        'deviceId': deviceId,
        'heartRate': heartRate,
        'spo2': spo2,
        'temperature': temperature,
        'timestamp': DateTime.now().toIso8601String(),
      });
      
      print('✅ IoT reading saved');
    } catch (e) {
      print('❌ Error: $e');
      rethrow;
    }
  }
}

// استخدام في Widget
class RecommendationScreen extends StatefulWidget {
  @override
  _RecommendationScreenState createState() => _RecommendationScreenState();
}

class _RecommendationScreenState extends State<RecommendationScreen> {
  final BabyRecommendationService _service = BabyRecommendationService(userToken);
  Map<String, dynamic>? recommendations;
  bool isLoading = false;

  Future<void> _loadRecommendations() async {
    setState(() => isLoading = true);
    
    try {
      final data = await _service.getRecommendations();
      setState(() {
        recommendations = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load recommendations: $e')),
      );
    }
  }

  @override
  void initState() {
    super.initState();
    _loadRecommendations();
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(child: CircularProgressIndicator());
    }

    if (recommendations == null) {
      return Center(child: Text('No recommendations available'));
    }

    return ListView.builder(
      itemCount: recommendations!['data']['recommendations'].length,
      itemBuilder: (context, index) {
        final rec = recommendations!['data']['recommendations'][index];
        return Card(
          child: ListTile(
            title: Text(rec['message']),
            subtitle: Text('Priority: ${rec['priority']}'),
            trailing: Icon(Icons.arrow_forward_ios),
            onTap: () {
              // Navigate to detail screen
            },
          ),
        );
      },
    );
  }
}
```

---

## Summary

الـ endpoint يعمل بشكل كامل ويقوم بـ:

1. ✅ استخراج userId من JWT token
2. ✅ جلب بيانات الطفل من قاعدة البيانات
3. ✅ جلب آخر قراءة IoT
4. ✅ جلب آخر تنبؤ للبكاء
5. ✅ دمج كل البيانات بالشكل المطلوب
6. ✅ إرسال الطلب إلى خدمة التوصيات
7. ✅ إرجاع النتيجة للمستخدم

**القيم الافتراضية المستخدمة حالياً:**
- premature: false
- allergies: "None"
- last_feed_hours: 2.5
- last_sleep_hours: 1.5
- last_diaper_hours: 1
- breathing_rate: 40
- movement_level: 0.3
- sleep_duration_hours: 2

**يمكن تحسينها لاحقاً بإضافة Activity Tracking System** (راجع ملف IMPROVEMENTS.md)
