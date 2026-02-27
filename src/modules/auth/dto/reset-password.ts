import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';
import { ValidIdentifier } from '../validation/valid-identifier';
import { PasswordsMatch } from '../validation/passwords-match';

export class ResetPasswordDto {
    @Validate(ValidIdentifier)
    @IsNotEmpty({ message: 'messages.identifierRequired' })
    identifier: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    password: string;

    @Validate(PasswordsMatch)
    @IsString({ message: 'messages.invalidPasswordConfirm' })
    @IsNotEmpty({ message: 'messages.passwordConfirmRequired' })
    passwordConfirm: string;
}
