import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './domain/models/partner.model';
import { PartnerController } from './presentation/controllers/partner.controller';
import { PartnerService } from './application/services/partner.service';
import { PartnerRepository } from './infrastructure/data/repositories/partner.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Partner])],
    controllers: [PartnerController],
    providers: [
        PartnerRepository,
        PartnerService
    ]
})
export class PartnersModule { }
