import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetAdminDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
