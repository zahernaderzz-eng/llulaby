import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ChildrenService } from '../modules/children/children.service';
import { IoTService } from '../modules/iot/iot.service';

@Injectable()
export class RecommendationService {
    private readonly logger = new Logger(RecommendationService.name);
    private readonly client: AxiosInstance;

    constructor(
        private configService: ConfigService,
        private childrenService: ChildrenService,
        private iotService: IoTService,
    ) {
        const recommendationServiceUrl =
            this.configService.get<string>('RECOMMENDATION_SERVICE_URL') ||
            'http://63.179.148.169:8002';

        this.client = axios.create({
            baseURL: recommendationServiceUrl,
            timeout: 30000,
        });
    }

    async getRecommendation(userId: string): Promise<any> {
        try {
            this.logger.log(
                `Gathering data for recommendation request for user: ${userId}`,
            );

            // جلب معلومات الطفل
            const child = await this.childrenService.findOne(userId);
            if (!child) {
                throw new NotFoundException('Child profile not found');
            }

            // جلب آخر قراءة IoT
            const latestIoTReading =
                await this.iotService.getLatestReadingByUser(userId);

            // حساب عمر الطفل بالأشهر
            const birthDate = new Date(child.dateBirth);
            const today = new Date();
            const ageMonths =
                (today.getFullYear() - birthDate.getFullYear()) * 12 +
                (today.getMonth() - birthDate.getMonth());

            // الحصول على آخر تنبؤ للبكاء إن وجد
            const latestPrediction =
                child.predictions && child.predictions.length > 0
                    ? child.predictions[child.predictions.length - 1]
                    : null;

            // تجهيز البيانات بالشكل المطلوب
            const requestData = {
                infant_id: (child as any)._id.toString(),
                infant_name: child.name,
                age_months: ageMonths,
                gender: child.gender === 'male' ? 'Male' : 'Female',
                weight_kg:
                    child.weight && child.weight >= 2 ? child.weight : 7.5,
                height_cm: child.height || 65,
                premature: false, // يمكن إضافة هذا الحقل للـ child entity لاحقاً
                allergies: 'None', // يمكن إضافة هذا الحقل للـ child entity لاحقاً
                last_feed_hours: 2.5, // قيم افتراضية - يمكن إضافة جدول activity tracking لاحقاً
                last_sleep_hours: 1.5,
                last_diaper_hours: 1,
                vital_signs: {
                    temperature_c:
                        latestIoTReading?.temperature &&
                        latestIoTReading.temperature >= 35
                            ? latestIoTReading.temperature
                            : 37.0,
                    heart_rate_bpm: latestIoTReading?.heartRate
                        ? Math.round(latestIoTReading.heartRate)
                        : 120,
                    breathing_rate: 40, // قيمة افتراضية
                    oxygen_level: latestIoTReading?.spo2 || 98,
                    movement_level: 0.3, // قيمة افتراضية
                    sleep_duration_hours: 2, // قيمة افتراضية
                },
                cry_analysis: {
                    cry_type: latestPrediction?.prediction || 'Hunger',
                    cry_intensity: 0.6, // قيمة افتراضية
                    confidence: latestPrediction?.confidence || 90,
                },
            };

            this.logger.log(
                `Sending recommendation request: ${JSON.stringify(requestData)}`,
            );

            // إرسال الطلب إلى خدمة التوصيات
            const response = await this.client.post('/recommend', requestData);

            this.logger.log(
                `Recommendation received successfully for user: ${userId}`,
            );

            return response.data;
        } catch (error) {
            this.logger.error(
                `Error fetching recommendation for user ${userId}:`,
                error.response?.data || error.message,
            );

            // معالجة خاصة لخطأ الاتصال بالخدمة الخارجية
            if (error.code === 'ECONNREFUSED') {
                throw new Error(
                    'Recommendation service is currently unavailable. Please try again later.',
                );
            }

            // إرجاع رسالة خطأ واضحة
            throw new Error(
                error.response?.data?.message ||
                    error.message ||
                    'Failed to fetch recommendation',
            );
        }
    }
}
