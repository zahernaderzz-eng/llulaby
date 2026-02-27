import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { AuthUtil } from 'src/common/utils/auth-util';

@ValidatorConstraint()
export class ValidIdentifier implements ValidatorConstraintInterface {
    validate(value: any): Promise<boolean> | boolean {
        const type = AuthUtil.getIdentifierType(value);
        return type !== null;
    }

    defaultMessage(): string {
        return 'messages.invalidIdentifier';
    }
}
