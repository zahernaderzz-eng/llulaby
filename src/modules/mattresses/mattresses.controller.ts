import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';

import { MattressesService } from './mattresses.service';
import { CreateMattressDto } from './dto/create-mattress.dto';
import { UpdateMattressDto } from './dto/update-mattress.dto';
import { ApiUtil } from 'src/common/utils/api-util';

@Controller('mattresses')
export class MattressesController {
    constructor(private readonly mattressesService: MattressesService) {}

    // =====================
    // 🟢 CREATE
    // =====================
    @Post()
    create(@Body() createMattressDto: CreateMattressDto) {
        return this.mattressesService.create(createMattressDto);
    }

    // =====================
    // 🟢 GET ALL
    // =====================
    @Get()
    async findAll() {
        const mattresses = await this.mattressesService.findAll();
        console.log(mattresses);
        return ApiUtil.formatResponse(
            200,
            'Mattresses retrieved successfully',
            mattresses,
        );
    }

    // =====================
    // 🟢 GET ONE
    // =====================
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.mattressesService.findOne(id);
    }

    // =====================
    // 🟢 UPDATE
    // =====================
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateMattressDto: UpdateMattressDto,
    ) {
        return this.mattressesService.update(id, updateMattressDto);
    }

    // =====================
    // 🟢 DELETE
    // =====================
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.mattressesService.remove(id);
    }

    // =====================
    // 🟢 GET BASE PRICE
    // =====================
    @Post('price')
    getPrice(
        @Body()
        body: {
            mattressId: string;
            productName: string;
            size?: number;
        },
    ) {
        return this.mattressesService.getBasePrice(
            body.mattressId,
            body.productName,
            body.size,
        );
    }

    // =====================
    // 🔥 CALCULATE PRICE
    // =====================
    @Post('calculate')
    async calculatePrice(
        @Body()
        body: {
            mattressId: string;
            productName: string;
            size?: number;
            extras?: string[];
            discount?: number;
            quantity?: number;
        },
    ) {
        const price = await this.mattressesService.calculatePrice(body);
        console.log('Calculated Price:', price);

        return ApiUtil.formatResponse(200, 'Price calculated successfully', {
            price,
        });
    }
}
