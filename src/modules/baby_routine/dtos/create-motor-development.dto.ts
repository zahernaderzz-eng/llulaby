import { IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateMotorDevelopmentDto {
    @IsNumber()
    minMonth: number;

    @IsNumber()
    maxMonth: number;

    @IsObject()
    overview: {
        en: string;
        ar: string;
    };

    @IsArray()
    movements: {
        en: string;
        ar: string;
    }[];
}
