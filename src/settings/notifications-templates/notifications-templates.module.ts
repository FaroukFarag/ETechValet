import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsTemplate } from './domain/models/notifications-template.model';
import { NotificationsTemplateController } from './presentation/controllers/notifications-template.controller';
import { NotificationsTemplateService } from './application/services/notifications-template.service';
import { NotificationsTemplateRepository } from './infrastructure/data/repositories/notifications-template.repository';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationsTemplate])],
    controllers: [NotificationsTemplateController],
    providers: [
        NotificationsTemplateRepository,
        NotificationsTemplateService
    ]
})
export class NotificationsTemplatesModule { }
