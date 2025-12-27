import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schemas/user.model';
import { PasswordUtil } from '../../common/utils';
import { USER_ROLES } from '../../common/constants';
import {
    RegisterDto,
    LoginDto,
    ForgotPasswordDto,
    ResetPasswordDto,
} from './dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) { }

    /**
     * Register a new user
     */
    async register(registerDto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.userModel.findOne({
            email: registerDto.email,
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await PasswordUtil.hash(registerDto.password);

        // Create user
        const user = new this.userModel({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            role: USER_ROLES.CUSTOMER,
            authProvider: 'local',
            isVerified: false,
            isActive: true,
        });

        await user.save();

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
        const userObject = user.toObject() as any;
        delete userObject.password;

        return {
            user: userObject,
            token,
        };
    }

    /**
     * Login user
     */
    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Update last login
        await this.userModel.findByIdAndUpdate(user._id, {
            lastLoginAt: new Date(),
        });

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
        const userObject = user.toObject() as any;
        delete userObject.password;

        return {
            user: userObject,
            token,
        };
    }

    /**
     * Validate user credentials
     */
    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userModel
            .findOne({ email })
            .select('+password')
            .exec();

        if (!user) {
            return null;
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        const isPasswordValid = await PasswordUtil.compare(password, user.password);

        if (!isPasswordValid) {
            return null;
        }

        return user;
    }

    /**
     * Generate JWT token
     */
    private generateToken(user: User): string {
        const payload = {
            sub: (user._id as any).toString(),
            email: user.email,
            role: user.role,
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Get user profile
     */
    async getProfile(userId: string) {
        const user = await this.userModel.findById(userId).exec();

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    /**
     * Forgot password - generate reset token
     */
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
        const user = await this.userModel.findOne({
            email: forgotPasswordDto.email,
        });

        if (!user) {
            // Don't reveal if user exists or not
            return {
                message: 'If the email exists, a password reset link has been sent',
            };
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Save hashed token and expiry (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();

        // TODO: Send email with reset token
        // In production, send email with: `${FRONTEND_URL}/reset-password?token=${resetToken}`
        // For development, you can return the token
        console.log('Reset token:', resetToken);

        return {
            message: 'If the email exists, a password reset link has been sent',
            // Remove this in production
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
        };
    }

    /**
     * Reset password with token
     */
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        // Hash the token from request
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetPasswordDto.token)
            .digest('hex');

        // Find user with valid token
        const user = await this.userModel.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });

        if (!user) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        // Hash new password
        const hashedPassword = await PasswordUtil.hash(resetPasswordDto.password);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = null as any;
        user.resetPasswordExpires = null as any;
        await user.save();

        return {
            message: 'Password has been reset successfully',
        };
    }

    /**
     * Verify JWT token
     */
    async verifyToken(token: string) {
        try {
            const payload = this.jwtService.verify(token);
            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
