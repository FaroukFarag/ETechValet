import { Module } from '@nestjs/common';
import { UsersController } from './presentation/controllers/user.controller';
import { UserRepository } from './infrastructure/data/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { RefreshTokenRepository } from './infrastructure/data/repositories/refresh-token.repository';
import { RolesModule } from 'src/settings/roles/roles.module';
import { UsersRolesModule } from 'src/settings/users-roles/users-roles.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/models/user.model';
import { UserClaim } from './domain/models/user-claim.model';
import { RefreshToken } from './domain/models/refresh-token.model';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersGatesModule } from '../users-gates/users-gates.module';
import { ResetPasswordTokenRepository } from './infrastructure/data/repositories/reset-password-token.repository';
import { EmailService } from 'src/shared/infrastructure/email/email.service';
import { ResetPasswordToken } from './domain/models/reset-password-token.model';
import { ShiftsModule } from 'src/shifts/shifts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserClaim, RefreshToken, ResetPasswordToken]),
    RolesModule,
    UsersRolesModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<number>('JWT_EXPIRES_IN') },
      }),
    }),
    UsersGatesModule,
    ShiftsModule
  ],
  providers: [
    UserRepository,
    RefreshTokenRepository,
    ResetPasswordTokenRepository,
    UserService,
    EmailService
  ],
  controllers: [UsersController],
  exports: [UserRepository]
})
export class UsersModule { }
