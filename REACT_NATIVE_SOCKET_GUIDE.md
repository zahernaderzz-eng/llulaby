# دليل Socket.IO للموبايل - React Native + Expo

## 📱 نظرة عامة
هذا الدليل يشرح كيفية استخدام Socket.IO في تطبيق React Native مع Expo لاستقبال بيانات السينسورات في الوقت الفعلي.

---

## 📦 التثبيت

```bash
# تثبيت socket.io-client
npx expo install socket.io-client

# أو باستخدام npm
npm install socket.io-client

# أو باستخدام yarn
yarn add socket.io-client
```

---

## 🔌 معلومات الاتصال

### URL السيرفر
```
http://YOUR_SERVER_IP:3000
```

**ملاحظة مهمة:** 
- لو بتجرب على Emulator: استخدم `http://10.0.2.2:3000` (Android) أو `http://localhost:3000` (iOS)
- لو بتجرب على جهاز حقيقي: استخدم IP الجهاز اللي عليه السيرفر (مثلاً: `http://192.168.1.100:3000`)

### طريقة إرسال Token
```javascript
const socket = io(`http://YOUR_SERVER_IP:3000?token=${yourToken}`);
```

---

## 🎯 البيانات المستلمة

### Event: `sensor-data`
```typescript
{
  deviceId: string,        // معرف الجهاز (مثال: "esp32_1")
  childId: string,         // معرف الطفل
  heartRate: number,       // معدل ضربات القلب (BPM)
  spo2: number,            // نسبة الأكسجين في الدم (%)
  temperature: number,     // درجة الحرارة (°C)
  timestamp: string        // وقت القراءة (ISO format)
}
```

### Event: `sensor-data-error`
```typescript
{
  message: string  // رسالة الخطأ
}
```

---

## 💻 الكود الكامل

### 1️⃣ إنشاء Socket Service

أنشئ ملف `services/socketService.js`:

```javascript
import { io } from 'socket.io-client';

class SocketService {
  socket = null;
  
  connect(token, serverUrl = 'http://YOUR_SERVER_IP:3000') {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return this.socket;
    }

