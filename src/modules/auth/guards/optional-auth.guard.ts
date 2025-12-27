import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
    handleRequest(err: any, user: any) {
        // Return user if exists, otherwise return null (no error thrown)
        return user || null;
    }

    canActivate(context: ExecutionContext) {
        // Always return true, but still run the JWT validation
        return super.canActivate(context) as boolean | Promise<boolean>;
    }
}
