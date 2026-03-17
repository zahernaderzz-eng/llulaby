import { IsOptional, IsDateString, IsString } from 'class-validator';

export class MarkTakenDto {
    @IsOptional()
    @IsDateString()
    takenAt?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}