    console.log('🔌 Connecting to socket...');
    this.socket = io(`${serverUrl}?token=${token}`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected');
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

### 2️⃣ استخدام Socket في Component

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import socketService from './services/socketService';

export default function SensorScreen() {
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // احصل على Token من AsyncStorage أو Context
    const token = 'YOUR_JWT_TOKEN_HERE';
    const serverUrl = 'http://192.168.1.100:3000'; // غير الـ IP حسب السيرفر بتاعك

    // الاتصال بالـ Socket
    const socket = socketService.connect(token, serverUrl);

    // معالجة الاتصال
    socket.on('connect', () => {
      console.log('✅ متصل بالـ Socket');
      setIsConnected(true);
      setLoading(false);
      
      // طلب آخر بيانات عند الاتصال
      socketService.getLatestSensorData();
    });

    // استقبال بيانات السينسورات
    socket.on('sensor-data', (data) => {
      console.log('📊 بيانات جديدة:', data);
      if (data) {
        setSensorData(data);
        setError(null);
      } else {
        setError('لا توجد بيانات متاحة');
      }
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
      setLoading(false);
    });

    // تنظيف الاتصال عند إلغاء المكون
    return () => {
      socketService.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>جاري الاتصال...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* حالة الاتصال */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, isConnected ? styles.connected : styles.disconnected]} />
        <Text style={styles.statusText}>
          {isConnected ? 'متصل' : 'غير متصل'}
        </Text>
      </View>

      {/* رسالة خطأ */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* بيانات السينسورات */}
      {sensorData ? (
        <View style={styles.dataContainer}>
          <Text style={styles.title}>آخر قراءة</Text>
          
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>💓 معدل القلب</Text>
              <Text style={styles.dataValue}>{sensorData.heartRate} BPM</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🫁 نسبة الأكسجين</Text>
              <Text style={styles.dataValue}>{sensorData.spo2}%</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🌡️ درجة الحرارة</Text>
              <Text style={styles.dataValue}>{sensorData.temperature}°C</Text>
            </View>

            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>🕐 الوقت</Text>
              <Text style={styles.dataTime}>
                {new Date(sensorData.timestamp).toLocaleString('ar-EG')}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>⏳ في انتظار البيانات...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connected: {
    backgroundColor: '#4CAF50',
  },
  disconnected: {
    backgroundColor: '#F44336',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  dataContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  dataCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dataLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  dataTime: {
    fontSize: 14,
    color: '#999',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: '#999',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
```

---

### 3️⃣ استخدام مع Context (أفضل طريقة)

أنشئ ملف `contexts/SocketContext.js`:

```javascript
import React, { createContext, useContext, useEffect, useState } from 'react';
import socketService from '../services/socketService';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, token, serverUrl }) => {
  const [sensorData, setSensorData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token, serverUrl);

    socket.on('connect', () => {
      setIsConnected(true);
      socketService.getLatestSensorData();
    });

    socket.on('sensor-data', (data) => {
      if (data) {
        setSensorData(data);
        setError(null);
      }
    });

    socket.on('sensor-data-error', (err) => {
      setError(err.message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      setIsConnected(false);
      setError('فشل الاتصال بالسيرفر');
    });

    return () => {
      socketService.disconnect();
    };
  }, [token, serverUrl]);

  const refreshData = () => {
    socketService.getLatestSensorData();
  };

  return (
    <SocketContext.Provider
      value={{
        sensorData,
        isConnected,
        error,
        refreshData,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
```

**استخدام Context في App:**

```javascript
import { SocketProvider } from './contexts/SocketContext';

export default function App() {
  const token = 'YOUR_JWT_TOKEN';
  const serverUrl = 'http://192.168.1.100:3000';

  return (
    <SocketProvider token={token} serverUrl={serverUrl}>
      <SensorScreen />
    </SocketProvider>
  );
}
```

**استخدام في Component:**

```javascript
import { useSocket } from './contexts/SocketContext';

function SensorScreen() {
  const { sensorData, isConnected, error, refreshData } = useSocket();

  return (
    <View>
      <Text>Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
      {sensorData && (
        <Text>Heart Rate: {sensorData.heartRate}</Text>
      )}
      <Button title="Refresh" onPress={refreshData} />
    </View>
  );
}
```

---

## 🔧 إعدادات مهمة

### 1. معرفة IP السيرفر

**على Windows:**
```bash
ipconfig
# ابحث عن IPv4 Address
```

**على Mac/Linux:**
```bash
ifconfig
# أو
ip addr show
```

### 2. التأكد من الـ Firewall

تأكد إن الـ Port 3000 مفتوح على السيرفر:
```bash
# Windows
netsh advfirewall firewall add rule name="Node Server" dir=in action=allow protocol=TCP localport=3000

# Linux
sudo ufw allow 3000
```

### 3. اختبار الاتصال

```bash
# من الموبايل، جرب تفتح في المتصفح:
http://YOUR_SERVER_IP:3000
```

---

## 🐛 حل المشاكل الشائعة

### المشكلة: `Network request failed`
**الحل:**
- تأكد إن الموبايل والسيرفر على نفس الشبكة
- تأكد من IP السيرفر صحيح
- تأكد من الـ Firewall مش بيمنع الاتصال

### المشكلة: `Socket auth failed`
**الحل:**
- تأكد من Token صحيح وصالح
- تأكد من Token موجود في الـ database

### المشكلة: `Connection timeout`
**الحل:**
- زود الـ timeout في إعدادات Socket:
```javascript
const socket = io(url, {
  timeout: 10000, // 10 seconds
});
```

### المشكلة: البيانات مش بتوصل
**الحل:**
- تأكد من الاتصال نجح (`isConnected = true`)
- شوف الـ logs في Metro bundler
- تأكد من وجود بيانات في الـ database

---

## 📊 مثال كامل مع TypeScript

```typescript
import { io, Socket } from 'socket.io-client';

interface SensorData {
  deviceId: string;
  childId: string;
  heartRate: number;
  spo2: number;
  temperature: number;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  
  connect(token: string, serverUrl: string): Socket {
    this.socket = io(`${serverUrl}?token=${token}`, {
      transports: ['websocket'],
      reconnection: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected');
    });

    return this.socket;
  }

  onSensorData(callback: (data: SensorData | null) => void): void {
    this.socket?.on('sensor-data', callback);
  }

  getLatestSensorData(): void {
    this.socket?.emit('get-latest-sensor-data');
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}

export default new SocketService();
```

---

## 🎨 نصائح للـ UI/UX

1. **أضف مؤشر تحميل** عند الاتصال الأولي
2. **أضف رسالة واضحة** عند قطع الاتصال
3. **استخدم ألوان مختلفة** للقيم الطبيعية والخطرة
4. **أضف صوت تنبيه** عند القيم الخطرة
5. **احفظ آخر قراءة** في AsyncStorage للعرض عند عدم الاتصال

---

## 📱 متطلبات الـ Permissions

لا يوجد permissions خاصة مطلوبة لـ Socket.IO، لكن تأكد من:

```json
// app.json
{
  "expo": {
    "android": {
      "usesCleartextTraffic": true  // للسماح بـ HTTP في Android
    }
  }
}
```

---

## 🚀 نشر التطبيق

عند نشر التطبيق، غير الـ URL من localhost إلى:
- Domain name (مثال: `https://api.yourapp.com`)
- أو IP ثابت للسيرفر

```javascript
const SERVER_URL = __DEV__ 
  ? 'http://192.168.1.100:3000'  // Development
  : 'https://api.yourapp.com';    // Production
```

---

**تم إنشاء الدليل بواسطة:** Backend Team  
**آخر تحديث:** 2024  
**الإصدار:** 1.0
