import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';

export class UsersCommonHelper {
    private readonly serviceMap = {};

    private readonly modelMap = {};

    constructor(
        private readonly usersService: UsersService,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) {
        this.serviceMap = {
            user: this.usersService,
        };

        this.modelMap = {
            user: this.userModel,
        };
    }

    getService(type: string) {
        return this.serviceMap[type];
    }

    getModel(type: string) {
        return this.modelMap[type];
    }

    getRef(type: string) {
        const refMap = {
            user: 'User',
            admin: 'Admin',
        };

        return refMap[type.toLowerCase()];
    }
}
