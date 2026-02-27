import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ToggleBlockAdminDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
