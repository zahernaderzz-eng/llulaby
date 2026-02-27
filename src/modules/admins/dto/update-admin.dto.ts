import {
    IsEmail,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateAdminDto {
    @IsMongoId({ message: 'messages.invalidId' })
    @IsNotEmpty({ message: 'messages.idRequired' })
    id: string;

    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    @IsOptional()
    name: string;

    @IsEmail({}, { message: 'messages.invalidEmail' })
    @IsNotEmpty({ message: 'messages.emailRequired' })
    @IsOptional()
    email: string;

    @Matches(/^\+[0-9]{7,15}$/, { message: 'messages.invalidPhone' })
    @IsNotEmpty({ message: 'messages.phoneRequired' })
    @IsOptional()
    phone: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    @IsOptional()
    password: string;

    @IsMongoId({ message: 'messages.invalidRole' })
    @IsNotEmpty({ message: 'messages.roleRequired' })
    @IsOptional()
    role: string;

    avatar?: string;
}
