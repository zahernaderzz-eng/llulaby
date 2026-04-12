import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './entities/favorite.entity';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';

@Injectable()
export class FavoritesService {
    constructor(
        @InjectModel(Favorite.name)
        private favoriteModel: Model<FavoriteDocument>,
    ) {}

    async getFavorites(userId: string) {
        return this.favoriteModel
            .find({ userId })
            .select('companyId productNameEn -_id');
    }

    async toggleFavorite(userId: string, data: ToggleFavoriteDto) {
        const existing = await this.favoriteModel.findOne({
            userId,
            companyId: data.companyId,
            productNameEn: data.productNameEn,
        });

        if (existing) {
            await this.favoriteModel.deleteOne({ _id: existing._id });
            return { isFavorite: false };
        } else {
            const newFavorite = new this.favoriteModel({
                userId,
                companyId: data.companyId,
                productNameEn: data.productNameEn,
            });
            await newFavorite.save();
            return { isFavorite: true };
        }
    }
}
