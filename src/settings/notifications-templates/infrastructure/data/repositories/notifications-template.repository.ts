import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from 'src/shared/infrastructure/data/repositories/base.repository';
import { NotificationsTemplate } from 'src/settings/notifications-templates/domain/models/notifications-template.model';

@Injectable()
export class NotificationsTemplateRepository extends BaseRepository<NotificationsTemplate, number> {
  constructor(dataSource: DataSource) {
    super(dataSource, NotificationsTemplate);
  }
}
