import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class IoTDataDto {
    @IsString()
    deviceId: string;

    @IsOptional()
    @IsString()
    childId?: string; // Optional: if user has multiple children

    @IsNumber()
    @Min(0)
    @Max(300)
    heartRate: number;

    @IsNumber()
    @Min(0)
    @Max(100)
    spo2: number;

    @IsNumber()
    @Min(30)
    @Max(45)
    temperature: number;

    @IsOptional()
    @IsNumber()
    timestamp?: number;
}
