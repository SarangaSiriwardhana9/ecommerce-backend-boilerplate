import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UpdateProfileDto, AddAddressDto, UpdatePreferencesDto } from './dto';

@Injectable()
export class UsersService {
    constructor(private usersRepository: UsersRepository) { }

    async getProfile(userId: string) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateProfile(userId: string, updateDto: UpdateProfileDto) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedUser = await this.usersRepository.update(userId, updateDto);

        return updatedUser;
    }

    async getAllUsers(page: number = 1, limit: number = 20) {
        return this.usersRepository.findAll(page, limit);
    }

    async getUserById(id: string) {
        const user = await this.usersRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async deleteUser(id: string) {
        const user = await this.usersRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.usersRepository.softDelete(id);

        return {
            message: 'User deleted successfully',
        };
    }

    // Address management
    async addAddress(userId: string, addressDto: AddAddressDto) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // If this is set as default, unset other default addresses
        if (addressDto.isDefault) {
            user.addresses.forEach((addr: any) => {
                addr.isDefault = false;
            });
            await this.usersRepository.update(userId, { addresses: user.addresses });
        }

        const updatedUser = await this.usersRepository.addAddress(userId, addressDto);

        return updatedUser;
    }

    async updateAddress(
        userId: string,
        addressId: string,
        addressDto: Partial<AddAddressDto>,
    ) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const addressExists = user.addresses.some(
            (addr: any) => addr._id.toString() === addressId,
        );

        if (!addressExists) {
            throw new NotFoundException('Address not found');
        }

        // If setting this as default, unset other defaults
        if (addressDto.isDefault) {
            user.addresses.forEach((addr: any) => {
                if (addr._id.toString() !== addressId) {
                    addr.isDefault = false;
                }
            });
            await this.usersRepository.update(userId, { addresses: user.addresses });
        }

        const updatedUser = await this.usersRepository.updateAddress(
            userId,
            addressId,
            addressDto,
        );

        return updatedUser;
    }

    async deleteAddress(userId: string, addressId: string) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const addressExists = user.addresses.some(
            (addr: any) => addr._id.toString() === addressId,
        );

        if (!addressExists) {
            throw new NotFoundException('Address not found');
        }

        const updatedUser = await this.usersRepository.deleteAddress(userId, addressId);

        return updatedUser;
    }

    async updatePreferences(userId: string, preferencesDto: UpdatePreferencesDto) {
        const user = await this.usersRepository.findById(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const updatedPreferences = {
            ...user.preferences,
            ...preferencesDto,
        };

        const updatedUser = await this.usersRepository.updatePreferences(
            userId,
            updatedPreferences,
        );

        return updatedUser;
    }
}
