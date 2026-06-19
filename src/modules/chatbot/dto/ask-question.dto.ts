import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';

export class AskQuestionDto {
    @IsString()
    question?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    age?: number;

    @IsOptional()
    @IsIn(['ar', 'en'])
    language?: string;
}
