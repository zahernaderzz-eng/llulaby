export class CreateVaccineDto {
    name: string;
    ageRequired: number;
    dose: number;
    vaccineType: string;
    description?: string;
    repeat?: boolean;
}
