# Recommendation Service

## Overview
يقوم هذا الـ Service بجمع البيانات الخاصة بالطفل من قاعدة البيانات وإرسالها إلى خدمة التوصيات الخارجية للحصول على توصيات مخصصة.

## Endpoint

### GET /recommendation
يقوم بجلب التوصيات للطفل بناءً على بياناته الحالية.

#### Authentication
يتطلب هذا الـ endpoint تسجيل دخول المستخدم (User Guard)

#### Request
لا يحتاج إلى body - يتم استخراج userId من الـ JWT token

#### Response Example
```json
{
  "statusCode": 200,
  "message": "Recommendation fetched successfully",
  "data": {
    // البيانات المُرجعة من خدمة التوصيات
  }
}
```

## Data Collection

يقوم الـ Service بجمع البيانات التالية:

### 1. معلومات الطفل (من جدول Children)
- `infant_id`: معرف الطفل
- `infant_name`: اسم الطفل
- `age_months`: العمر بالأشهر (محسوب من تاريخ الميلاد)
- `gender`: الجنس (Male/Female)
- `weight_kg`: الوزن بالكيلوجرام
- `height_cm`: الطول بالسنتيمتر

### 2. القراءات الحيوية (من جدول IoT Readings)
يتم جلب آخر قراءة متوفرة:
- `temperature_c`: درجة الحرارة (من IoT)
- `heart_rate_bpm`: معدل ضربات القلب (من IoT)
- `oxygen_level`: مستوى الأكسجين SpO2 (من IoT)

### 3. تحليل البكاء (من جدول Predictions في Child)
يتم جلب آخر تنبؤ:
- `cry_type`: نوع البكاء (Hunger, Pain, etc.)
- `confidence`: نسبة الثقة في التنبؤ

### 4. القيم الافتراضية
بعض القيم يتم استخدام قيم افتراضية لها حالياً (يمكن إضافة جداول لتتبعها لاحقاً):
- `premature`: false
- `allergies`: "None"
- `last_feed_hours`: 2.5
- `last_sleep_hours`: 1.5
- `last_diaper_hours`: 1
- `breathing_rate`: 40
- `movement_level`: 0.3
- `sleep_duration_hours`: 2

## Environment Variables

يجب إضافة المتغير التالي إلى ملف `.env`:

```
RECOMMENDATION_SERVICE_URL=http://63.179.148.169:8003
```

## Future Enhancements

### إضافة جدول Activity Tracking
لتتبع الأنشطة بشكل دقيق، يمكن إنشاء جدول جديد:

```typescript
@Schema({ timestamps: true })
export class ChildActivity {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: Child.name })
    child: string | Child;

    @Prop({ required: true, enum: ['feeding', 'sleeping', 'diaper'] })
    activityType: string;

    @Prop({ required: true })
    timestamp: Date;

    @Prop() // للرضاعة: الكمية
    amount?: number;

    @Prop() // للنوم: المدة
    duration?: number;

    @Prop() // ملاحظات إضافية
    notes?: string;
}
```

### إضافة حقول إضافية لجدول Child
```typescript
@Prop({ default: false })
premature?: boolean;

@Prop({ default: 'None' })
allergies?: string;
```

## Testing

### Test with Postman/Insomnia
```
GET http://localhost:3000/recommendation
Authorization: Bearer <user_jwt_token>
```

### Expected Flow
1. المستخدم يرسل طلب GET
2. السيرفر يستخرج userId من الـ token
3. يبحث عن معلومات الطفل في قاعدة البيانات
4. يجلب آخر قراءات IoT
5. يجلب آخر تنبؤ للبكاء
6. يجمع كل البيانات بالشكل المطلوب
7. يرسل الطلب إلى خدمة التوصيات
8. يُرجع النتيجة للمستخدم
