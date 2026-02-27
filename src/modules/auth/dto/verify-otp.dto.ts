import { IsEnum, IsNotEmpty, IsString, Validate } from 'class-validator';
import { VerifyReason } from '../enums/verify-reason.enum';
import { ValidIdentifier } from '../validation/valid-identifier';

export class VerifyOtpDto {
    @Validate(ValidIdentifier)
    @IsNotEmpty({ message: 'messages.identifierRequired' })
    identifier: string;

    @IsEnum(VerifyReason, { message: 'messages.invalidVerifyReason' })
    @IsNotEmpty({ message: 'messages.verifyReasonRequired' })
    reason: VerifyReason;

    @IsString({ message: 'messages.invalidOtp' })
    @IsNotEmpty({ message: 'messages.otpRequired' })
    otp: string;
}
