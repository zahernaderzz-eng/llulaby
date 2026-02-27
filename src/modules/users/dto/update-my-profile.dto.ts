import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateMyProfileDto {
    @IsNotEmpty({ message: 'messages.nameRequired' })
    @MinLength(3, { message: 'messages.invalidNameLength' })
    @MaxLength(20, { message: 'messages.invalidNameLength' })
    @IsString({ message: 'messages.invalidName' })
    @IsOptional()
    name?: string;

    @IsNotEmpty({ message: 'messages.countryRequired' })
    @IsMongoId({ message: 'messages.invalidCountry' })
    @IsOptional()
    country?: string;

    @IsNotEmpty({ message: 'messages.bioRequired' })
    @MinLength(3, { message: 'messages.invalidBioLength' })
    @MaxLength(100, { message: 'messages.invalidBioLength' })
    @IsString({ message: 'messages.invalidBio' })
    @IsOptional()
    bio?: string;

    avatar?: string;
}
