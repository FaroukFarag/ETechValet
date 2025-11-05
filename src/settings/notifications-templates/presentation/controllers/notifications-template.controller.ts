import { Controller } from '@nestjs/common';
import { BaseController } from 'src/shared/presentation/controllers/base.controller';
import { NotificationsTemplateService } from '../../application/services/notifications-template.service';
import { NotificationsTemplate } from '../../domain/models/notifications-template.model';
import { NotificationsTemplateDto } from '../../application/dtos/notifications-template.dto';

@Controller('api/notifications-templates')
export class NotificationsTemplateController extends BaseController<
    NotificationsTemplateService,
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplateDto,
    NotificationsTemplate,
    number
> {
    constructor(private readonly notificationTemplateService: NotificationsTemplateService) {
        super(notificationTemplateService);
    }
}
