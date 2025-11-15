import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Pricing } from '../entities/pricing.model';
import { ReorderPricingsDto } from '../dtos/reorder-pricings.dto';
import { Site } from 'src/settings/sites/domain/models/site.model';
import { Gate } from 'src/settings/gates/domain/models/gate.model';

@Injectable()
export class PricingService {
    constructor(
        @InjectRepository(Pricing)
        private pricingRepository: Repository<Pricing>,
        @InjectRepository(Site)
        private siteRepository: Repository<Site>,
        @InjectRepository(Gate)
        private gateRepository: Repository<Gate>,
    ) { }

    // Create new pricing
    async create(pricingDto: DeepPartial<Pricing>): Promise<Pricing> {
        // Determine reference (site or gate)
        const { site, gate } = pricingDto;

        if (!site && !gate) {
            throw new BadRequestException('Pricing must belong to either a site or a gate');
        }

        // Build where condition
        const whereCondition = site
            ? { site: { id: site as any } }
            : { gate: { id: gate as any } };

        // Count current pricing items for this site/gate
        const count = await this.pricingRepository.count({ where: whereCondition });

        // Auto-assign order number
        pricingDto.order = count;

        const pricing = this.pricingRepository.create(pricingDto);
        return await this.pricingRepository.save(pricing);
    }

    // Find pricing by GateId
    async findByGate(gateId: number): Promise<Pricing[]> {
        return await this.pricingRepository.find({
            where: { gate: { id: gateId } },
            relations: ['gate']
        });
    }

    // Find by Site ID
    async findBySite(siteId: number): Promise<Pricing[]> {
        return await this.pricingRepository.find({
            where: { site: { id: siteId } },
            relations: ['site']
        });
    }

    async update(id: number, updatePricingDto: Partial<Pricing>): Promise<Pricing> {
        const pricing = await this.pricingRepository.findOne({
            where: { id }
        });

        if (!pricing) {
            throw new NotFoundException(`Pricing with ID ${id} not found`);
        }

        delete updatePricingDto.order

        // Merge the changes
        const updatedPricing = this.pricingRepository.merge(pricing, updatePricingDto);

        // Save the updated entity
        return await this.pricingRepository.save(updatedPricing);
    }

    async remove(id: number) {

        const pricing = await this.pricingRepository.findOne({
            where: { id }
        });

        if (!pricing) {
            throw new NotFoundException(`Pricing with ID ${id} not found`);
        }

        return await this.pricingRepository.remove(pricing);
    }

    async reorderPricings(reorderDto: ReorderPricingsDto): Promise<void> {
        const { pricingIds, siteId, gateId } = reorderDto;

        // Verify the site or gate exists
        if (siteId) {
            const siteExists = await this.siteRepository.exists({ where: { id: siteId } });
            if (!siteExists) {
                throw new NotFoundException(`Site with ID ${siteId} not found`);
            }
        } else {
            const gateExists = await this.gateRepository.exists({ where: { id: gateId } });
            if (!gateExists) {
                throw new NotFoundException(`Gate with ID ${gateId} not found`);
            }
        }

        const whereCondition = siteId ? { site: { id: siteId } } : { gate: { id: gateId } };

        const existingPricings = await this.pricingRepository.find({
            where: whereCondition,
            select: ['id'],
            order: { order: 'ASC' }
        });

        const existingPricingIds = existingPricings.map(p => p.id);

        // Validate that all provided pricing IDs belong to the site/gate
        const invalidPricingIds = pricingIds.filter(id => !existingPricingIds.includes(id));
        if (invalidPricingIds.length > 0) {
            const referenceType = siteId ? 'site' : 'gate';
            const referenceId = siteId || gateId;
            throw new BadRequestException(
                `Pricing IDs [${invalidPricingIds.join(', ')}] do not belong to ${referenceType} ${referenceId}`
            );
        }

        // Validate that we're reordering all pricings (not a subset)
        if (pricingIds.length !== existingPricingIds.length) {
            throw new BadRequestException(
                'Must include all pricing records for this reference in the new order'
            );
        }

        // Validate no Duplicate Ids
        const uniqueIds = new Set(pricingIds);
        if (uniqueIds.size !== pricingIds.length) {
            throw new BadRequestException('Duplicate pricing IDs found in the request');
        }

        // Update displayOrder in a transaction
        await this.pricingRepository.manager.transaction(async (entityManager) => {
            for (let newOrder = 0; newOrder < pricingIds.length; newOrder++) {
                await entityManager.update(
                    Pricing,
                    { id: pricingIds[newOrder] },
                    { order: newOrder }
                );
            }
        });
    }

    async getOrderedPricings(reference: { siteId?: number; gateId?: number }): Promise<Pricing[]> {
        const { siteId, gateId } = reference;

        if (!siteId && !gateId) {
            throw new BadRequestException('Either siteId or gateId must be provided');
        }

        const whereCondition = siteId
            ? { site: { id: siteId } }
            : { gate: { id: gateId } };

        return await this.pricingRepository.find({
            where: whereCondition,
            relations: ['site', 'gate'],
            order: { order: 'ASC', createdAt: "ASC" }
        });
    }

    async getPricingOrder(reference: { siteId?: number; gateId?: number }): Promise<number[]> {
        const pricings = await this.getOrderedPricings(reference);
        return pricings.map(p => p.id);
    }

}