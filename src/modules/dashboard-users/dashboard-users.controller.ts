import { Controller } from '@nestjs/common';
import { DashboardUsersService } from './dashboard-users.service';

@Controller('dashboard/users')
export class DashboardUsersController {
    constructor(
        private readonly dashboardUsersService: DashboardUsersService,
    ) {}
}
