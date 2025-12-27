import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../common/pipes';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from './schemas/auth.schema';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { Public, CurrentUser } from './decorators';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Register a new user
     * POST /auth/register
     */
    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(
        @Body(new ZodValidationPipe(registerSchema)) registerDto: RegisterDto,
    ) {
        const result = await this.authService.register(registerDto);
        return {
            data: result,
            message: 'Registration successful',
        };
    }

    /**
     * Login user
     * POST /auth/login
     */
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(new ZodValidationPipe(loginSchema)) loginDto: LoginDto) {
        const result = await this.authService.login(loginDto);
        return {
            data: result,
            message: 'Login successful',
        };
    }

    /**
     * Get current user profile
     * GET /auth/me
     */
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@CurrentUser() user: any) {
        const profile = await this.authService.getProfile(user.userId);
        return {
            data: profile,
        };
    }

    /**
     * Forgot password - send reset link
     * POST /auth/forgot-password
     */
    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body(new ZodValidationPipe(forgotPasswordSchema))
        forgotPasswordDto: ForgotPasswordDto,
    ) {
        const result = await this.authService.forgotPassword(forgotPasswordDto);
        return result;
    }

    /**
     * Reset password with token
     * POST /auth/reset-password
     */
    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(
        @Body(new ZodValidationPipe(resetPasswordSchema))
        resetPasswordDto: ResetPasswordDto,
    ) {
        const result = await this.authService.resetPassword(resetPasswordDto);
        return result;
    }

    /**
     * Verify token
     * POST /auth/verify-token
     */
    @Public()
    @Post('verify-token')
    @HttpCode(HttpStatus.OK)
    async verifyToken(@Body('token') token: string) {
        const payload = await this.authService.verifyToken(token);
        return {
            data: payload,
            message: 'Token is valid',
        };
    }
}
