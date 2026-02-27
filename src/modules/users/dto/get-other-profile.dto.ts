import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetOtherProfileDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;
}
