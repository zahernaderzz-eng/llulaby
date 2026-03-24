import { IsNumber, IsArray, IsObject } from 'class-validator';

export class CreateFeedingDto {
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
    foods: {
        category: { en: string; ar: string };
        items: { en: string; ar: string }[];
    }[];

    @IsArray()
    notes: {
        en: string;
        ar: string;
    }[];
}
