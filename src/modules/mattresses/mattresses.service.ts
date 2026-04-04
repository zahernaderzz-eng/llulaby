import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateMattressDto } from './dto/create-mattress.dto';
import { UpdateMattressDto } from './dto/update-mattress.dto';
import { Mattress, MattressDocument } from './entities/mattress.entity';
import { AppException } from 'src/common/exceptions/app.exception';

@Injectable()
export class MattressesService {
    constructor(
        @InjectModel(Mattress.name)
        private mattressModel: Model<MattressDocument>,
    ) {}

    // =====================
    // 🟢 CRUD
    // =====================

    async create(createMattressDto: CreateMattressDto) {
        const created = new this.mattressModel(createMattressDto);
        return created.save();
    }

    async findAll() {
        return this.mattressModel.find();
    }

    async findOne(id: string) {
        const mattress = await this.mattressModel.findById(id);

        if (!mattress) {
            throw new NotFoundException('Mattress not found');
        }

        return mattress;
    }

    async update(id: string, updateMattressDto: UpdateMattressDto) {
        const updated = await this.mattressModel.findByIdAndUpdate(
            id,
            updateMattressDto,
            { new: true },
        );

        if (!updated) {
            throw new NotFoundException('Mattress not found');
        }

        return updated;
    }

    async remove(id: string) {
        const deleted = await this.mattressModel.findByIdAndDelete(id);

        if (!deleted) {
            throw new NotFoundException('Mattress not found');
        }

        return { message: 'Deleted successfully' };
    }

    // =====================
    // 🟢 GET BASE PRICE
    // =====================

    async getBasePrice(
        mattressId: string,
        productName: string,
        size?: number,
    ): Promise<number> {
        const mattress = await this.mattressModel.findById(mattressId);

        if (!mattress) {
            throw new AppException('Mattress not found', 404);
        }
        console.log('Mattress:', mattress);

        const product = mattress.products.find(
            (p) => p.name.en === productName,
        );

        if (!product) {
            throw new AppException('Product not found', 404);
        }

        // 🟢 Array (مراتب)
        if (product.pricesArray && mattress.sizes && size) {
            const index = mattress.sizes.indexOf(size);

            if (index === -1) {
                throw new AppException('Invalid size', 400);
            }

            return product.pricesArray[index];
        }

        // 🟢 Map (مخدات)
        if (product.pricesMap && size) {
            const price = product.pricesMap[size.toString()];

            if (!price) {
                throw new AppException('Invalid size', 400);
            }

            return price;
        }

        // 🟢 Fixed
        if (product.fixedPrice) {
            return product.fixedPrice;
        }

        throw new AppException('No pricing available', 400);
    }

    // =====================
    // 🟢 CALCULATE PRICE (🔥)
    // =====================

    async calculatePrice(data: {
        mattressId: string;
        productName: string;
        size?: number;
        extras?: string[];
        discount?: number;
        quantity?: number;
    }) {
        const {
            mattressId,
            productName,
            size,
            extras = [],
            discount = 0,
            quantity = 1,
        } = data;

        const mattress = await this.mattressModel.findById(mattressId);

        if (!mattress) {
            throw new AppException('Mattress not found', 404);
        }

        // 🟢 base price
        const basePrice = await this.getBasePrice(
            mattressId,
            productName,
            size,
        );

        // 🟢 extras
        let extrasTotal = 0;

        extras.forEach((extra) => {
            if (extra === 'frame' && mattress.extras?.frame) {
                extrasTotal += mattress.extras.frame.price;
            }

            if (extra === 'qatar' && mattress.extras?.qatar) {
                extrasTotal += mattress.extras.qatar.price;
            }
        });

        // 🟢 subtotal
        const subtotal = (basePrice + extrasTotal) * quantity;

        // 🟢 discount
        const discountValue = (subtotal * discount) / 100;

        // 🟢 final
        const finalPrice = subtotal - discountValue;

        return {
            basePrice,
            extrasTotal,
            quantity,
            subtotal,
            discount,
            discountValue,
            finalPrice,
        };
    }
}
