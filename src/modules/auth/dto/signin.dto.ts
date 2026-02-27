import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';
import { DeviceType } from '../enums/device.type.enum';
import { ValidIdentifier } from '../validation/valid-identifier';

export class SigninDto {
    @Validate(ValidIdentifier)
    @IsNotEmpty({ message: 'messages.identifierRequired' })
    identifier: string;

    @MaxLength(20, { message: 'messages.invalidPasswordLength' })
    @MinLength(6, { message: 'messages.invalidPasswordLength' })
    @IsString({ message: 'messages.invalidPassword' })
    @IsNotEmpty({ message: 'messages.passwordRequired' })
    password: string;

    @IsString({ message: 'messages.invalidFcmToken' })
    @IsNotEmpty({ message: 'messages.fcmTokenRequired' })
    @IsOptional()
    fcmToken?: string;

    @IsEnum(DeviceType, { message: 'messages.invalidDeviceType' })
    @IsNotEmpty({ message: 'messages.deviceTypeRequired' })
    @IsOptional()
    deviceType?: DeviceType;
}
