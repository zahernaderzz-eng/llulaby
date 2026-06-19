# Future Improvements for Recommendation Module

## 1. Activity Tracking System

### Create Activity Entity
إنشاء جدول جديد لتتبع أنشطة الطفل بشكل دقيق:

```typescript
// src/modules/activities/entities/child-activity.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Child } from 'src/modules/children/entities/child.entity';

@Schema({ timestamps: true })
export class ChildActivity {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: Child.name,
        required: true,
    })
    child: string | Child;

    @Prop({
        required: true,
        enum: ['feeding', 'sleeping', 'diaper'],
    })
    activityType: string;

    @Prop({ required: true })
    timestamp: Date;

    // للرضاعة
    @Prop()
    feedingAmount?: number; // ml

    @Prop()
    feedingType?: string; // 'breast' | 'formula' | 'solid'

    // للنوم
    @Prop()
    sleepStartTime?: Date;

    @Prop()
    sleepEndTime?: Date;

    @Prop()
    sleepDuration?: number; // hours

    // للحفاض
    @Prop()
    diaperType?: string; // 'wet' | 'dirty' | 'both'

    @Prop()
    notes?: string;
}

export type ChildActivityDocument = ChildActivity & Document;
export const ChildActivitySchema = SchemaFactory.createForClass(ChildActivity);

ChildActivitySchema.index({ child: 1, timestamp: -1 });
ChildActivitySchema.index({ activityType: 1, timestamp: -1 });
```

### Activity Endpoints

```typescript
// POST /activities/feeding
@Post('feeding')
async recordFeeding(@Req() request: any, @Body() dto: RecordFeedingDto) {
    const userId = request.user?.id;
    return this.activitiesService.recordFeeding(userId, dto);
}

// POST /activities/sleeping
@Post('sleeping')
async recordSleeping(@Req() request: any, @Body() dto: RecordSleepingDto) {
    const userId = request.user?.id;
    return this.activitiesService.recordSleeping(userId, dto);
}

// POST /activities/diaper
@Post('diaper')
async recordDiaper(@Req() request: any, @Body() dto: RecordDiaperDto) {
    const userId = request.user?.id;
    return this.activitiesService.recordDiaper(userId, dto);
}

// GET /activities/recent
@Get('recent')
async getRecentActivities(@Req() request: any, @Query('limit') limit = 10) {
    const userId = request.user?.id;
    return this.activitiesService.getRecentActivities(userId, limit);
}
```

---

## 2. Enhanced Child Profile

### Add Missing Fields to Child Entity

```typescript
// إضافة حقول جديدة لـ child.entity.ts
@Prop({ default: false })
premature?: boolean;

@Prop({ default: 'None' })
allergies?: string;

@Prop()
bloodType?: string;

@Prop({ type: [String], default: [] })
medicalConditions?: string[];

@Prop({ type: [String], default: [] })
medications?: string[];

@Prop()
parentPhoneNumber?: string;

@Prop()
pediatricianName?: string;

@Prop()
pediatricianPhone?: string;
```

---

## 3. IoT Enhancements

### Add Movement Sensor Data

```typescript
// تحديث iot-reading.entity.ts
@Prop()
movementLevel?: number; // 0-1 scale

@Prop()
breathingRate?: number; // breaths per minute

@Prop()
sleepQuality?: number; // 0-1 scale

@Prop()
environmentTemperature?: number;

@Prop()
environmentHumidity?: number;

@Prop()
noiseLevel?: number; // decibels
```

### IoT Reading History

```typescript
// GET /iot/history
@Get('history')
async getReadingHistory(
    @Req() request: any,
    @Query('hours') hours = 24,
    @Query('interval') interval = 'hour', // 'minute' | 'hour' | 'day'
) {
    const userId = request.user?.id;
    return this.iotService.getReadingHistory(userId, hours, interval);
}
```

---

## 4. Smart Recommendation Caching

### Cache Recent Recommendations

```typescript
// في recommendation.service.ts
async getRecommendation(userId: string): Promise<any> {
    // تحقق من الـ cache أولاً
    const cacheKey = `recommendation:${userId}`;
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
        this.logger.log(`Returning cached recommendation for user: ${userId}`);
        return cached;
    }
    
    // جلب البيانات وإرسال الطلب...
    const recommendation = await this.fetchRecommendation(userId);
    
    // حفظ في الـ cache لمدة 5 دقائق
    await this.cacheManager.set(cacheKey, recommendation, 300);
    
    return recommendation;
}
```

---

## 5. Recommendation History

### Store Recommendation History

