import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from './partners/partners.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { UsersRolesModule } from './users-roles/users-roles.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'ETechValet',
      autoLoadEntities: true,
      synchronize: true,
      migrationsRun: true
    }),
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PartnersModule,
    UsersModule,
    RolesModule,
    UsersRolesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
