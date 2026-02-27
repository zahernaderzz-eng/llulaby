import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from './entities/country.entity';
import { Model } from 'mongoose';
import { ReturnObject } from 'src/common/return-object/return-object';

@Injectable()
export class CountriesService {
    constructor(
        private readonly returnObject: ReturnObject,
        @InjectModel(Country.name)
        private readonly countryModel: Model<Country>,
    ) {}

    async findById(
        id: string,
        options?: { populate?: any; lean?: boolean },
    ): Promise<CountryDocument | null> {
        const query = this.countryModel.findById(id);

        if (options?.populate) query.populate(options.populate);
        if (options?.lean) query.lean();

        return await query.exec();
    }

    async getAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [countries, totalCount] = await Promise.all([
            this.countryModel.find().skip(skip).limit(limit),
            this.countryModel.countDocuments(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        const countriesObjects = countries.map((country) =>
            this.returnObject.country(country),
        );

        return {
            countries: countriesObjects,
            totalCount,
            totalPages,
        };
    }
}
