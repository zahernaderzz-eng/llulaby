import { IsNotEmpty, Validate } from 'class-validator';
import { ValidIdentifier } from '../validation/valid-identifier';

export class ForgotPasswordDto {
    @Validate(ValidIdentifier)
    @IsNotEmpty({ message: 'messages.identifierRequired' })
    identifier: string;
}
