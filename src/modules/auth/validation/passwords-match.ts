import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class PasswordsMatch implements ValidatorConstraintInterface {
    validate(
        value: any,
        validationArguments: ValidationArguments,
    ): Promise<boolean> | boolean {
        if (!value) return false;

        const obj: any = validationArguments.object;

        return value === (obj.password || obj.newPassword);
    }

    defaultMessage(): string {
        return 'messages.passwordsDontMatch';
    }
}
