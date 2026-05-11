# Socket.IO - IoT Sensor Data Documentation

## نظرة عامة
هذا التوثيق يشرح كيفية الاتصال بـ Socket.IO لاستقبال بيانات السينسورات (IoT) في الوقت الفعلي.

---

## 🔌 الاتصال بالـ Socket

### URL الاتصال
```
http://localhost:3000
```

### طرق إرسال الـ Token

يمكنك إرسال JWT Token بثلاث طرق:

#### 1️⃣ عبر Query String (الأسهل)
```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN';
const socket = io(`http://localhost:3000?token=${token}`);
```

#### 2️⃣ عبر Auth Object
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

#### 3️⃣ عبر Headers
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

---

## 📡 Events المتاحة

### 1. `sensor-data` (استقبال)
يتم إرسال هذا الـ event تلقائياً عند:
- استلام بيانات جديدة من السينسور
- طلب آخر بيانات عبر `get-latest-sensor-data`

**البيانات المستلمة:**
```javascript
{
  deviceId: string,        // معرف الجهاز
  childId: string,         // معرف الطفل
  heartRate: number,       // معدل ضربات القلب (BPM)
  spo2: number,            // نسبة الأكسجين في الدم (%)
  temperature: number,     // درجة الحرارة (°C)
  timestamp: Date          // وقت القراءة
}
```

**مثال:**
```javascript
socket.on('sensor-data', (data) => {
  if (data) {
    console.log('📊 بيانات السينسور:', data);
    console.log(`💓 معدل القلب: ${data.heartRate} BPM`);
    console.log(`🫁 الأكسجين: ${data.spo2}%`);
    console.log(`🌡️ الحرارة: ${data.temperature}°C`);
  } else {
    console.log('⚠️ لا توجد بيانات متاحة');
  }
});
```

---

### 2. `get-latest-sensor-data` (إرسال)
استخدم هذا الـ event لطلب آخر قراءة للسينسورات (مثلاً عند فتح صفحة الهوم).

**الإرسال:**
```javascript
socket.emit('get-latest-sensor-data');
```

**الاستقبال:**
سيتم إرسال الرد عبر event `sensor-data` (شوف أعلاه ☝️)

---

### 3. `sensor-data-error` (استقبال)
يتم إرسال هذا الـ event في حالة حدوث خطأ.

**البيانات المستلمة:**
```javascript
{
  message: string  // رسالة الخطأ
}
```

**مثال:**
```javascript
socket.on('sensor-data-error', (error) => {
  console.error('❌ خطأ:', error.message);
});
```

**الأخطاء المحتملة:**
- `"User not authenticated"` - المستخدم غير مصادق عليه
- `"IoT service not available"` - خدمة IoT غير متاحة
- `"Failed to get sensor data"` - فشل في جلب البيانات

---

### 4. `ping` / `pong` (اختبار الاتصال)
لاختبار أن الاتصال يعمل بشكل صحيح.

**الإرسال:**
```javascript
socket.emit('ping');
```

**الاستقبال:**
```javascript
socket.on('pong', (data) => {
  console.log('✅ الاتصال يعمل:', data.message); // "pong"
});
```

---

## 🎯 مثال كامل (React)

```javascript
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function SensorDashboard() {
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // الحصول على الـ Token
    const token = localStorage.getItem('authToken');
    
    // الاتصال بالـ Socket
    const socket = io(`http://localhost:3000?token=${token}`);

    // عند نجاح الاتصال
    socket.on('connect', () => {
      console.log('✅ متصل بالـ Socket');
      setIsConnected(true);
      
      // طلب آخر بيانات عند الاتصال
      socket.emit('get-latest-sensor-data');
    });

    // استقبال بيانات السينسورات
    socket.on('sensor-data', (data) => {
      console.log('📊 بيانات جديدة:', data);
      setSensorData(data);
      setError(null);
    });

    // معالجة الأخطاء
    socket.on('sensor-data-error', (err) => {
      console.error('❌ خطأ:', err.message);
      setError(err.message);
    });

    // عند قطع الاتصال
    socket.on('disconnect', (reason) => {
      console.log('⚠️ تم قطع الاتصال:', reason);
      setIsConnected(false);
    });

    // عند فشل الاتصال
    socket.on('connect_error', (err) => {
      console.error('❌ فشل الاتصال:', err.message);
      setIsConnected(false);
      setError('فشل الاتصال بالسيرفر');
    });

    // تنظيف الاتصال
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="sensor-dashboard">
      <h2>لوحة السينسورات</h2>
      
      {/* حالة الاتصال */}
      <div className="connection-status">
        {isConnected ? '🟢 متصل' : '🔴 غير متصل'}
      </div>

      {/* رسالة خطأ */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* بيانات السينسورات */}
      {sensorData ? (
        <div className="sensor-data">
          <h3>آخر قراءة:</h3>
          <div className="data-item">
            <span>💓 معدل القلب:</span>
            <strong>{sensorData.heartRate} BPM</strong>
          </div>
          <div className="data-item">
            <span>🫁 نسبة الأكسجين:</span>
            <strong>{sensorData.spo2}%</strong>
          </div>
          <div className="data-item">
            <span>🌡️ درجة الحرارة:</span>
            <strong>{sensorData.temperature}°C</strong>
          </div>
          <div className="data-item">
            <span>🕐 الوقت:</span>
            <strong>{new Date(sensorData.timestamp).toLocaleString('ar-EG')}</strong>
          </div>
        </div>
      ) : (
        <div className="no-data">
          ⏳ في انتظار البيانات...
        </div>
      )}
    </div>
  );
}

