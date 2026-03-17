import { IsOptional, IsDateString, IsString, IsBoolean } from 'class-validator';

export class MarkTakenDto {


    @IsBoolean()
    isTaken: boolean;




    @IsString()
    vaccineId: string;
}
