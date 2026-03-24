import { IsNumber, IsObject } from 'class-validator';

export class CreatePhysicalGrowthDto {
    @IsNumber()
    minMonth: number;

    @IsNumber()
    maxMonth: number;

    @IsObject()
    overview: {
        en: string;
        ar: string;
    };

    @IsObject()
    weight: {
        en: string;
        ar: string;
    };

    @IsObject()
    height: {
        en: string;
        ar: string;
    };
}
