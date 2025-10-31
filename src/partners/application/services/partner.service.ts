// src/modules/partners/application/services/partner.service.ts
import { Injectable } from '@nestjs/common';
import { PartnerRepository } from '../../infrastructure/data/repositories/partner.repository';
import { Partner } from '../../domain/models/partner.model';
import { BaseService } from 'src/shared/application/services/base.service';

import { PartnerDto } from '../dtos/partner.dto';

@Injectable()
export class PartnerService extends BaseService<
    PartnerDto,
    PartnerDto,
    PartnerDto,
    PartnerDto,
    Partner,
    number
> {
    constructor(protected readonly partnerRepository: PartnerRepository) {
        super(partnerRepository);
    }
}
