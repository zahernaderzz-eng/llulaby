import { forwardRef, Module } from '@nestjs/common';
import { VaccineController } from './vaccine.controller';
import { VaccineService } from './vaccine.service';
import { vaccineDbModule } from './db/vaccine.db.module';
import { ChildVaccineService } from './child-vaccine.service';
import { ChildVaccinesController } from './child-vaccines.controller';
import { IdentitiesModule } from '../identities/identities.module';
import { UserTokensModule } from '../user-tokens/user-tokens.module';
import { ChildrenModule } from '../children/children.module';

@Module({
    imports: [
        vaccineDbModule,
        IdentitiesModule,
        UserTokensModule,
        forwardRef(() => ChildrenModule),
    ],
    controllers: [VaccineController, ChildVaccinesController],
    providers: [VaccineService, ChildVaccineService],
    exports: [VaccineService, ChildVaccineService, vaccineDbModule],
})
export class VaccineModule {}