export default SensorDashboard;
```

---

## 🎯 مثال كامل (Vue.js)

```vue
<template>
  <div class="sensor-dashboard">
    <h2>لوحة السينسورات</h2>
    
    <!-- حالة الاتصال -->
    <div class="connection-status">
      {{ isConnected ? '🟢 متصل' : '🔴 غير متصل' }}
    </div>

    <!-- رسالة خطأ -->
    <div v-if="error" class="error-message">
      ⚠️ {{ error }}
    </div>

    <!-- بيانات السينسورات -->
    <div v-if="sensorData" class="sensor-data">
      <h3>آخر قراءة:</h3>
      <div class="data-item">
        <span>💓 معدل القلب:</span>
        <strong>{{ sensorData.heartRate }} BPM</strong>
      </div>
      <div class="data-item">
        <span>🫁 نسبة الأكسجين:</span>
        <strong>{{ sensorData.spo2 }}%</strong>
      </div>
      <div class="data-item">
        <span>🌡️ درجة الحرارة:</span>
        <strong>{{ sensorData.temperature }}°C</strong>
      </div>
      <div class="data-item">
        <span>🕐 الوقت:</span>
        <strong>{{ formatDate(sensorData.timestamp) }}</strong>
      </div>
    </div>
    <div v-else class="no-data">
      ⏳ في انتظار البيانات...
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      sensorData: null,
      isConnected: false,
      error: null
    };
  },
  
  mounted() {
    const token = localStorage.getItem('authToken');
    
    this.socket = io(`http://localhost:3000?token=${token}`);

    this.socket.on('connect', () => {
      console.log('✅ متصل بالـ Socket');
      this.isConnected = true;
      this.socket.emit('get-latest-sensor-data');
    });

    this.socket.on('sensor-data', (data) => {
      console.log('📊 بيانات جديدة:', data);
      this.sensorData = data;
      this.error = null;
    });

    this.socket.on('sensor-data-error', (err) => {
      console.error('❌ خطأ:', err.message);
      this.error = err.message;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ تم قطع الاتصال:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ فشل الاتصال:', err.message);
      this.isConnected = false;
      this.error = 'فشل الاتصال بالسيرفر';
    });
  },
  
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString('ar-EG');
    }
  }
};
</script>
```

---

## 🔄 سيناريوهات الاستخدام

### 1️⃣ عند فتح صفحة الهوم
```javascript
socket.on('connect', () => {
  // طلب آخر بيانات
  socket.emit('get-latest-sensor-data');
});
```

### 2️⃣ استقبال بيانات جديدة تلقائياً
```javascript
// لا تحتاج لعمل أي شيء!
// البيانات تصل تلقائياً عبر 'sensor-data' event
socket.on('sensor-data', (data) => {
  updateUI(data);
});
```

### 3️⃣ تحديث البيانات يدوياً
```javascript
function refreshSensorData() {
  socket.emit('get-latest-sensor-data');
}

// مثال: زر تحديث
<button onClick={refreshSensorData}>🔄 تحديث</button>
```

---

## ⚠️ ملاحظات مهمة

1. **المصادقة (Authentication)**
   - يجب إرسال JWT Token صالح
   - Token يجب أن يكون موجود في جدول `user_tokens`
   - المستخدم يجب أن يكون: `active`, `verified`, `dataCompleted`

2. **البيانات التلقائية**
   - البيانات تُرسل تلقائياً عند استلام قراءة جديدة من السينسور
   - لا تحتاج polling أو طلبات متكررة

3. **إعادة الاتصال**
   - Socket.io يعيد الاتصال تلقائياً عند انقطاع الشبكة
   - عند إعادة الاتصال، اطلب البيانات مرة أخرى

4. **البيانات القديمة**
   - `get-latest-sensor-data` يرجع آخر قراءة فقط
   - إذا لم توجد قراءات، سيرجع `null`

---

## 🐛 استكشاف الأخطاء

### المشكلة: `Socket auth failed - Unauthorized`
**الحل:**
- تأكد من إرسال Token صحيح
- تأكد أن Token موجود في الـ database
- تأكد أن المستخدم مفعّل

### المشكلة: `User not authenticated`
**الحل:**
- تأكد من نجاح الاتصال أولاً
- تحقق من الـ Token في الـ localStorage

### المشكلة: `IoT service not available`
**الحل:**
- تأكد من تشغيل الـ Backend بشكل صحيح
- تحقق من الـ logs في الـ server

### المشكلة: لا تصل البيانات
**الحل:**
- تأكد من الاتصال بالـ Socket (`isConnected = true`)
- تأكد من وجود بيانات في الـ database
- تحقق من أن السينسور يرسل البيانات

---

## 📦 التثبيت

```bash
npm install socket.io-client
# أو
yarn add socket.io-client
```

---

## 🔗 روابط مفيدة

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Socket.IO React Integration](https://socket.io/how-to/use-with-react)
- [Socket.IO Vue Integration](https://socket.io/how-to/use-with-vue)

---

**تم إنشاء التوثيق بواسطة:** Backend Team  
**آخر تحديث:** 2024
