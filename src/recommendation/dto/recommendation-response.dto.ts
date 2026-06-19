export interface VitalSigns {
    temperature_c: number;
    heart_rate_bpm: number;
    breathing_rate: number;
    oxygen_level: number;
    movement_level: number;
    sleep_duration_hours: number;
}

export interface CryAnalysis {
    cry_type: string;
    cry_intensity: number;
    confidence: number;
}

export interface RecommendationRequestDto {
    infant_id: string;
    infant_name: string;
    age_months: number;
    gender: string;
    weight_kg: number;
    height_cm: number;
    premature: boolean;
    allergies: string;
    last_feed_hours: number;
    last_sleep_hours: number;
    last_diaper_hours: number;
    vital_signs: VitalSigns;
    cry_analysis: CryAnalysis;
}