```typescript
@Schema({ timestamps: true })
export class RecommendationHistory {
    @Prop({
        type: MongooseSchema.Types.ObjectId,
        ref: Child.name,
        required: true,
    })
    child: string | Child;

    @Prop({ type: Object, required: true })
    requestData: any; // البيانات المُرسلة

    @Prop({ type: Object, required: true })
    response: any; // التوصيات المُستلمة

    @Prop({ default: Date.now })
    requestedAt: Date;

    @Prop()
    wasHelpful?: boolean; // feedback from user
}
```

### Endpoints

```typescript
// GET /recommendation/history
@Get('history')
async getRecommendationHistory(
    @Req() request: any,
    @Query('limit') limit = 10,
) {
    const userId = request.user?.id;
    return this.recommendationService.getHistory(userId, limit);
}

// POST /recommendation/:id/feedback
@Post(':id/feedback')
async submitFeedback(
    @Param('id') id: string,
    @Body() dto: { helpful: boolean; notes?: string },
) {
    return this.recommendationService.submitFeedback(id, dto);
}
```

---

## 6. Real-time Updates with WebSocket

### Emit Real-time Recommendations

```typescript
// في recommendation.service.ts
async getRecommendation(userId: string): Promise<any> {
    const recommendation = await this.fetchRecommendation(userId);
    
    // إرسال التوصية عبر WebSocket
    this.socketGateway.emitRecommendationToUser(userId, recommendation);
    
    return recommendation;
}
```

### Client-side Listener

```javascript
// في التطبيق (React Native / Flutter)
socket.on('new-recommendation', (data) => {
    console.log('New recommendation received:', data);
    // تحديث الـ UI
});
```

---

## 7. Batch Recommendations

### Schedule Automatic Recommendations

```typescript
// cron job في recommendation.service.ts
@Cron('0 */6 * * *') // كل 6 ساعات
async generateScheduledRecommendations() {
    this.logger.log('Generating scheduled recommendations');
    
    // جلب جميع المستخدمين النشطين
    const activeUsers = await this.getActiveUsers();
    
    for (const user of activeUsers) {
        try {
            const recommendation = await this.getRecommendation(user.id);
            
            // إرسال إشعار push notification
            await this.sendPushNotification(user.id, recommendation);
        } catch (error) {
            this.logger.error(`Failed to generate recommendation for user ${user.id}`);
        }
    }
}
```

---

## 8. Analytics Dashboard

### Recommendation Analytics

```typescript
// GET /recommendation/analytics
@Get('analytics')
async getAnalytics(@Req() request: any) {
    const userId = request.user?.id;
    
    return {
        totalRecommendations: await this.getTotalRecommendations(userId),
        avgConfidence: await this.getAvgConfidence(userId),
        mostCommonCryType: await this.getMostCommonCryType(userId),
        feedingPatterns: await this.getFeedingPatterns(userId),
        sleepPatterns: await this.getSleepPatterns(userId),
        healthTrends: await this.getHealthTrends(userId),
    };
}
```

---

## 9. Multi-Language Support

### Localized Recommendations

```typescript
// إضافة دعم اللغات المتعددة
async getRecommendation(userId: string, lang = 'en'): Promise<any> {
    const recommendation = await this.fetchRecommendation(userId);
    
    // ترجمة التوصيات حسب اللغة
    if (lang === 'ar') {
        recommendation.message = await this.translateToArabic(
            recommendation.message,
        );
    }
    
    return recommendation;
}
```

---

## 10. Integration with Healthcare Systems

### Export Medical Reports

```typescript
// GET /recommendation/medical-report
@Get('medical-report')
async generateMedicalReport(
    @Req() request: any,
    @Query('from') fromDate: string,
    @Query('to') toDate: string,
) {
    const userId = request.user?.id;
    
    return this.recommendationService.generateMedicalReport(
        userId,
        new Date(fromDate),
        new Date(toDate),
    );
}
```

### Generate PDF Reports

```typescript
// GET /recommendation/report/pdf
@Get('report/pdf')
async generatePdfReport(@Req() request: any, @Res() response: Response) {
    const userId = request.user?.id;
    const pdf = await this.recommendationService.generatePdfReport(userId);
    
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
        'Content-Disposition',
        'attachment; filename=baby-report.pdf',
    );
    response.send(pdf);
}
```

---

## Implementation Priority

### High Priority (أسبوع 1-2)
1. ✅ Activity Tracking System
2. ✅ Enhanced Child Profile fields
3. ✅ Recommendation History

### Medium Priority (أسبوع 3-4)
4. Smart Recommendation Caching
5. Real-time Updates with WebSocket
6. IoT Enhancements

### Low Priority (أسبوع 5+)
7. Batch Recommendations
8. Analytics Dashboard
9. Multi-Language Support
10. Healthcare System Integration
