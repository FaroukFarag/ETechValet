import { Controller } from '@nestjs/common';
import { BaseController } from 'src/shared/presentation/controllers/base.controller';
import { PartnerService } from '../../application/services/partner.service';
import { Partner } from '../../domain/models/partner.model';
import { PartnerDto } from '../../application/dtos/partner.dto';

@Controller('api/partners')
export class PartnerController extends BaseController<
    PartnerService,
    PartnerDto,
    PartnerDto,
    PartnerDto,
    PartnerDto,
    Partner,
    number
> {
    constructor(protected readonly partnerService: PartnerService) {
        super(partnerService);
    }
}
