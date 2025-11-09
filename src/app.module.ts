import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsTemplatesModule } from './settings/notifications-templates/notifications-templates.module';
import { UsersModule } from './settings/users/users.module';
import { RolesModule } from './settings/roles/roles.module';
import { UsersRolesModule } from './settings/users-roles/users-roles.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { SitesModule } from './settings/sites/sites.module';
import { GatesModule } from './settings/gates/gates.module';
import { CompaniesModule } from './settings/companies/companies.module';
import { RequestsModule } from './requests/requests.module';
import { CardsModule } from './settings/cards/cards.module';
import { ServicesModule } from './settings/services/services.module';
import { SitesServicesModule } from './settings/sites-services/sites-services.module';
import { RequestsSitesServicesModule } from './requests-sites-services/requests-sites-services.module';
import { UsersGatesModule } from './settings/users-gates/users-gates.module';

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
    CompaniesModule,
    NotificationsTemplatesModule,
    UsersModule,
    RolesModule,
    UsersRolesModule,
    SitesModule,
    GatesModule,
    CardsModule,
    ServicesModule,
    SitesServicesModule,
    RequestsSitesServicesModule,
    RequestsModule,
    UsersGatesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
