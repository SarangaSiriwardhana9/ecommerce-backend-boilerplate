@echo off
echo Installing Auth Module Dependencies...
echo.

echo Installing production dependencies...
call npm install @nestjs/config @nestjs/mongoose @nestjs/jwt @nestjs/passport passport passport-jwt passport-local bcrypt zod mongoose@8.8.4 --legacy-peer-deps

echo.
echo Installing dev dependencies...
call npm install --save-dev @types/passport-jwt @types/passport-local @types/bcrypt --legacy-peer-deps

echo.
echo Installation complete!
echo.
pause
