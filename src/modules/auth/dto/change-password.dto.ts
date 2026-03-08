import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';
import { PasswordsMatch } from '../validation/passwords-match';

export class ChangePasswordDto {
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    currentPassword: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    newPassword: string;

    @Validate(PasswordsMatch)
    @IsString({ message: 'messages.invalidPasswordConfirm' })
    @IsNotEmpty({ message: 'messages.passwordConfirmRequired' })
    newPasswordConfirm: string;
}
