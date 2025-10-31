// src/modules/partners/infrastructure/repositories/partner.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from 'src/shared/infrastructure/data/repositories/base.repository';
import { Partner } from 'src/partners/domain/models/partner.model';

@Injectable()
export class PartnerRepository extends BaseRepository<Partner, number> {
  constructor(dataSource: DataSource) {
    super(dataSource, Partner);
  }
}
