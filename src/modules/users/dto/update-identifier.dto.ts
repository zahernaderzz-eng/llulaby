import { IsNotEmpty, Validate } from 'class-validator';
import { ValidIdentifier } from 'src/modules/auth/validation/valid-identifier';

export class UpdateIdentifierDto {
    @Validate(ValidIdentifier)
    @IsNotEmpty({ message: 'messages.identifierRequired' })
    identifier: string;
}
