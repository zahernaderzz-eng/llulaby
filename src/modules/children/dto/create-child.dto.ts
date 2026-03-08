import {
    IsEnum,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    IsDateString,
} from 'class-validator';

export class CreateChildDto {
    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsNotEmpty({ message: 'messages.nameRequired' })
    name: string;

    @IsDateString({}, { message: 'messages.invalidDateBirth' })
    @IsNotEmpty({ message: 'messages.dateBirthRequired' })
    dateBirth: string;

    @IsEnum(['male', 'female'], { message: 'messages.invalidGender' })
    @IsNotEmpty({ message: 'messages.genderRequired' })
    gender: string;
}
