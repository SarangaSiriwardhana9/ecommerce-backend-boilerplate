import {
    Controller,
    Get,
    Put,
    Post,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '../auth/decorators';
import { ZodValidationPipe } from '../../common/pipes';
import {
    updateProfileSchema,
    addAddressSchema,
    updatePreferencesSchema,
} from './schemas/user.schema';
import { UpdateProfileDto, AddAddressDto, UpdatePreferencesDto } from './dto';
import { USER_ROLES } from '../../common/constants';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    /**
     * Get current user profile
     * GET /users/me
     */
    @Get('me')
    async getMyProfile(@CurrentUser() user: any) {
        return {
            data: await this.usersService.getProfile(user.userId),
        };
    }

    /**
     * Update current user profile
     * PUT /users/me
     */
    @Put('me')
    async updateMyProfile(
        @CurrentUser() user: any,
        @Body(new ZodValidationPipe(updateProfileSchema)) updateDto: UpdateProfileDto,
    ) {
        return {
            data: await this.usersService.updateProfile(user.userId, updateDto),
            message: 'Profile updated successfully',
        };
    }

    /**
     * Add address to current user
     * POST /users/me/addresses
     */
    @Post('me/addresses')
    @HttpCode(HttpStatus.CREATED)
    async addAddress(
        @CurrentUser() user: any,
        @Body(new ZodValidationPipe(addAddressSchema)) addressDto: AddAddressDto,
    ) {
        return {
            data: await this.usersService.addAddress(user.userId, addressDto),
            message: 'Address added successfully',
        };
    }

    /**
     * Update address
     * PUT /users/me/addresses/:addressId
     */
    @Put('me/addresses/:addressId')
    async updateAddress(
        @CurrentUser() user: any,
        @Param('addressId') addressId: string,
        @Body(new ZodValidationPipe(addAddressSchema.partial()))
        addressDto: Partial<AddAddressDto>,
    ) {
        return {
            data: await this.usersService.updateAddress(user.userId, addressId, addressDto),
            message: 'Address updated successfully',
        };
    }

    /**
     * Delete address
     * DELETE /users/me/addresses/:addressId
     */
    @Delete('me/addresses/:addressId')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAddress(
        @CurrentUser() user: any,
        @Param('addressId') addressId: string,
    ) {
        await this.usersService.deleteAddress(user.userId, addressId);
    }

    /**
     * Update user preferences
     * PUT /users/me/preferences
     */
    @Put('me/preferences')
    async updatePreferences(
        @CurrentUser() user: any,
        @Body(new ZodValidationPipe(updatePreferencesSchema))
        preferencesDto: UpdatePreferencesDto,
    ) {
        return {
            data: await this.usersService.updatePreferences(user.userId, preferencesDto),
            message: 'Preferences updated successfully',
        };
    }

    /**
     * Get all users (Admin only)
     * GET /users
     */
    @Get()
    @UseGuards(RolesGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    async getAllUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return {
            data: await this.usersService.getAllUsers(
                parseInt(page),
                parseInt(limit),
            ),
        };
    }

    /**
     * Get user by ID (Admin only)
     * GET /users/:id
     */
    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    async getUserById(@Param('id') id: string) {
        return {
            data: await this.usersService.getUserById(id),
        };
    }

    /**
     * Delete user (Admin only)
     * DELETE /users/:id
     */
    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN)
    @HttpCode(HttpStatus.OK)
    async deleteUser(@Param('id') id: string) {
        return await this.usersService.deleteUser(id);
    }
}
