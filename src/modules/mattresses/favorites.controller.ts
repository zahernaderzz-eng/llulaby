import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { ToggleFavoriteDto } from './dto/toggle-favorite.dto';
import { ApiUtil } from 'src/common/utils/api-util';
import { AuthenticateGuardFactory } from '../auth/guards/authenticate.guard';

@UseGuards(AuthenticateGuardFactory())
@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    async getFavorites(@Req() request: Request) {
        const userId = request['user']['id'];
        const favorites = await this.favoritesService.getFavorites(userId);

        return ApiUtil.formatResponse(
            200,
            'Favorites retrieved successfully',
            favorites,
        );
    }

    @Post('toggle')
    async toggleFavorite(
        @Req() request: Request,
        @Body() body: ToggleFavoriteDto,
    ) {
        const userId = request['user']['id'];
        const result = await this.favoritesService.toggleFavorite(userId, body);

        const message = result.isFavorite
            ? 'Added to favorites'
            : 'Removed from favorites';

        return ApiUtil.formatResponse(200, message, result);
    }
}
