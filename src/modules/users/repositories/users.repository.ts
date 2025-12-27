import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../schemas/user.model';

@Injectable()
export class UsersRepository {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async findById(id: string): Promise<User | null> {
        return this.userModel.findById(id).exec();
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.userModel
                .find({ deletedAt: null })
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.userModel.countDocuments({ deletedAt: null }).exec(),
        ]);

        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async update(id: string, data: Partial<User>): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(id, data, { new: true })
            .select('-password')
            .exec();
    }

    async softDelete(id: string): Promise<void> {
        await this.userModel
            .findByIdAndUpdate(id, { deletedAt: new Date() })
            .exec();
    }

    async addAddress(userId: string, address: any): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(
                userId,
                { $push: { addresses: address } },
                { new: true },
            )
            .select('-password')
            .exec();
    }

    async updateAddress(
        userId: string,
        addressId: string,
        addressData: any,
    ): Promise<User | null> {
        return this.userModel
            .findOneAndUpdate(
                { _id: userId, 'addresses._id': addressId },
                { $set: { 'addresses.$': { ...addressData, _id: addressId } } },
                { new: true },
            )
            .select('-password')
            .exec();
    }

    async deleteAddress(userId: string, addressId: string): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(
                userId,
                { $pull: { addresses: { _id: addressId } } },
                { new: true },
            )
            .select('-password')
            .exec();
    }

    async updatePreferences(
        userId: string,
        preferences: any,
    ): Promise<User | null> {
        return this.userModel
            .findByIdAndUpdate(
                userId,
                { $set: { preferences } },
                { new: true },
            )
            .select('-password')
            .exec();
    }
}
