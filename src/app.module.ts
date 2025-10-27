import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersModule } from './partners/partners.module';

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
    PartnersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
