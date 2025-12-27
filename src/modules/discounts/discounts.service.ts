import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DiscountsRepository } from './repositories/discounts.repository';
import { CreateDiscountDto, UpdateDiscountDto, ValidateCouponDto } from './dto';

@Injectable()
export class DiscountsService {
    constructor(private discountsRepository: DiscountsRepository) { }

    async create(createDto: CreateDiscountDto, userId?: string) {
        if (createDto.code) {
            const existingDiscount = await this.discountsRepository.findByCode(createDto.code);
            if (existingDiscount) {
                throw new ConflictException('Discount code already exists');
            }
        }

        const discountData: any = {
            ...createDto,
            startDate: new Date(createDto.startDate),
            endDate: new Date(createDto.endDate),
            applicableProducts: createDto.applicableProducts?.map(id => new Types.ObjectId(id)) || [],
            applicableCategories: createDto.applicableCategories?.map(id => new Types.ObjectId(id)) || [],
            targetedUserIds: createDto.targetedUserIds?.map(id => new Types.ObjectId(id)) || [],
            createdBy: userId ? new Types.ObjectId(userId) : undefined,
        };

        return this.discountsRepository.create(discountData);
    }

    async findAll(activeOnly: boolean = false) {
        return this.discountsRepository.findAll(activeOnly);
    }

    async findById(id: string) {
        const discount = await this.discountsRepository.findById(id);
        if (!discount) {
            throw new NotFoundException('Discount not found');
        }
        return discount;
    }

    async findByCode(code: string) {
        const discount = await this.discountsRepository.findByCode(code);
        if (!discount) {
            throw new NotFoundException('Discount code not found');
        }
        return discount;
    }

    async update(id: string, updateDto: UpdateDiscountDto) {
        const discount = await this.discountsRepository.findById(id);
        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        if (updateDto.code && updateDto.code !== discount.code) {
            const existingDiscount = await this.discountsRepository.findByCode(updateDto.code);
            if (existingDiscount) {
                throw new ConflictException('Discount code already exists');
            }
        }

        const updateData: any = { ...updateDto };

        if (updateDto.startDate) {
            updateData.startDate = new Date(updateDto.startDate);
        }
        if (updateDto.endDate) {
            updateData.endDate = new Date(updateDto.endDate);
        }
        if (updateDto.applicableProducts) {
            updateData.applicableProducts = updateDto.applicableProducts.map(id => new Types.ObjectId(id));
        }
        if (updateDto.applicableCategories) {
            updateData.applicableCategories = updateDto.applicableCategories.map(id => new Types.ObjectId(id));
        }
        if (updateDto.targetedUserIds) {
            updateData.targetedUserIds = updateDto.targetedUserIds.map(id => new Types.ObjectId(id));
        }

        return this.discountsRepository.update(id, updateData);
    }

    async delete(id: string) {
        const discount = await this.discountsRepository.findById(id);
        if (!discount) {
            throw new NotFoundException('Discount not found');
        }

        await this.discountsRepository.delete(id);
        return { message: 'Discount deleted successfully' };
    }

    async validateCoupon(validateDto: ValidateCouponDto) {
        const discount = await this.discountsRepository.findByCode(validateDto.code);

        if (!discount) {
            return {
                valid: false,
                message: 'Invalid coupon code',
            };
        }

        const now = new Date();

        if (!discount.isActive) {
            return { valid: false, message: 'This coupon is inactive' };
        }

        if (now < discount.startDate) {
            return { valid: false, message: 'This coupon is not yet active' };
        }

        if (now > discount.endDate) {
            return { valid: false, message: 'This coupon has expired' };
        }

        if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
            return { valid: false, message: 'This coupon has reached its usage limit' };
        }

        if (discount.minimumPurchaseAmount && validateDto.cartTotal && validateDto.cartTotal < discount.minimumPurchaseAmount) {
            return {
                valid: false,
                message: `Minimum purchase of ${discount.minimumPurchaseAmount} required`,
            };
        }

        if (!discount.isPublic && validateDto.userId) {
            const isTargeted =
                discount.targetedUserIds.some(id => id.toString() === validateDto.userId) ||
                discount.targetedUserEmails.length === 0;

            if (!isTargeted) {
                return { valid: false, message: 'This coupon is not available for your account' };
            }
        }

        if (discount.applicationType === 'specific_products' && validateDto.productIds) {
            const hasApplicableProduct = validateDto.productIds.some(pid =>
                discount.applicableProducts.some(ap => ap.toString() === pid)
            );
            if (!hasApplicableProduct) {
                return { valid: false, message: 'This coupon is not applicable to your cart items' };
            }
        }

        if (discount.applicationType === 'specific_categories' && validateDto.categoryIds) {
            const hasApplicableCategory = validateDto.categoryIds.some(cid =>
                discount.applicableCategories.some(ac => ac.toString() === cid)
            );
            if (!hasApplicableCategory) {
                return { valid: false, message: 'This coupon is not applicable to your cart items' };
            }
        }

        return {
            valid: true,
            discount: {
                _id: discount._id,
                code: discount.code,
                name: discount.name,
                type: discount.type,
                value: discount.value,
                applicationType: discount.applicationType,
            },
        };
    }

    async incrementUsage(id: string) {
        return this.discountsRepository.incrementUsage(id);
    }
}
