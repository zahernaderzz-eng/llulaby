import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class AdminSigninDto {
    @IsEmail({}, { message: 'messages.invalidEmail' })
    @IsNotEmpty({ message: 'messages.emailRequired' })
    email: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    password: string;
}
