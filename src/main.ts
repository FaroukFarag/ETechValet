import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RoleSeeder } from './settings/roles/infrastructure/seed/role.seed';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const roleSeeder = app.get(RoleSeeder);
  
  await roleSeeder.seed();

  app.useStaticAssets(join(__dirname, 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
