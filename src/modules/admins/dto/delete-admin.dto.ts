import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteAdminDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
