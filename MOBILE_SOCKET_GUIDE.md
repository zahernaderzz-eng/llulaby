# دليل Socket.IO للموبايل - React Native + Expo

## 📦 التثبيت

```bash
npx expo install socket.io-client
```

---

## 🔌 الاتصال

### معلومات السيرفر
- **URL:** `http://YOUR_SERVER_IP:3000`
- **Token:** يتم إرساله في query string

### ملاحظات مهمة
- **Emulator Android:** استخدم `http://10.0.2.2:3000`
- **Emulator iOS:** استخدم `http://localhost:3000`
- **جهاز حقيقي:** استخدم IP السيرفر (مثال: `http://192.168.1.100:3000`)

---

## 💻 الكود

### 1. Socket Service

أنشئ ملف `services/socketService.js`:

```javascript
import { io } from 'socket.io-client';

class SocketService {
  socket = null;
  
  connect(token, serverUrl) {
    this.socket = io(`${serverUrl}?token=${token}`, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getLatestSensorData() {
    this.emit('get-latest-sensor-data');
  }
}

export default new SocketService();
```

---

### 2. استخدام في Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import socketService from './services/socketService';

export default function SensorScreen() {
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = 'YOUR_JWT_TOKEN';
    const serverUrl = 'http://192.168.1.100:3000'; // غير الـ IP

    const socket = socketService.connect(token, serverUrl);

    // عند الاتصال
    socket.on('connect', () => {
      setIsConnected(true);
      socketService.getLatestSensorData(); // طلب آخر بيانات
    });

    // استقبال البيانات
    socket.on('sensor-data', (data) => {
      console.log('📊 Data:', data);
      setSensorData(data);
    });

    // معالجة الأخطاء
    socket.on('sensor-data-error', (err) => {
      console.error('❌ Error:', err.message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // تنظيف
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <View>
      <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      
      {sensorData && (
        <View>
          <Text>Heart Rate: {sensorData.heartRate} BPM</Text>
          <Text>SpO2: {sensorData.spo2}%</Text>
          <Text>Temperature: {sensorData.temperature}°C</Text>
          <Text>Time: {new Date(sensorData.timestamp).toLocaleString()}</Text>
        </View>
      )}
    </View>
  );
}
```

---

## 📡 Events المتاحة

### 1. `sensor-data` (استقبال)
يتم إرساله تلقائياً عند استلام بيانات جديدة أو عند طلبها.

**البيانات:**
```javascript
{
  deviceId: "esp32_1",
  childId: "69b981b3c84efb801a4b84f6",
  heartRate: 85,
  spo2: 98,
  temperature: 37.2,
  timestamp: "2024-05-11T19:53:55.171Z"
}
```

### 2. `get-latest-sensor-data` (إرسال)
لطلب آخر قراءة من السيرفر.

```javascript
socket.emit('get-latest-sensor-data');
```

### 3. `sensor-data-error` (استقبال)
في حالة حدوث خطأ.

```javascript
socket.on('sensor-data-error', (error) => {
  console.error(error.message);
});
```

---

## 🔧 معرفة IP السيرفر

### Windows
```bash
ipconfig
# ابحث عن IPv4 Address
```

### Mac/Linux
```bash
ifconfig
# أو
ip addr show
```

---

## 🐛 حل المشاكل

### `Network request failed`
- تأكد إن الموبايل والسيرفر على نفس الشبكة
- تأكد من IP صحيح
- تأكد من Port 3000 مفتوح

### `Socket auth failed`
- تأكد من Token صحيح
- تأكد من Token موجود في database

### البيانات مش بتوصل
- تأكد من الاتصال نجح (`isConnected = true`)
- شوف logs في Metro bundler
- تأكد من وجود بيانات في database

---

## ⚙️ إعدادات Android

في `app.json`:

```json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true
    }
  }
}
```

---

## 🚀 Production

غير الـ URL حسب البيئة:

```javascript
const SERVER_URL = __DEV__ 
  ? 'http://192.168.1.100:3000'      // Development
  : 'https://api.yourapp.com';        // Production
```

---

## 📝 ملخص سريع

1. **ثبت:** `npx expo install socket.io-client`
2. **اتصل:** `io('http://IP:3000?token=YOUR_TOKEN')`
3. **استقبل:** `socket.on('sensor-data', callback)`
4. **اطلب:** `socket.emit('get-latest-sensor-data')`
5. **نظف:** `socket.disconnect()`

---

**تم بواسطة:** Backend Team
