import { Module } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { AuthController } from '@src/auth/auth.controller';
import { UsersModule } from '@src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStragety } from '@src/auth/jwt.strategy';
import { UsersService } from '@src/users/users.service';

@Module({
  imports: [UsersModule, 
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [AuthController],
  providers: [UsersService, AuthService, JwtStragety]
})
export class AuthModule {}