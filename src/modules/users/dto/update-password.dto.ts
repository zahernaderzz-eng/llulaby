import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';
import { PasswordsMatch } from 'src/modules/auth/validation/passwords-match';

export class UpdatePasswordDto {
    @IsString({ message: 'messages.invalidOldPassword' })
    @MinLength(6, { message: 'messages.invalidOldPasswordLength' })
    @MaxLength(20, { message: 'messages.invalidOldPasswordLength' })
    @IsNotEmpty({ message: 'messages.oldPasswordRequired' })
    oldPassword: string;

    @IsString({ message: 'messages.invalidNewPassword' })
    @MinLength(6, { message: 'messages.invalidNewPasswordLength' })
    @MaxLength(20, { message: 'messages.invalidNewPasswordLength' })
    @IsNotEmpty({ message: 'messages.newPasswordRequired' })
    newPassword: string;

    @Validate(PasswordsMatch)
    @IsString({ message: 'messages.invalidPasswordConfirm' })
    @IsNotEmpty({ message: 'messages.passwordConfirmRequired' })
    newPasswordConfirm: string;
}
