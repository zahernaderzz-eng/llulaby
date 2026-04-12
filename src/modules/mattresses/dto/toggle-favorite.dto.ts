import { IsNotEmpty, IsString } from 'class-validator';

export class ToggleFavoriteDto {
    @IsNotEmpty()
    @IsString()
    companyId: string;

    @IsNotEmpty()
    @IsString()
    productNameEn: string;
}
