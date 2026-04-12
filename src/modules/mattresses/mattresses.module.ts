import { Module } from '@nestjs/common';
import { MattressesService } from './mattresses.service';
import { MattressesController } from './mattresses.controller';
import { MattressesDbModule } from './db/mattresses.db.module';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';

@Module({
    imports: [MattressesDbModule, IdentitiesModule, UserTokensModule],
    controllers: [MattressesController, FavoritesController],
    providers: [MattressesService, FavoritesService],
})
export class MattressesModule {}
