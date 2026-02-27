import {
    IsEmail,
    IsMongoId,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

export class AddAdminDto {
    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    name: string;

    @IsEmail({}, { message: 'messages.invalidEmail' })
    @IsNotEmpty({ message: 'messages.emailRequired' })
    email: string;

    @Matches(/^\+[0-9]{7,15}$/, { message: 'messages.invalidPhone' })
    @IsNotEmpty({ message: 'messages.phoneRequired' })
    phone: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    password: string;

    @IsMongoId({ message: 'messages.invalidRole' })
    @IsNotEmpty({ message: 'messages.roleRequired' })
    role: string;

    avatar?: string;
}
