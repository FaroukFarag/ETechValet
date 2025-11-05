// src/modules/partners/application/services/partner.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationsTemplateRepository } from '../../infrastructure/data/repositories/notifications-template.repository';
import { NotificationsTemplate } from '../../domain/models/notifications-template.model';
import { BaseService } from 'src/shared/application/services/base.service';
import { NotificationsTemplateDto } from '../dtos/notifications-template.dto';

@Injectable()
export class NotificationsTemplateService extends BaseService<
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplate,
    number
> {
    constructor(private readonly notificationTemplateRepository: NotificationsTemplateRepository) {
        super(notificationTemplateRepository);
    }
}
